import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { paymentsQuery, expensesQuery, maintenancesQuery, vehiclesQuery } from "@/queries";
import { formatCurrency } from "@/format";

export const Route = createFileRoute("/_authenticated/app/relatorios")({ component: ReportsPage });
function ReportsPage() {
  const payments = useQuery(paymentsQuery), expenses = useQuery(expensesQuery), maintenances = useQuery(maintenancesQuery), vehicles = useQuery(vehiclesQuery);
  const loading = [payments, expenses, maintenances, vehicles].some((q) => q.isLoading);
  const error = [payments, expenses, maintenances, vehicles].find((q) => q.isError);
  if (error) return <Page title="Relatórios"><p className="text-destructive">Não foi possível carregar os relatórios.</p></Page>;
  const ps = payments.data ?? [], es = expenses.data ?? [], ms = maintenances.data ?? [], vs = vehicles.data ?? [];
  const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);
  const received = sum(ps.filter((p) => p.status === "pago").map((p) => p.amount_cents));
  const pending = sum(ps.filter((p) => p.status === "pendente" || p.status === "atrasado").map((p) => p.amount_cents));
  return <Page title="Relatórios"><p className="text-sm text-muted-foreground">Visão financeira e desempenho da sua frota.</p>{loading ? <p className="mt-8 text-muted-foreground">Carregando...</p> : <><div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{[["Receita recebida", received], ["A receber", pending], ["Despesas", sum(es.map((e) => e.amount_cents))], ["Manutenção", sum(ms.map((m) => m.cost_cents))]].map(([label, value]) => <div className="rounded-md border border-border bg-card p-5" key={label as string}><p className="text-sm text-muted-foreground">{label}</p><p className="mt-2 font-display text-2xl font-semibold">{formatCurrency(value as number)}</p></div>)}</div><section className="mt-8"><h2 className="font-display text-lg font-semibold">Desempenho por veículo</h2><div className="mt-3 divide-y divide-border rounded-md border border-border">{vs.length === 0 ? <p className="p-5 text-sm text-muted-foreground">Nenhum veículo cadastrado.</p> : vs.map((v) => <div className="flex items-center justify-between p-4" key={v.id}><span>{v.brand} {v.model}</span><span className="text-sm text-muted-foreground">{formatCurrency(sum(ps.filter((p) => p.vehicle_id === v.id && p.status === "pago").map((p) => p.amount_cents)))} recebidos · {formatCurrency(sum(es.filter((e) => e.vehicle_id === v.id).map((e) => e.amount_cents)) + sum(ms.filter((m) => m.vehicle_id === v.id).map((m) => m.cost_cents)))} custos</span></div>)}</div></section></>}</Page>;
}
function Page({ title, children }: { title: string; children: React.ReactNode }) { return <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6"><h1 className="font-display text-3xl font-bold">{title}</h1>{children}</div>; }
