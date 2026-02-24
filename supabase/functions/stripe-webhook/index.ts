import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Stripe from 'https://esm.sh/stripe@14.14.0'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const stripeWebhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET') as string;
const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') as string, {
    apiVersion: '2023-10-16',
})

// Webhook needs raw body text to verify signature
serve(async (req) => {
    const signature = req.headers.get('stripe-signature')

    if (!signature) {
        return new Response('No signature', { status: 400 })
    }

    try {
        const body = await req.text()

        // Validate the signature
        let event;
        try {
            event = stripe.webhooks.constructEvent(body, signature, stripeWebhookSecret);
        } catch (err: any) {
            console.error(`Webhook signature verification failed.`, err.message);
            return new Response(err.message, { status: 400 });
        }

        // Initialize Supabase Client with Service Role. 
        // This allows bypassing RLS to update user credits/plan without needing an active user session context
        const supabase = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        if (event.type === 'checkout.session.completed') {
            const session = event.data.object;
            const userId = session.client_reference_id;

            if (!userId) {
                throw new Error('No user_id found in session client_reference_id');
            }

            // Check mode to see if it's a subscription or a one-time payment for 10 VPOs
            const mode = session.mode; // 'subscription' or 'payment'

            if (mode === 'subscription') {
                const { error } = await supabase
                    .from('profiles')
                    .update({ plan_type: 'unlimited' })
                    .eq('id', userId);

                if (error) {
                    console.error('Error updating profile plan_type to unlimited:', error);
                    throw error;
                }
                console.log(`User ${userId} upgraded to unlimited plan successfully.`);
            } else if (mode === 'payment') {
                // Paquete de 10 VPOs
                // Re-read current paid_credits to increment
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
                const newCredits = currentCredits + 10;

                const { error: updateError } = await supabase
                    .from('profiles')
                    .update({ paid_credits: newCredits })
                    .eq('id', userId);

                if (updateError) {
                    console.error('Error updating paid credits:', updateError);
                    throw updateError;
                }
                console.log(`User ${userId} acquired 10 VPOs successfully. New balance: ${newCredits}.`);
            }
        }

        return new Response(JSON.stringify({ received: true }), { status: 200 })
    } catch (error: any) {
        console.error(error);
        return new Response(JSON.stringify({ error: error.message }), { status: 400 })
    }
})
