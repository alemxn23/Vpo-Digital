-- Enable admins to query and manage all profiles
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can insert all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can delete all profiles" ON public.profiles;

CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT
USING (auth.email() = 'mcfidel98@gmail.com');

CREATE POLICY "Admins can update all profiles"
ON public.profiles FOR UPDATE
USING (auth.email() = 'mcfidel98@gmail.com');

CREATE POLICY "Admins can insert all profiles"
ON public.profiles FOR INSERT
WITH CHECK (auth.email() = 'mcfidel98@gmail.com');

CREATE POLICY "Admins can delete all profiles"
ON public.profiles FOR DELETE
USING (auth.email() = 'mcfidel98@gmail.com');
