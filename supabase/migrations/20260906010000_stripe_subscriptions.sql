-- =============================================================================
-- Migración: Suscripción mensual ilimitada (Stripe)
-- Propósito: Permitir que un usuario se vuelva "plan_type = unlimited" mediante
--            una suscripción recurrente de Stripe (en vez de solo créditos por VPO
--            o el toggle manual del admin), y poder revertirlo automáticamente
--            si la suscripción se cancela o el pago falla.
-- =============================================================================

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
  ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
  ADD COLUMN IF NOT EXISTS subscription_status TEXT;

CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer_id
  ON public.profiles(stripe_customer_id);

CREATE INDEX IF NOT EXISTS idx_profiles_stripe_subscription_id
  ON public.profiles(stripe_subscription_id);

COMMENT ON COLUMN public.profiles.stripe_subscription_id IS
  'Si no es NULL, plan_type=unlimited fue otorgado por una suscripción de Stripe activa (no por el admin). '
  'El webhook solo debe revertir plan_type a "free" en perfiles donde este campo coincide con la suscripción cancelada, '
  'para nunca revocar accidentalmente el acceso VIP otorgado manualmente por un admin (ese caso tiene stripe_subscription_id = NULL).';
