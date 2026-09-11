import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Stripe from 'https://esm.sh/stripe@14.14.0'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { ACTIVE_SUBSCRIPTION_STATUSES, getCatalogItem } from '../_shared/stripe-catalog.ts'

const stripeWebhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET') as string;
const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') as string, {
    apiVersion: '2023-10-16',
})

// ─── Helpers ────────────────────────────────────────────────────────────────

// Busca un usuario de auth por email recorriendo TODAS las páginas.
// `listUsers()` sin argumentos devuelve sólo la primera página (50 usuarios):
// a partir del usuario 51 los pagos vía Payment Link dejaban de acreditarse.
async function findUserIdByEmail(supabase: any, email: string): Promise<string | null> {
    const target = email.trim().toLowerCase();
    const perPage = 200;
    for (let page = 1; page <= 50; page++) { // tope de seguridad: 10,000 usuarios
        const { data, error } = await supabase.auth.admin.listUsers({ page, perPage });
        if (error) { console.error('listUsers error:', error.message); return null; }
        const users = data?.users ?? [];
        const match = users.find((u: any) => (u.email ?? '').toLowerCase() === target);
        if (match) return match.id;
        if (users.length < perPage) break;
    }
    return null;
}

// Resuelve el user_id de Supabase asociado a una sesión de checkout:
// 1) client_reference_id / metadata (viene de create-checkout-session)
// 2) email del cliente (fallback para Payment Links directos de Stripe)
async function resolveUserId(supabase: any, session: any): Promise<string | null> {
    const direct: string | null = session.client_reference_id || session.metadata?.supabase_user_id || null;
    if (direct) return direct;

    const email = session.customer_email || session.customer_details?.email;
    if (!email) return null;

    const userId = await findUserIdByEmail(supabase, email);
    if (userId) console.log(`Resolved user by email: ${email} → ${userId}`);
    return userId;
}

// Créditos a acreditar: SIEMPRE desde los line items reales de la sesión,
// resueltos contra el catálogo del servidor. Nunca desde session.metadata.credits
// (ese valor lo escribía el cliente y era manipulable).
async function resolveCreditsFromLineItems(sessionId: string): Promise<number> {
    let credits = 0;
    const lineItems = await stripe.checkout.sessions.listLineItems(sessionId, { limit: 100 });
    for (const li of lineItems.data) {
        const item = getCatalogItem(li.price?.id);
        if (item && item.mode === 'payment') {
            credits += item.credits * (li.quantity || 1);
        } else {
            console.warn(`Line item with unknown/non-credit price ignored: ${li.price?.id}`);
        }
    }
    return credits;
}

const ok = (extra: Record<string, unknown> = {}) =>
    new Response(JSON.stringify({ received: true, ...extra }), { status: 200 });

// ─── Handler ────────────────────────────────────────────────────────────────

