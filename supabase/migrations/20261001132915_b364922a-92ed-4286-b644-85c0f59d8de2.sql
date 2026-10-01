ALTER TABLE public.public_sites
  ADD COLUMN IF NOT EXISTS about_title text,
  ADD COLUMN IF NOT EXISTS about_description text,
  ADD COLUMN IF NOT EXISTS city text,
  ADD COLUMN IF NOT EXISTS accent_color text NOT NULL DEFAULT '#22c55e',
  ADD COLUMN IF NOT EXISTS business_hours text,
  ADD COLUMN IF NOT EXISTS footer_text text;

ALTER TABLE public.vehicles
  ADD COLUMN IF NOT EXISTS transmission text,
  ADD COLUMN IF NOT EXISTS fuel_type text,
  ADD COLUMN IF NOT EXISTS catalog_order integer NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS vehicles_catalog_order_idx
  ON public.vehicles (user_id, catalog_order, created_at);

COMMENT ON COLUMN public.public_sites.business_hours IS 'Horário de atendimento exibido no catálogo público.';
COMMENT ON COLUMN public.public_sites.footer_text IS 'Texto personalizado exibido no rodapé do catálogo público.';