import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { formatDate } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/app/admin")({
  beforeLoad: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw redirect({ to: "/login" });
    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();
    if (!data) throw redirect({ to: "/app" });
  },
  component: AdminPage,
});

function AdminPage() {
  const client = useQueryClient();

  const users = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
      if (error) throw new Error(error.message);
      return data;
    },
  });

  const subscriptions = useQuery({
    queryKey: ["admin-subscriptions"],
    queryFn: async () => {
      const { data, error } = await supabase.from("subscriptions").select("*, plans(name)");
      if (error) throw new Error(error.message);
      return data;
    },
  });

  const plans = useQuery({
    queryKey: ["admin-plans"],
    queryFn: async () => {
      const { data, error } = await supabase.from("plans").select("*").order("sort_order");
      if (error) throw new Error(error.message);
      return data;
    },
  });

  const subsByUser = new Map((subscriptions.data ?? []).map((s) => [s.user_id, s]));
  const activeCount = (subscriptions.data ?? []).filter((s) => s.status === "ativo").length;
  const trialCount = (subscriptions.data ?? []).filter((s) => s.status === "trial").length;
  const canceledCount = (subscriptions.data ?? []).filter((s) => s.status === "cancelado").length;

  async function savePlan(event: React.FormEvent<HTMLFormElement>, planId: string) {
    event.preventDefault();
    const f = new FormData(event.currentTarget);
    const monthly = f.get("monthly");
    const yearly = f.get("yearly");
    const limit = f.get("limit");
    const { error } = await supabase.from("plans").update({
      price_monthly_cents: monthly ? Math.round(Number(monthly) * 100) : null,
      price_yearly_cents: yearly ? Math.round(Number(yearly) * 100) : null,
      vehicle_limit: limit ? Number(limit) : null,
    }).eq("id", planId);
    if (error) { toast.error(error.message); return; }
    toast.success("Plano atualizado.");
    client.invalidateQueries({ queryKey: ["admin-plans"] });
    client.invalidateQueries({ queryKey: ["plans"] });
  }

  const loading = users.isLoading || subscriptions.isLoading || plans.isLoading;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <h1 className="font-display text-3xl font-bold">Administração</h1>
      <p className="mt-1 text-sm text-muted-foreground">Visão geral de usuários, assinaturas e planos.</p>

      {loading ? (
        <p className="mt-8 text-muted-foreground">Carregando...</p>
      ) : (
        <>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Usuários" value={String(users.data?.length ?? 0)} />
            <StatCard label="Assinaturas ativas" value={String(activeCount)} />
            <StatCard label="Em teste" value={String(trialCount)} />
            <StatCard label="Canceladas" value={String(canceledCount)} />
          </div>

          <section className="mt-8">
            <h2 className="font-display text-lg font-semibold">Planos</h2>
            <div className="mt-3 space-y-3">
              {(plans.data ?? []).map((plan) => (
                <form key={plan.id} onSubmit={(e) => savePlan(e, plan.id)} className="flex flex-wrap items-end gap-3 rounded-md border border-border bg-card p-4">
                  <div className="min-w-24">
                    <p className="font-display font-semibold">{plan.name}</p>
                    <p className="text-xs text-muted-foreground">{plan.vehicle_limit ? `Até ${plan.vehicle_limit} veículos` : "Sob consulta"}</p>
                  </div>
                  <label className="text-xs text-muted-foreground">Mensal (R$)
                    <Input name="monthly" type="number" step="0.01" defaultValue={plan.price_monthly_cents ? (plan.price_monthly_cents / 100).toFixed(2) : ""} className="mt-1 w-28" />
                  </label>
                  <label className="text-xs text-muted-foreground">Anual (R$)
                    <Input name="yearly" type="number" step="0.01" defaultValue={plan.price_yearly_cents ? (plan.price_yearly_cents / 100).toFixed(2) : ""} className="mt-1 w-28" />
                  </label>
                  <label className="text-xs text-muted-foreground">Limite de veículos
                    <Input name="limit" type="number" defaultValue={plan.vehicle_limit ?? ""} className="mt-1 w-24" />
                  </label>
                  <Button type="submit" size="sm">Salvar</Button>
                </form>
              ))}
            </div>
          </section>

          <section className="mt-8">
            <h2 className="font-display text-lg font-semibold">Usuários</h2>
            <div className="mt-3 divide-y divide-border rounded-md border border-border">
              {(users.data ?? []).map((u) => {
                const sub = subsByUser.get(u.id);
                return (
                  <div key={u.id} className="flex flex-wrap items-center justify-between gap-2 p-4 text-sm">
                    <div>
                      <p className="font-medium">{u.full_name || "Sem nome"}</p>
                      <p className="text-xs text-muted-foreground">{u.email} • cadastrado em {formatDate(u.created_at)}</p>
                    </div>
                    <span className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">
                      {sub ? `${sub.plans?.name ?? "Plano"} • ${sub.status}` : "Sem assinatura"}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>
        </>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-card p-5">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-2 font-display text-2xl font-semibold">{value}</p>
    </div>
  );
}