serve(async (req) => {
    const signature = req.headers.get('stripe-signature')

    if (!signature) {
        return new Response('No signature', { status: 400 })
    }

    try {
        const body = await req.text()

        // Validar firma del webhook
        let event;
        try {
            event = stripe.webhooks.constructEvent(body, signature, stripeWebhookSecret);
        } catch (err: any) {
            console.error(`Webhook signature verification failed:`, err.message);
            return new Response(err.message, { status: 400 });
        }

        // Supabase con Service Role para bypasear RLS
        const supabase = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        // ── SUSCRIPCIÓN MENSUAL ILIMITADA: alta ─────────────────────────────────
        if (event.type === 'checkout.session.completed' && (event.data.object as any).mode === 'subscription') {
            const session = event.data.object as any;
            const userId = await resolveUserId(supabase, session);

            if (!userId) {
                // Se devuelve 200 para que Stripe no reintente; el evento
                // customer.subscription.updated tiene un fallback por metadata (abajo).
                console.error('Could not resolve user for subscription checkout:', session.id);
                return ok({ warning: 'user not found, subscription not activated' });
            }

            const { error: subError } = await supabase.from('profiles').update({
                plan_type: 'unlimited',
                stripe_customer_id: session.customer,
                stripe_subscription_id: session.subscription,
                subscription_status: 'active',
            }).eq('id', userId);

            if (subError) {
                console.error('Error activating subscription:', subError);
                throw subError;
            }

            console.log(`✅ User ${userId} activated monthly unlimited subscription ${session.subscription}.`);
            return ok();
        }

        // ── SUSCRIPCIÓN MENSUAL ILIMITADA: renovación / cancelación / pago fallido ──
        if (event.type === 'customer.subscription.updated' || event.type === 'customer.subscription.deleted') {
            const subscription = event.data.object as any;
            const status = subscription.status as string; // active, trialing, past_due, unpaid, canceled, incomplete_expired...
            const isActive = event.type === 'customer.subscription.updated' && ACTIVE_SUBSCRIPTION_STATUSES.has(status);
            const newStatus = event.type === 'customer.subscription.deleted' ? 'canceled' : status;

            // Filtrado por stripe_subscription_id: SOLO afecta al perfil dueño de esta suscripción exacta.
            // Un VIP otorgado manualmente por un admin tiene stripe_subscription_id = NULL y nunca es tocado aquí.
            const { data: updated, error: lifecycleError } = await supabase
                .from('profiles')
                .update({
                    plan_type: isActive ? 'unlimited' : 'free',
                    subscription_status: newStatus,
                })
                .eq('stripe_subscription_id', subscription.id)
                .select('id');

            if (lifecycleError) {
                console.error('Error updating subscription lifecycle:', lifecycleError);
                throw lifecycleError;
            }

            // Fallback: si ningún perfil tiene esta suscripción registrada (p. ej. el
            // checkout.session.completed falló o llegó después), usamos el user id que
            // create-checkout-session guardó en la metadata de la propia suscripción.
            // Así un pago cobrado nunca se queda sin activar.
            if ((updated?.length ?? 0) === 0 && isActive) {
                const metaUserId: string | undefined = subscription.metadata?.supabase_user_id;
                if (metaUserId) {
                    const { error: fallbackError } = await supabase.from('profiles').update({
                        plan_type: 'unlimited',
                        stripe_customer_id: subscription.customer,
                        stripe_subscription_id: subscription.id,
                        subscription_status: newStatus,
                    }).eq('id', metaUserId);
                    if (fallbackError) {
                        console.error('Error activating subscription via metadata fallback:', fallbackError);
                        throw fallbackError;
                    }
                    console.log(`✅ Subscription ${subscription.id} linked to user ${metaUserId} via metadata fallback.`);
                    return ok({ note: 'activated via metadata fallback' });
                }
                console.warn(`Subscription ${subscription.id} matched no profile and has no supabase_user_id metadata.`);
            }

            console.log(`Subscription ${subscription.id} (${event.type}, status=${status}) → plan_type=${isActive ? 'unlimited' : 'free'} for ${updated?.length ?? 0} profile(s).`);
            return ok();
        }

        // ── PAQUETES DE CRÉDITOS (pago único) ────────────────────────────────────
        if (event.type === 'checkout.session.completed') {
            const session = event.data.object as any;

            if (session.mode !== 'payment') {
                console.log(`Ignoring event mode: ${session.mode}`);
                return ok();
            }
            if (session.payment_status && session.payment_status !== 'paid') {
                console.log(`Session ${session.id} not paid yet (${session.payment_status}). Skipping.`);
                return ok({ note: 'not paid' });
            }

            // ── PASO 1: Créditos según los line items reales + catálogo del servidor ──
            const creditsToAdd = await resolveCreditsFromLineItems(session.id);

            if (creditsToAdd === 0) {
                console.log(`No credits to add for session ${session.id}. Skipping.`);
                return ok({ note: 'no credits resolved' });
            }

            // ── PASO 2: Determinar a qué usuario acreditar ─────────────────────
            const userId = await resolveUserId(supabase, session);

            if (!userId) {
                console.error('Could not resolve user for session:', session.id);
                // No lanzar error — devolver 200 para que Stripe no reintente
                return ok({ warning: 'user not found, credits not applied' });
            }

            // ── PASO 3: Idempotencia — registrar el pago ANTES de acreditar ────────
            // stripe_session_id es UNIQUE: si Stripe reintenta el evento (o llegan dos
            // en paralelo), el segundo insert falla con 23505 y no se duplican créditos.
            const { error: insertError } = await supabase.from('stripe_payments').insert({
                stripe_session_id: session.id,
                user_id: userId,
                credits_added: creditsToAdd,
                amount_total: session.amount_total,
                currency: session.currency,
                customer_email: session.customer_email || session.customer_details?.email,
                created_at: new Date().toISOString(),
            });

            if (insertError) {
                if (insertError.code === '23505') {
                    console.log(`Duplicate event for session ${session.id}. Ignoring.`);
                    return ok({ note: 'duplicate' });
                }
                console.error('Error logging payment:', insertError);
                throw insertError; // 400 → Stripe reintenta; nada se acreditó aún
            }

            // ── PASO 4: Acreditar créditos al perfil ───────────────────────────
            // Si algo falla aquí, se borra el registro del PASO 3 antes de propagar el
            // error, para que el reintento de Stripe no sea tratado como duplicado.
            const rollbackPaymentLog = async () => {
                await supabase.from('stripe_payments').delete().eq('stripe_session_id', session.id);
            };

            const { data: profile, error: fetchError } = await supabase
                .from('profiles')
                .select('paid_credits')
                .eq('id', userId)
                .single();

            if (fetchError) {
                console.error('Error fetching profile:', fetchError);
                await rollbackPaymentLog();
                throw fetchError;
            }

            const currentCredits = profile?.paid_credits || 0;
            const newCredits = currentCredits + creditsToAdd;

            const { error: updateError } = await supabase
                .from('profiles')
                .update({ paid_credits: newCredits })
                .eq('id', userId);

            if (updateError) {
                console.error('Error updating paid credits:', updateError);
                await rollbackPaymentLog();
                throw updateError;
            }

            console.log(`✅ User ${userId} credited ${creditsToAdd} VPOs. New balance: ${newCredits} credits.`);
        }

        return ok();

    } catch (error: any) {
        console.error('Webhook error:', error);
        return new Response(JSON.stringify({ error: error.message }), { status: 400 })
    }
})
