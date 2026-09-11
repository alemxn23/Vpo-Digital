import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Stripe from 'https://esm.sh/stripe@14.14.0'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { getCatalogItem } from '../_shared/stripe-catalog.ts'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') as string, {
    apiVersion: '2023-10-16',
})

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const jsonResponse = (body: unknown, status: number) =>
    new Response(JSON.stringify(body), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status,
    })

// Sólo permitimos redirigir de vuelta a orígenes conocidos. Si APP_ALLOWED_ORIGINS
// no está configurado (p. ej. entorno local), se acepta cualquier https:// para no
// romper el flujo, pero en producción conviene fijarlo: "https://vpo.mx,https://www.vpo.mx".
const isAllowedRedirect = (url: unknown): url is string => {
    if (typeof url !== 'string') return false;
    let parsed: URL;
    try { parsed = new URL(url); } catch { return false; }
    const allowed = (Deno.env.get('APP_ALLOWED_ORIGINS') ?? '')
        .split(',').map(s => s.trim()).filter(Boolean);
    if (allowed.length === 0) return parsed.protocol === 'https:' || parsed.hostname === 'localhost';
    return allowed.includes(parsed.origin);
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const authHeader = req.headers.get('Authorization')
        if (!authHeader) throw new Error('No authorization header')

        const supabase = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_ANON_KEY') ?? '',
            { global: { headers: { Authorization: authHeader } } }
        )

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            throw new Error('Not logged in')
        }

        // El cliente sólo elige QUÉ producto (priceId). Créditos y modo salen del catálogo.
        // `credits` y `mode` del body se ignoran deliberadamente (ver _shared/stripe-catalog.ts).
        const { priceId, successUrl, cancelUrl } = await req.json()

        const item = getCatalogItem(priceId)
        if (!item) {
            return jsonResponse({ error: 'Producto no disponible' }, 400)
        }
        if (!isAllowedRedirect(successUrl) || !isAllowedRedirect(cancelUrl)) {
            return jsonResponse({ error: 'URL de retorno no permitida' }, 400)
        }

        // Reutilizar el customer de Stripe si el perfil ya tiene uno (evita un customer
        // nuevo por cada checkout y mantiene el historial de facturación unido).
        const { data: profile } = await supabase
            .from('profiles')
            .select('stripe_customer_id')
            .eq('id', user.id)
            .maybeSingle()
        const existingCustomerId: string | null = profile?.stripe_customer_id ?? null

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{ price: priceId, quantity: 1 }],
            mode: item.mode,
            success_url: successUrl,
            cancel_url: cancelUrl,
            client_reference_id: user.id, // Identifica al usuario en el webhook (checkout.session.completed)
            ...(existingCustomerId
                ? { customer: existingCustomerId }
                : { customer_email: user.email }),
            metadata: {
                supabase_user_id: user.id,
                catalog_label: item.label,
            },
            // Para suscripciones, eventos futuros (renovación, cancelación) llegan como
            // customer.subscription.* SIN client_reference_id — se necesita el user id
            // guardado en la propia suscripción para poder resolver a qué perfil pertenece.
            ...(item.mode === 'subscription' ? {
                subscription_data: {
                    metadata: { supabase_user_id: user.id }
                }
            } : {})
        })

        return jsonResponse({ sessionId: session.id, url: session.url }, 200)
    } catch (error: any) {
        return jsonResponse({ error: error.message }, 400)
    }
})
