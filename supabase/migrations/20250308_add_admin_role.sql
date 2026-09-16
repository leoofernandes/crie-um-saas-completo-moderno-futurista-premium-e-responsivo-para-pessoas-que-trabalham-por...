-- Adiciona o papel administrativo aos perfis sem armazenar credenciais no banco.
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS role text NOT NULL DEFAULT 'user';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'profiles_role_check'
      AND conrelid = 'public.profiles'::regclass
  ) THEN
    ALTER TABLE public.profiles
      ADD CONSTRAINT profiles_role_check CHECK (role IN ('user', 'admin'));
  END IF;
END $$;

-- Mantém o RLS existente e permite ao próprio usuário consultar seu perfil.
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'profiles'
      AND policyname = 'Users can read their own profile'
  ) THEN
    CREATE POLICY "Users can read their own profile"
      ON public.profiles FOR SELECT
      USING (auth.uid() = id);
  END IF;
END $$;

-- A promoção deve ser executada após a conta existir no Auth.
UPDATE public.profiles
SET role = 'admin'
WHERE lower(email) = lower('contatolfprodutos@gmail.com');

SELECT id, email, role
FROM public.profiles
WHERE lower(email) = lower('contatolfprodutos@gmail.com');
