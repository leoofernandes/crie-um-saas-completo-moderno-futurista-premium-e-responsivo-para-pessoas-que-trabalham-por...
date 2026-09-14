-- ENUMS
CREATE TYPE public.vehicle_status AS ENUM ('disponivel','alugado','reservado','manutencao','inativo');
CREATE TYPE public.rental_periodicity AS ENUM ('semanal','quinzenal','mensal','personalizada');
CREATE TYPE public.rental_status AS ENUM ('ativo','encerrado','cancelado');
CREATE TYPE public.payment_status AS ENUM ('pago','pendente','atrasado','cancelado');
CREATE TYPE public.subscription_status AS ENUM ('trial','ativo','pagamento_pendente','cancelado','expirado');
CREATE TYPE public.lead_status AS ENUM ('novo','em_atendimento','alugado','sem_interesse');

-- updated_at helper
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$
LANGUAGE plpgsql SET search_path = public;

-- PROFILES
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  whatsapp TEXT,
  fleet_size_range TEXT,
  onboarding_done BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, whatsapp)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', NEW.email, NEW.raw_user_meta_data->>'whatsapp')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END; $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- APP SETTINGS (trial days etc.)
CREATE TABLE public.app_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.app_settings TO anon, authenticated;
GRANT ALL ON public.app_settings TO service_role;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "settings_public_read" ON public.app_settings FOR SELECT TO anon, authenticated USING (true);
INSERT INTO public.app_settings (key, value) VALUES ('trial_days', '7'::jsonb), ('currency', '"BRL"'::jsonb);

-- PLANS
CREATE TABLE public.plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  tagline TEXT,
  vehicle_limit INTEGER,
  price_monthly_cents INTEGER,
  price_yearly_cents INTEGER,
  features JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_custom BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.plans TO anon, authenticated;
GRANT ALL ON public.plans TO service_role;
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "plans_public_read" ON public.plans FOR SELECT TO anon, authenticated USING (is_active);
CREATE TRIGGER trg_plans_updated BEFORE UPDATE ON public.plans FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.plans (code, name, tagline, vehicle_limit, price_monthly_cents, price_yearly_cents, features, is_custom, sort_order) VALUES
('start','START','Para quem está começando', 5, 4900, 49000, '["Até 5 veículos","Clientes ilimitados","Aluguéis e contratos","Controle de pagamentos","Manutenções","Despesas","Mini-site personalizado","Relatórios essenciais","Notificações","Suporte por e-mail"]'::jsonb, false, 1),
('pro','PRO','Para frotas em crescimento', 20, 9900, 99000, '["Até 20 veículos","Clientes ilimitados","Aluguéis e contratos","Controle de pagamentos","Manutenções","Despesas","Mini-site personalizado","Relatórios completos","Notificações","Suporte prioritário"]'::jsonb, false, 2),
('frota','FROTA','Operação consolidada', 50, 19900, 199000, '["Até 50 veículos","Clientes ilimitados","Aluguéis e contratos","Controle de pagamentos","Manutenções","Despesas","Mini-site personalizado","Relatórios avançados","Notificações","Suporte prioritário"]'::jsonb, false, 3),
('frota_plus','FROTA+','Alto volume', 100, 34900, 349000, '["Até 100 veículos","Clientes ilimitados","Aluguéis e contratos","Controle de pagamentos","Manutenções","Despesas","Mini-site personalizado","Relatórios avançados","Notificações","Suporte dedicado"]'::jsonb, false, 4),
('personalizado','PERSONALIZADO','Mais de 100 veículos', NULL, NULL, NULL, '["Veículos ilimitados","Clientes ilimitados","Aluguéis e contratos","Controle de pagamentos","Manutenções","Despesas","Mini-site personalizado","Relatórios sob medida","Notificações","Suporte dedicado"]'::jsonb, true, 5);

-- SUBSCRIPTIONS
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  plan_id UUID REFERENCES public.plans(id),
  status public.subscription_status NOT NULL DEFAULT 'trial',
  billing_period TEXT NOT NULL DEFAULT 'mensal',
  vehicle_limit INTEGER,
  trial_ends_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  renews_at TIMESTAMPTZ,
  provider TEXT,
  provider_ref TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX subscriptions_user_unique ON public.subscriptions(user_id);
