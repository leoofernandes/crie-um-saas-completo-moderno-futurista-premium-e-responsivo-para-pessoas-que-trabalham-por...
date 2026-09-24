import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type Plan = Tables<"plans">;
export type Vehicle = Tables<"vehicles">;
export type VehiclePhoto = Tables<"vehicle_photos">;
export type Customer = Tables<"customers">;
export type Rental = Tables<"rentals">;
export type Payment = Tables<"payments">;
export type Maintenance = Tables<"maintenances">;
export type Expense = Tables<"expenses">;
export type PublicSite = Tables<"public_sites">;
export type SiteLead = Tables<"site_leads">;
export type Subscription = Tables<"subscriptions">;
export type Profile = Tables<"profiles">;

async function unwrap<T>(promise: PromiseLike<{ data: T | null; error: { message: string } | null }>) {
  const { data, error } = await promise;
  if (error) throw new Error(error.message);
  return (data ?? []) as T;
}

export const plansQuery = queryOptions({
  queryKey: ["plans"],
  queryFn: () =>
    unwrap<Plan[]>(supabase.from("plans").select("*").eq("is_active", true).order("sort_order")),
  staleTime: 5 * 60 * 1000,
});

export const settingsQuery = queryOptions({
  queryKey: ["app_settings"],
  queryFn: async () => {
    const rows = await unwrap<Tables<"app_settings">[]>(supabase.from("app_settings").select("*"));
    return Object.fromEntries(rows.map((row) => [row.key, row.value])) as Record<string, unknown>;
  },
  staleTime: 5 * 60 * 1000,
});

export const profileQuery = queryOptions({
  queryKey: ["profile"],
  retry: false,
  queryFn: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return null;
    const { data, error } = await supabase.from("profiles").select("*").eq("id", session.user.id).maybeSingle();
    if (error) throw new Error(error.message);
    return data as Profile | null;
  },
});

export const subscriptionQuery = queryOptions({
  queryKey: ["subscription"],
  queryFn: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const { data, error } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data;
  },
});

export const vehiclesQuery = queryOptions({
  queryKey: ["vehicles"],
  queryFn: () =>
    unwrap<(Vehicle & { vehicle_photos: VehiclePhoto[] })[]>(
      supabase
        .from("vehicles")
        .select("*, vehicle_photos(*)")
        .order("created_at", { ascending: false }),
    ),
});

export const customersQuery = queryOptions({
  queryKey: ["customers"],
  queryFn: () => unwrap<Customer[]>(supabase.from("customers").select("*").order("name")),
});

export const rentalsQuery = queryOptions({
  queryKey: ["rentals"],
  queryFn: () =>
    unwrap<(Rental & { vehicles: Vehicle | null; customers: Customer | null })[]>(
      supabase
        .from("rentals")
        .select("*, vehicles(*), customers(*)")
        .order("start_date", { ascending: false }),
    ),
});

export const paymentsQuery = queryOptions({
  queryKey: ["payments"],
  queryFn: () =>
    unwrap<(Payment & { vehicles: Vehicle | null; customers: Customer | null })[]>(
      supabase
        .from("payments")
        .select("*, vehicles(*), customers(*)")
        .order("due_date", { ascending: false }),
    ),
});

export const maintenancesQuery = queryOptions({
  queryKey: ["maintenances"],
  queryFn: () =>
    unwrap<(Maintenance & { vehicles: Vehicle | null })[]>(
      supabase.from("maintenances").select("*, vehicles(*)").order("date", { ascending: false }),
    ),
});

export const expensesQuery = queryOptions({
  queryKey: ["expenses"],
  queryFn: () =>
    unwrap<(Expense & { vehicles: Vehicle | null })[]>(
      supabase.from("expenses").select("*, vehicles(*)").order("date", { ascending: false }),
    ),
});

export const siteQuery = queryOptions({
  queryKey: ["public_site"],
  queryFn: async () => {
    const { data, error } = await supabase.from("public_sites").select("*").maybeSingle();
    if (error) throw new Error(error.message);
    return data as PublicSite | null;
  },
});

export const leadsQuery = queryOptions({
  queryKey: ["leads"],
  queryFn: () =>
    unwrap<(SiteLead & { vehicles: Vehicle | null })[]>(
      supabase.from("site_leads").select("*, vehicles(*)").order("created_at", { ascending: false }),
    ),
});

export const notificationsQuery = queryOptions({
  queryKey: ["notifications"],
  queryFn: () =>
    unwrap<Tables<"notifications">[]>(
      supabase.from("notifications").select("*").order("created_at", { ascending: false }).limit(100),
    ),
});

export const VEHICLE_STATUS_LABEL: Record<string, string> = {
  disponivel: "Disponível",
  alugado: "Alugado",
  reservado: "Reservado",
  manutencao: "Manutenção",
  inativo: "Inativo",
};

export const PERIODICITY_LABEL: Record<string, string> = {
  semanal: "Semanal",
  quinzenal: "Quinzenal",
  mensal: "Mensal",
  personalizada: "Personalizada",
};

export const PAYMENT_STATUS_LABEL: Record<string, string> = {
  pago: "Pago",
  pendente: "Pendente",
  atrasado: "Atrasado",
  cancelado: "Cancelado",
};

export const vehicleQuery = (id: string) =>
  queryOptions({
    queryKey: ["vehicle", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vehicles")
        .select("*, vehicle_photos(*)")
        .eq("id", id)
        .maybeSingle();
      if (error) throw new Error(error.message);
      return data as (Vehicle & { vehicle_photos: VehiclePhoto[] }) | null;
    },
  });
export const publicSiteQuery = (slug: string) =>
  queryOptions({
    queryKey: ["public-site", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("public_sites")
        .select("*")
        .eq("slug", slug)
        .eq("is_published", true)
        .maybeSingle();
      if (error) throw new Error(error.message);
      return data as PublicSite | null;
    },
  });

export const publicVehiclesQuery = (userId: string) =>
  queryOptions({
    queryKey: ["public-vehicles", userId],
    queryFn: () =>
      unwrap<(Vehicle & { vehicle_photos: VehiclePhoto[] })[]>(
        supabase
          .from("vehicles")
          .select("*, vehicle_photos(*)")
          .eq("user_id", userId)
          .eq("show_in_catalog", true)
          .neq("status", "inativo")
          .order("created_at", { ascending: false }),
      ),
    enabled: Boolean(userId),
  });

export const publicVehicleQuery = (id: string) =>
  queryOptions({
    queryKey: ["public-vehicle", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vehicles")
        .select("*, vehicle_photos(*)")
        .eq("id", id)
        .eq("show_in_catalog", true)
        .neq("status", "inativo")
        .maybeSingle();
      if (error) throw new Error(error.message);
      return data as (Vehicle & { vehicle_photos: VehiclePhoto[] }) | null;
    },
  });
