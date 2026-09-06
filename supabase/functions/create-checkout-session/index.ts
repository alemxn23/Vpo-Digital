import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Stripe from 'https://esm.sh/stripe@14.14.0'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') as string, {
    apiVersion: '2023-10-16',
})

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

        const { priceId, mode, successUrl, cancelUrl, credits } = await req.json()
        const checkoutMode = mode || 'payment'; // payment (créditos por VPO) o subscription (mensual ilimitado)

        // Create checkout session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            mode: checkoutMode,
            success_url: successUrl,
            cancel_url: cancelUrl,
            client_reference_id: user.id, // Identifica al usuario en el webhook (checkout.session.completed)
            customer_email: user.email,
            metadata: {
                credits: credits ? Number(credits) : 0,
                supabase_user_id: user.id,
            },
            // Para suscripciones, eventos futuros (renovación, cancelación) llegan como
            // customer.subscription.* SIN client_reference_id — se necesita el user id
            // guardado en la propia suscripción para poder resolver a qué perfil pertenece.
            ...(checkoutMode === 'subscription' ? {
                subscription_data: {
                    metadata: { supabase_user_id: user.id }
                }
            } : {})
        })

        return new Response(
            JSON.stringify({ sessionId: session.id, url: session.url }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            }
        )
    } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        })
    }
})
