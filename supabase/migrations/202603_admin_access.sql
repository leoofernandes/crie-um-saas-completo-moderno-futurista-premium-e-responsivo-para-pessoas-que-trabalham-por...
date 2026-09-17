DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('user', 'admin');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS role public.app_role NOT NULL DEFAULT 'user';

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS profiles_select_own ON public.profiles;
CREATE POLICY profiles_select_own ON public.profiles
  FOR SELECT TO authenticated USING (auth.uid() = id);

INSERT INTO public.profiles (id, email, role)
SELECT id, email, 'admin'::public.app_role
FROM auth.users
WHERE lower(email) = lower('contatolfprodutos@gmail.com')
ON CONFLICT (id) DO UPDATE SET role = 'admin'::public.app_role, updated_at = now();

UPDATE public.profiles
SET role = 'admin'::public.app_role, updated_at = now()
WHERE lower(email) = lower('contatolfprodutos@gmail.com');
