-- Enable admins to query all stripe payments
DROP POLICY IF EXISTS "Admins can view all payments" ON public.stripe_payments;

CREATE POLICY "Admins can view all payments"
ON public.stripe_payments FOR SELECT
USING (auth.email() = 'mcfidel98@gmail.com');
