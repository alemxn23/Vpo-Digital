import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Stripe from 'https://esm.sh/stripe@14.14.0'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const stripeWebhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET') as string;
const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') as string, {
    apiVersion: '2023-10-16',
})

// Mapa de priceId → créditos (para Payment Links que no envían metadata)
const PRICE_CREDITS_MAP: Record<string, number> = {
    'price_1T4HWkKtp6JiUcWzTNSg9D8h': 5,   // Starter: 5 VPOs $250 MXN
    'price_1T4HX1Ktp6JiUcWzb6Jm2Utk': 10,  // Pro: 10 VPOs $400 MXN
};

// Resuelve el user_id de Supabase asociado a una sesión de checkout:
// 1) client_reference_id / metadata (viene de create-checkout-session)
// 2) email del cliente (fallback para Payment Links directos de Stripe)
async function resolveUserId(supabase: any, session: any): Promise<string | null> {
    let userId: string | null = session.client_reference_id || session.metadata?.supabase_user_id || null;
    if (userId) return userId;

    const email = session.customer_email || session.customer_details?.email;
    if (!email) return null;

    const { data: userList } = await supabase.auth.admin.listUsers();
    const matchedUser = userList?.users?.find((u: any) => u.email === email);
    return matchedUser?.id ?? null;
}

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
                console.error('Could not resolve user for subscription checkout:', session.id);
                return new Response(
                    JSON.stringify({ received: true, warning: 'user not found, subscription not activated' }),
                    { status: 200 }
                );
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
            return new Response(JSON.stringify({ received: true }), { status: 200 })
        }

        // ── SUSCRIPCIÓN MENSUAL ILIMITADA: renovación / cancelación / pago fallido ──
        if (event.type === 'customer.subscription.updated' || event.type === 'customer.subscription.deleted') {
            const subscription = event.data.object as any;
            const status = subscription.status as string; // active, trialing, past_due, unpaid, canceled, incomplete_expired...
            const isActive = event.type === 'customer.subscription.updated' && (status === 'active' || status === 'trialing');

            // Filtrado por stripe_subscription_id: SOLO afecta al perfil dueño de esta suscripción exacta.
            // Un VIP otorgado manualmente por un admin tiene stripe_subscription_id = NULL y nunca es tocado aquí.
            const { data: updated, error: lifecycleError } = await supabase
                .from('profiles')
                .update({
                    plan_type: isActive ? 'unlimited' : 'free',
                    subscription_status: event.type === 'customer.subscription.deleted' ? 'canceled' : status,
                })
                .eq('stripe_subscription_id', subscription.id)
                .select('id');

            if (lifecycleError) {
                console.error('Error updating subscription lifecycle:', lifecycleError);
                throw lifecycleError;
            }

            console.log(`Subscription ${subscription.id} (${event.type}, status=${status}) → plan_type=${isActive ? 'unlimited' : 'free'} for ${updated?.length ?? 0} profile(s).`);
            return new Response(JSON.stringify({ received: true }), { status: 200 })
        }

        if (event.type === 'checkout.session.completed') {
            const session = event.data.object as any;
            const mode = session.mode;

            if (mode !== 'payment') {
                console.log(`Ignoring event mode: ${mode}`);
                return new Response(JSON.stringify({ received: true }), { status: 200 })
            }

            // ── PASO 1: Determinar cuántos créditos acreditar ──────────────────
            let creditsToAdd = 0;

            // Método A: metadata.credits (viene de la Edge Function create-checkout-session)
            if (session.metadata?.credits) {
                creditsToAdd = Number(session.metadata.credits);
            }

            // Método B: inferir créditos desde los line items (Payment Links)
            if (creditsToAdd === 0) {
                try {
                    const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
                    for (const item of lineItems.data) {
                        const priceId = item.price?.id;
                        if (priceId && PRICE_CREDITS_MAP[priceId]) {
                            creditsToAdd += PRICE_CREDITS_MAP[priceId] * (item.quantity || 1);
                        }
                    }
                } catch (e: any) {
                    console.error('Error fetching line items:', e.message);
                }
            }

            if (creditsToAdd === 0) {
                console.log(`No credits to add for session ${session.id}. Skipping.`);
                return new Response(JSON.stringify({ received: true, note: 'no credits resolved' }), { status: 200 })
            }

            // ── PASO 2: Determinar a qué usuario acreditar ─────────────────────
            const userId = await resolveUserId(supabase, session);

            if (!userId) {
                console.error('Could not resolve user for session:', session.id);
                // No lanzar error — devolver 200 para que Stripe no reintente
                return new Response(
                    JSON.stringify({ received: true, warning: 'user not found, credits not applied' }),
                    { status: 200 }
                );
            }

            // ── PASO 3: Verificar que no sea un pago duplicado ─────────────────
            const { data: existingPayment } = await supabase
                .from('stripe_payments')
                .select('id')
                .eq('stripe_session_id', session.id)
                .maybeSingle();

            if (existingPayment) {
                console.log(`Duplicate event for session ${session.id}. Ignoring.`);
                return new Response(JSON.stringify({ received: true, note: 'duplicate' }), { status: 200 })
            }

            // ── PASO 4: Acreditar créditos al perfil ───────────────────────────
            const { data: profile, error: fetchError } = await supabase
                .from('profiles')
                .select('paid_credits')
                .eq('id', userId)
                .single();

            if (fetchError) {
                console.error('Error fetching profile:', fetchError);
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
                throw updateError;
            }

            // ── PASO 5: Registrar el pago (evitar duplicados futuros) ──────────
            await supabase.from('stripe_payments').insert({
                stripe_session_id: session.id,
                user_id: userId,
                credits_added: creditsToAdd,
                amount_total: session.amount_total,
                currency: session.currency,
                customer_email: session.customer_email || session.customer_details?.email,
                created_at: new Date().toISOString(),
            }).then(({ error }) => {
                if (error) console.warn('Could not log payment (table may not exist):', error.message);
            });

            console.log(`✅ User ${userId} credited ${creditsToAdd} VPOs. New balance: ${newCredits} credits.`);
        }

        return new Response(JSON.stringify({ received: true }), { status: 200 })

    } catch (error: any) {
        console.error('Webhook error:', error);
        return new Response(JSON.stringify({ error: error.message }), { status: 400 })
    }
})