GRANT SELECT, INSERT, UPDATE ON public.subscriptions TO authenticated;
GRANT ALL ON public.subscriptions TO service_role;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "subs_select_own" ON public.subscriptions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "subs_insert_own" ON public.subscriptions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "subs_update_own" ON public.subscriptions FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER trg_subs_updated BEFORE UPDATE ON public.subscriptions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- PUBLIC SITES
CREATE TABLE public.public_sites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users ON DELETE CASCADE,
  slug TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL DEFAULT 'Meu catálogo',
  description TEXT,
  logo_url TEXT,
  banner_url TEXT,
  banner_position NUMERIC NOT NULL DEFAULT 50,
  hero_title TEXT,
  hero_subtitle TEXT,
  whatsapp TEXT,
  instagram TEXT,
  is_published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT slug_format CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' AND length(slug) BETWEEN 3 AND 40)
);
GRANT SELECT ON public.public_sites TO anon;
GRANT SELECT, INSERT, UPDATE ON public.public_sites TO authenticated;
GRANT ALL ON public.public_sites TO service_role;
ALTER TABLE public.public_sites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "sites_public_read" ON public.public_sites FOR SELECT TO anon, authenticated USING (is_published);
CREATE POLICY "sites_select_own" ON public.public_sites FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "sites_insert_own" ON public.public_sites FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "sites_update_own" ON public.public_sites FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER trg_sites_updated BEFORE UPDATE ON public.public_sites FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- CUSTOMERS
CREATE TABLE public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  name TEXT NOT NULL,
  cpf TEXT,
  whatsapp TEXT,
  email TEXT,
  address TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX customers_user_idx ON public.customers(user_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.customers TO authenticated;
GRANT ALL ON public.customers TO service_role;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "customers_own" ON public.customers FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER trg_customers_updated BEFORE UPDATE ON public.customers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- VEHICLES
CREATE TABLE public.vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER,
  plate TEXT,
  color TEXT,
  category TEXT,
  mileage INTEGER,
  rental_price_cents INTEGER NOT NULL DEFAULT 0,
  rental_periodicity public.rental_periodicity NOT NULL DEFAULT 'semanal',
  status public.vehicle_status NOT NULL DEFAULT 'disponivel',
  description TEXT,
  features TEXT[] NOT NULL DEFAULT '{}',
  show_in_catalog BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX vehicles_user_idx ON public.vehicles(user_id);
GRANT SELECT ON public.vehicles TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.vehicles TO authenticated;
GRANT ALL ON public.vehicles TO service_role;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "vehicles_own" ON public.vehicles FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "vehicles_public_read" ON public.vehicles FOR SELECT TO anon, authenticated USING (
  show_in_catalog AND status <> 'inativo' AND EXISTS (
    SELECT 1 FROM public.public_sites s WHERE s.user_id = vehicles.user_id AND s.is_published
  )
);
CREATE TRIGGER trg_vehicles_updated BEFORE UPDATE ON public.vehicles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- VEHICLE PHOTOS
CREATE TABLE public.vehicle_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  vehicle_id UUID NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  storage_path TEXT,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX vehicle_photos_vehicle_idx ON public.vehicle_photos(vehicle_id);
GRANT SELECT ON public.vehicle_photos TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.vehicle_photos TO authenticated;
GRANT ALL ON public.vehicle_photos TO service_role;
ALTER TABLE public.vehicle_photos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "photos_own" ON public.vehicle_photos FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "photos_public_read" ON public.vehicle_photos FOR SELECT TO anon, authenticated USING (
  EXISTS (
    SELECT 1 FROM public.vehicles v JOIN public.public_sites s ON s.user_id = v.user_id
    WHERE v.id = vehicle_photos.vehicle_id AND v.show_in_catalog AND v.status <> 'inativo' AND s.is_published
  )
);

CREATE OR REPLACE FUNCTION public.enforce_photo_limit()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF (SELECT count(*) FROM public.vehicle_photos WHERE vehicle_id = NEW.vehicle_id) >= 10 THEN
    RAISE EXCEPTION 'Limite de 10 fotos por veículo atingido';
  END IF;
  RETURN NEW;
END; $$;
CREATE TRIGGER trg_photo_limit BEFORE INSERT ON public.vehicle_photos FOR EACH ROW EXECUTE FUNCTION public.enforce_photo_limit();

-- RENTALS
CREATE TABLE public.rentals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  vehicle_id UUID NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE,
  amount_cents INTEGER NOT NULL DEFAULT 0,
  periodicity public.rental_periodicity NOT NULL DEFAULT 'semanal',
  custom_interval_days INTEGER,
  payment_day INTEGER,
  status public.rental_status NOT NULL DEFAULT 'ativo',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX rentals_user_idx ON public.rentals(user_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.rentals TO authenticated;
GRANT ALL ON public.rentals TO service_role;
ALTER TABLE public.rentals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "rentals_own" ON public.rentals FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER trg_rentals_updated BEFORE UPDATE ON public.rentals FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- PAYMENTS
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  rental_id UUID REFERENCES public.rentals(id) ON DELETE CASCADE,
  vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE SET NULL,
  customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  amount_cents INTEGER NOT NULL DEFAULT 0,
  due_date DATE NOT NULL,
  paid_at DATE,
  status public.payment_status NOT NULL DEFAULT 'pendente',
  method TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX payments_user_idx ON public.payments(user_id);
CREATE INDEX payments_due_idx ON public.payments(due_date);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.payments TO authenticated;
GRANT ALL ON public.payments TO service_role;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "payments_own" ON public.payments FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER trg_payments_updated BEFORE UPDATE ON public.payments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- MAINTENANCES
CREATE TABLE public.maintenances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  vehicle_id UUID NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  date DATE NOT NULL,
  mileage INTEGER,
  cost_cents INTEGER NOT NULL DEFAULT 0,
  description TEXT,
  next_date DATE,
  next_mileage INTEGER,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX maintenances_user_idx ON public.maintenances(user_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.maintenances TO authenticated;
GRANT ALL ON public.maintenances TO service_role;
ALTER TABLE public.maintenances ENABLE ROW LEVEL SECURITY;
CREATE POLICY "maintenances_own" ON public.maintenances FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER trg_maintenances_updated BEFORE UPDATE ON public.maintenances FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- EXPENSE CATEGORIES
CREATE TABLE public.expense_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.expense_categories TO authenticated;
GRANT ALL ON public.expense_categories TO service_role;
ALTER TABLE public.expense_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "expense_categories_own" ON public.expense_categories FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- EXPENSES
CREATE TABLE public.expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE SET NULL,
  category TEXT NOT NULL DEFAULT 'Outros',
  amount_cents INTEGER NOT NULL DEFAULT 0,
  date DATE NOT NULL DEFAULT current_date,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX expenses_user_idx ON public.expenses(user_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.expenses TO authenticated;
GRANT ALL ON public.expenses TO service_role;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "expenses_own" ON public.expenses FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER trg_expenses_updated BEFORE UPDATE ON public.expenses FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- NOTIFICATIONS
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'info',
  title TEXT NOT NULL,
  body TEXT,
  link TEXT,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX notifications_user_idx ON public.notifications(user_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "notifications_own" ON public.notifications FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- SITE LEADS
CREATE TABLE public.site_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  site_id UUID REFERENCES public.public_sites(id) ON DELETE CASCADE,
  vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  message TEXT,
  status public.lead_status NOT NULL DEFAULT 'novo',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX site_leads_user_idx ON public.site_leads(user_id);
GRANT INSERT ON public.site_leads TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_leads TO authenticated;
GRANT ALL ON public.site_leads TO service_role;
ALTER TABLE public.site_leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "leads_owner_all" ON public.site_leads FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "leads_public_insert" ON public.site_leads FOR INSERT TO anon, authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM public.public_sites s WHERE s.id = site_leads.site_id AND s.user_id = site_leads.user_id AND s.is_published)
);
CREATE TRIGGER trg_leads_updated BEFORE UPDATE ON public.site_leads FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();