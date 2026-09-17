UPDATE public.profiles
SET role = 'admin'::public.app_role,
    updated_at = now()
WHERE id IN (
  SELECT id FROM auth.users WHERE lower(email) = lower('contatolfprodutos@gmail.com')
)
AND lower(email) = lower('contatolfprodutos@gmail.com')
AND role IS DISTINCT FROM 'admin'::public.app_role;

UPDATE auth.users
SET email_confirmed_at = COALESCE(email_confirmed_at, now()),
    confirmed_at = COALESCE(confirmed_at, now()),
    updated_at = now()
WHERE lower(email) = lower('contatolfprodutos@gmail.com');
