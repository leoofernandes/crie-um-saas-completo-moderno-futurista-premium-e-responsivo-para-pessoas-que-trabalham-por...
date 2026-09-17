-- Migration criada automaticamente pelo LOV3 em 2026-09-17T12:08:31.998Z
DO $$ BEGIN CREATE TYPE public.app_role AS ENUM ('user', 'admin'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role public.app_role NOT NULL DEFAULT 'user';
UPDATE public.profiles p SET role = 'admin'::public.app_role, updated_at = now() FROM auth.users u WHERE u.id = p.id AND lower(u.email) = lower('contatolfprodutos@gmail.com');