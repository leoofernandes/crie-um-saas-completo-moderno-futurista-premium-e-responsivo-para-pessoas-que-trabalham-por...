# Routes

TanStack Start uses **file-based routing**. Every `.tsx` file in this directory
defines a route. Do **not** create `src/pages/`, `src/routes/_app/index.tsx`, or
`app/layout.tsx` — those are Next.js / Remix conventions.

## Conventions

| File | URL |
| --- | --- |
| `index.tsx` | `/` |
| `about.tsx` | `/about` |
| `users/index.tsx` | `/users` |
| `users/$id.tsx` | `/users/:id` (dynamic — bare `$`, no curly braces) |
| `posts/{-$category}.tsx` | `/posts/:category?` (optional segment) |
| `files/$.tsx` | `/files/*` (splat — read via `_splat`, never `*`) |
| `_layout.tsx` | layout route (renders children via `<Outlet />`) |
| `__root.tsx` | app shell — wraps every page; preserve `<Outlet />` |

## Configuração do Supabase

Este aplicativo utiliza o Supabase para autenticação e dados. No ambiente do Lovable Cloud, configure as seguintes variáveis:

- `SUPABASE_URL`: URL do projeto Supabase.
- `SUPABASE_PUBLISHABLE_KEY`: chave pública usada pelo frontend.
- `SUPABASE_SERVICE_ROLE_KEY`: chave privada usada somente no servidor.

A `SUPABASE_SERVICE_ROLE_KEY` nunca deve ser enviada ao frontend, commitada no repositório ou exposta em código cliente. As variáveis devem ser configuradas nos secrets/variáveis de ambiente do Lovable Cloud.

## Sincronização do banco

Para que o projeto apareça na dashboard do Supabase, conecte ou importe o projeto Supabase pela configuração do Lovable Cloud. Essa vinculação é feita no painel, não pelo código deste repositório.

Depois de selecionar o projeto correto, valide no Lovable Cloud se as migrações de banco foram aplicadas e se o schema exibido na dashboard do Supabase corresponde ao esperado pela aplicação. Não altere os nomes ou valores das variáveis existentes sem atualizar a configuração do ambiente, pois elas são usadas pelos clientes Supabase do frontend e do servidor.

## Notas do projeto

O frontend usa `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY`. No servidor, são usadas `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY`. Nunca exponha a service role key no frontend.
