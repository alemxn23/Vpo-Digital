-- ============================================================
-- Migration: Critical Refactoring of the Credits System & Gatekeeper
-- ============================================================

-- 1. Ensure the `role` column exists on profiles (defaulting to 'user').
-- This handles the case if it wasn't added before, allowing Rule 1.
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';

-- 2. Define the consume_vpo_credit RPC.
-- This function executes atomic validation for VPOs access strictly following
-- the cascade logic required for correctness.
CREATE OR REPLACE FUNCTION public.consume_vpo_credit()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id uuid;
  v_profile record;
  v_today date;
BEGIN
  -- Obtain authenticated user
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN false;
  END IF;

  -- Read profile and lock row to prevent race conditions
  SELECT role, plan_type, free_vpos_used_today, paid_credits, last_vpo_date 
  INTO v_profile
  FROM public.profiles
  WHERE id = v_user_id FOR UPDATE;

  IF NOT FOUND THEN
    RETURN false;
  END IF;

  -- REGLA 1: BYPASS ABSOLUTO (Admin / Ilimitado)
  -- If admin or unlimited plan, return allowed immediately.
  IF v_profile.role = 'admin' OR v_profile.plan_type = 'unlimited' THEN
    RETURN true;
  END IF;

  -- REGLA 2: MANEJO DE ZONAS HORARIAS (Fixes free daily VPOs)
  -- Set today strictly using the America/Mexico_City timezone to prevent midnight issues.
  v_today := (now() AT TIME ZONE 'America/Mexico_City')::date;

  IF v_profile.last_vpo_date IS NULL OR v_profile.last_vpo_date < v_today THEN
    -- If it's a difference date (a new day), internally reset the free_vpos_used_today to 0
    -- before moving to further validation.
    v_profile.free_vpos_used_today := 0;
  END IF;

  -- REGLA 3: CONSUMO DE VPOs GRATUITAS
  IF v_profile.free_vpos_used_today < 2 THEN
    UPDATE public.profiles
    SET free_vpos_used_today = v_profile.free_vpos_used_today + 1,
        last_vpo_date = v_today
    WHERE id = v_user_id;

    RETURN true;
  END IF;

  -- REGLA 4: CONSUMO DE VPOs DE PAGA (Créditos)
  -- At this point, free quotas are used up. Now we check for paid credits.
  IF v_profile.paid_credits > 0 THEN
    UPDATE public.profiles
    SET paid_credits = v_profile.paid_credits - 1
        -- DO NOT touch free_vpos_used_today or last_vpo_date
    WHERE id = v_user_id;

    RETURN true;
  END IF;

  -- REGLA 5: BLOQUEO (Paywall)
  -- Exhausted free quotas and 0 paid credits remaining.
  RETURN false;
END;
$$;
