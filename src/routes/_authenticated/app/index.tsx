import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  CalendarClock,
  Car,
  ChartNoAxesCombined,
  CircleGauge,
  HandCoins,
  Plus,
  Receipt,
  TrendingUp,
  Users,
  WalletCards,
  Wrench,
} from "lucide-react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, formatDate, greeting } from "@/lib/format";
import { expensesQuery, maintenancesQuery, paymentsQuery, PERIODICITY_LABEL, profileQuery, rentalsQuery, VEHICLE_STATUS_LABEL, vehiclesQuery } from "@/lib/queries";

export const Route = createFileRoute("/_authenticated/app/")({
  head: () => ({
    meta: [
      { title: "Painel da frota — movvia" },
      { name: "description", content: "Acompanhe seus carros, pagamentos e próximos compromissos no movvia." },
      { property: "og:title", content: "Painel da frota — movvia" },
      { property: "og:description", content: "Seu painel de controle de carros alugados." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const profile = useQuery(profileQuery);
  const vehicles = useQuery(vehiclesQuery);
  const payments = useQuery(paymentsQuery);
  const expenses = useQuery(expensesQuery);
  const maintenances = useQuery(maintenancesQuery);
  const rentals = useQuery(rentalsQuery);
  const [periodDays, setPeriodDays] = useState(30);

  const totals = useMemo(() => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const previousStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const inRange = (value: string | null, start: Date, end: Date) => value ? new Date(value) >= start && new Date(value) < end : false;
    const paid = (payments.data ?? []).filter((item) => item.status === "pago");
    const costs = expenses.data ?? [];
    const revenue = paid.filter((item) => inRange(item.paid_at ?? item.created_at, monthStart, new Date(now.getFullYear(), now.getMonth() + 1, 1))).reduce((sum, item) => sum + item.amount_cents, 0);
    const previousRevenue = paid.filter((item) => inRange(item.paid_at ?? item.created_at, previousStart, monthStart)).reduce((sum, item) => sum + item.amount_cents, 0);
    const monthExpenses = costs.filter((item) => inRange(item.date, monthStart, new Date(now.getFullYear(), now.getMonth() + 1, 1))).reduce((sum, item) => sum + item.amount_cents, 0);
    const pendingRows = (payments.data ?? []).filter((item) => item.status === "pendente" || item.status === "atrasado");
    return {
      revenue,
      previousRevenue,
      pending: pendingRows.reduce((sum, item) => sum + item.amount_cents, 0),
      pendingCount: pendingRows.length,
      result: revenue - monthExpenses,
    };
  }, [expenses.data, payments.data]);

  const fleet = vehicles.data ?? [];
  const firstName = profile.data?.full_name?.trim().split(/\s+/)[0] ?? "";
  const rented = fleet.filter((item) => item.status === "alugado").length;
  const occupancy = fleet.length ? Math.round((rented / fleet.length) * 100) : 0;
  const revenueChange = totals.previousRevenue ? Math.round(((totals.revenue - totals.previousRevenue) / totals.previousRevenue) * 100) : null;
  const isLoading = profile.isLoading || vehicles.isLoading || payments.isLoading || expenses.isLoading || maintenances.isLoading || rentals.isLoading;
  const chartData = useMemo(() => buildChartData(periodDays, payments.data ?? [], expenses.data ?? []), [expenses.data, payments.data, periodDays]);
  const upcomingPayments = useMemo(() => (payments.data ?? []).filter((item) => item.status === "pendente" || item.status === "atrasado").sort((a, b) => a.due_date.localeCompare(b.due_date)).slice(0, 5), [payments.data]);
  const upcomingMaintenances = useMemo(() => (maintenances.data ?? []).filter((item) => item.next_date).sort((a, b) => String(a.next_date).localeCompare(String(b.next_date))).slice(0, 5), [maintenances.data]);
  const currentRentals = useMemo(() => new Map((rentals.data ?? []).filter((rental) => rental.status === "ativo").map((rental) => [rental.vehicle_id, rental])), [rentals.data]);

  return (
    <div className="mx-auto max-w-[1500px] px-4 py-7 sm:px-6 lg:px-8 lg:py-10">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase text-brand">{greeting()}</p>
          {isLoading ? <Skeleton className="mt-3 h-11 w-72" /> : <h1 className="mt-2 font-display text-3xl font-semibold sm:text-4xl">{firstName ? `${firstName.toUpperCase()},` : "SUA FROTA,"} tudo sob controle.</h1>}
          <p className="mt-2 text-sm text-muted-foreground">Veja como está sua operação hoje.</p>
        </div>
        <Button asChild size="lg" className="h-11 rounded-lg px-5 shadow-none"><Link to="/app/veiculos"><Plus /> Adicionar carro</Link></Button>
      </div>

      {!isLoading && profile.data && !profile.data.onboarding_done && <div className="mt-6 flex flex-col gap-3 border-l-2 border-brand bg-brand/5 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-medium">Vamos configurar sua frota?</p><p className="text-sm text-muted-foreground">Leva menos de 1 minuto.</p></div><Button asChild size="sm" variant="outline"><Link to="/app/onboarding">Começar</Link></Button></div>}

      <section className="mt-9 grid grid-cols-2 divide-x divide-y divide-border border-y border-border md:grid-cols-4 md:divide-y-0">
        <Metric label="Faturamento este mês" value={formatCurrency(totals.revenue)} detail={revenueChange == null ? "Sem comparação anterior" : `${revenueChange >= 0 ? "+" : ""}${revenueChange}% vs. mês anterior`} icon={TrendingUp} loading={isLoading} tone="brand" />
        <Metric label="A receber" value={formatCurrency(totals.pending)} detail={`${totals.pendingCount} pagamento${totals.pendingCount === 1 ? "" : "s"} pendente${totals.pendingCount === 1 ? "" : "s"}`} icon={HandCoins} loading={isLoading} />
        <Metric label="Ocupação da frota" value={`${occupancy}%`} detail={`${rented} de ${fleet.length} carros alugados`} icon={CircleGauge} loading={isLoading} />
        <Metric label="Resultado este mês" value={formatCurrency(totals.result)} detail="faturamento menos despesas" icon={ChartNoAxesCombined} loading={isLoading} tone={totals.result < 0 ? "danger" : "default"} />
      </section>

      <section className="mt-10 grid gap-5 xl:grid-cols-[minmax(0,1.65fr)_minmax(280px,0.7fr)]">
        <div className="rounded-xl bg-graphite p-5 sm:p-7">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"><div><h2 className="font-display text-xl font-semibold">Desempenho da frota</h2><p className="mt-1 text-sm text-muted-foreground">Receitas e despesas registradas no período</p></div><div className="flex rounded-lg bg-obsidian p-1">{[[7,"7 dias"],[30,"30 dias"],[90,"3 meses"],[365,"12 meses"]].map(([days,label]) => <button key={days} type="button" onClick={() => setPeriodDays(Number(days))} className={`rounded-md px-2.5 py-1.5 text-[11px] font-medium transition-colors ${periodDays === days ? "bg-graphite-2 text-foreground" : "text-muted-foreground hover:text-foreground"}`}>{label}</button>)}</div></div>
          <div className="mt-7 h-64 sm:h-72"><ResponsiveContainer width="100%" height="100%"><AreaChart data={chartData} margin={{ top: 10, right: 2, left: -18, bottom: 0 }}><defs><linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--brand)" stopOpacity={0.24}/><stop offset="100%" stopColor="var(--brand)" stopOpacity={0}/></linearGradient></defs><CartesianGrid stroke="var(--border)" vertical={false}/><XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 10 }} minTickGap={24}/><YAxis axisLine={false} tickLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 10 }} tickFormatter={(v) => `${Math.round(v / 1000)}k`}/><Tooltip content={<ChartTooltip />}/><Area type="monotone" dataKey="receitas" stroke="var(--brand)" strokeWidth={2} fill="url(#revenueFill)"/><Area type="monotone" dataKey="despesas" stroke="var(--tech)" strokeWidth={2} fill="transparent"/></AreaChart></ResponsiveContainer></div>
          <div className="mt-3 flex gap-5 text-xs text-muted-foreground"><span className="flex items-center gap-2"><i className="size-2 rounded-full bg-brand"/>Receitas</span><span className="flex items-center gap-2"><i className="size-2 rounded-full bg-tech"/>Despesas</span></div>
        </div>
        <div className="rounded-xl bg-graphite p-5 sm:p-7"><div className="flex items-center justify-between"><div><h2 className="font-display text-xl font-semibold">Status da frota</h2><p className="mt-1 text-sm text-muted-foreground">Visão operacional</p></div><Car className="size-5 text-muted-foreground" /></div><div className="mt-8 space-y-5">{[["alugado","bg-brand"],["disponivel","bg-tech"],["reservado","bg-warning"],["manutencao","bg-destructive"]].map(([status,color]) => { const count=fleet.filter((item)=>item.status===status).length; const percent=fleet.length ? count/fleet.length*100 : 0; return <div key={status}><div className="flex items-end justify-between"><span className="text-sm text-muted-foreground">{VEHICLE_STATUS_LABEL[status]}</span><strong className="font-display text-xl">{count}</strong></div><div className="mt-2 h-1 overflow-hidden rounded-full bg-obsidian"><div className={`h-full rounded-full ${color}`} style={{ width: `${percent}%` }}/></div></div>; })}</div></div>
      </section>

      <section className="mt-12"><div className="flex items-end justify-between"><div><p className="text-xs font-semibold uppercase text-brand">Operação</p><h2 className="mt-2 font-display text-2xl font-semibold">Sua frota</h2></div><Link to="/app/veiculos" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Ver todos</Link></div>{fleet.length === 0 && !isLoading ? <EmptyLine icon={Car} title="Nenhum carro cadastrado" text="Seu primeiro carro aparecerá aqui com foto, status e valor."/> : <div className="mt-5 grid gap-4 md:grid-cols-2 2xl:grid-cols-3">{fleet.slice(0,6).map((vehicle) => { const photo=[...vehicle.vehicle_photos].sort((a,b)=>Number(b.is_primary)-Number(a.is_primary)||a.position-b.position)[0]; const rental=currentRentals.get(vehicle.id); return <Link key={vehicle.id} to="/app/veiculos/$id" params={{id:vehicle.id}} className="group overflow-hidden rounded-xl bg-graphite transition-transform duration-200 hover:-translate-y-0.5"><div className="aspect-[16/9] overflow-hidden bg-graphite-2">{photo ? <img src={photo.url} alt={`${vehicle.brand} ${vehicle.model}`} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" loading="lazy"/> : <div className="grid h-full place-items-center"><Car className="size-8 text-muted-foreground/35"/></div>}</div><div className="p-5"><div className="flex items-start justify-between gap-3"><div><p className="text-[10px] font-semibold uppercase text-muted-foreground">{vehicle.brand}</p><h3 className="mt-1 font-display text-xl font-semibold">{vehicle.model} {vehicle.year ?? ""}</h3></div><span className="rounded-full bg-obsidian px-2.5 py-1 text-[10px] font-medium text-muted-foreground">{VEHICLE_STATUS_LABEL[vehicle.status]}</span></div><div className="mt-5 flex items-end justify-between gap-3"><div><p className="text-xs text-muted-foreground">{rental?.customers?.name ?? "Sem cliente atual"}</p><p className="mt-1 font-medium">{formatCurrency(vehicle.rental_price_cents)} <span className="text-xs font-normal text-muted-foreground">/ {(PERIODICITY_LABEL[vehicle.rental_periodicity] ?? vehicle.rental_periodicity).toLowerCase()}</span></p></div><ArrowRight className="size-4 text-brand transition-transform group-hover:translate-x-1"/></div></div></Link>; })}</div>}</section>

      <section className="mt-12 grid gap-8 xl:grid-cols-2"><DataList title="Próximos pagamentos" icon={Receipt} empty="Nenhum pagamento pendente.">{upcomingPayments.map((payment) => <div key={payment.id} className="grid grid-cols-[1fr_auto] gap-4 py-4 sm:grid-cols-[1fr_1fr_auto]"><div><p className="truncate text-sm font-medium">{payment.customers?.name ?? "Cliente não informado"}</p><p className="mt-1 truncate text-xs text-muted-foreground">{payment.vehicles ? `${payment.vehicles.brand} ${payment.vehicles.model}` : "Sem veículo"}</p></div><div className="hidden sm:block"><p className="text-sm">{formatDate(payment.due_date)}</p><p className={`mt-1 text-xs ${payment.status === "atrasado" ? "text-destructive" : "text-muted-foreground"}`}>{payment.status === "atrasado" ? "Atrasado" : "Pendente"}</p></div><p className="text-sm font-semibold">{formatCurrency(payment.amount_cents)}</p></div>)}</DataList><DataList title="Próximas manutenções" icon={Wrench} empty="Nenhuma manutenção programada.">{upcomingMaintenances.map((maintenance) => <div key={maintenance.id} className="grid grid-cols-[1fr_auto] gap-4 py-4 sm:grid-cols-[1fr_1fr_auto]"><div><p className="truncate text-sm font-medium">{maintenance.vehicles ? `${maintenance.vehicles.brand} ${maintenance.vehicles.model}` : "Veículo"}</p><p className="mt-1 text-xs text-muted-foreground">{maintenance.type}</p></div><div className="hidden text-sm sm:block"><p>{formatDate(maintenance.next_date)}</p><p className="mt-1 text-xs text-muted-foreground">{maintenance.next_mileage ? `${maintenance.next_mileage.toLocaleString("pt-BR")} km` : "Sem km definido"}</p></div><CalendarClock className="size-4 text-muted-foreground"/></div>)}</DataList></section>

      <section className="mt-12 pb-3"><p className="text-xs font-semibold uppercase text-muted-foreground">Ações rápidas</p><div className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-4">{[{icon:Car,text:"Adicionar carro",to:"/app/veiculos" as const},{icon:Users,text:"Adicionar cliente",to:"/app/clientes" as const},{icon:HandCoins,text:"Criar aluguel",to:"/app/alugueis" as const},{icon:WalletCards,text:"Registrar pagamento",to:"/app/pagamentos" as const}].map(({icon:Icon,text,to})=><Link key={text} to={to} className="group flex min-h-24 flex-col justify-between rounded-lg bg-graphite p-4 text-sm transition-colors hover:bg-graphite-2"><Icon className="size-5 text-muted-foreground transition-colors group-hover:text-brand"/><span className="flex items-center justify-between gap-2 font-medium">{text}<ArrowRight className="size-3.5 text-muted-foreground"/></span></Link>)}</div></section>
    </div>
  );
}

function Metric({ label, value, detail, icon: Icon, loading, tone = "default" }: { label: string; value: string; detail: string; icon: typeof Car; loading: boolean; tone?: "default" | "brand" | "danger" }) {
  return <div className="min-h-36 p-4 sm:p-5 lg:p-6"><div className="flex items-start justify-between gap-2"><p className="text-xs font-medium text-muted-foreground sm:text-sm">{label}</p><Icon className={`size-4 ${tone === "brand" ? "text-brand" : tone === "danger" ? "text-destructive" : "text-muted-foreground"}`} /></div>{loading ? <Skeleton className="mt-5 h-8 w-28" /> : <p className="mt-5 truncate font-display text-xl font-semibold sm:text-2xl">{value}</p>}<p className="mt-2 truncate text-[11px] text-muted-foreground">{detail}</p></div>;
}

function DataList({ title, icon: Icon, empty, children }: { title: string; icon: typeof Car; empty: string; children: React.ReactNode }) { const hasChildren = Array.isArray(children) ? children.length > 0 : Boolean(children); return <div><div className="flex items-center justify-between border-b border-border pb-4"><h2 className="font-display text-xl font-semibold">{title}</h2><Icon className="size-4 text-muted-foreground"/></div>{hasChildren ? <div className="divide-y divide-border">{children}</div> : <p className="py-10 text-center text-sm text-muted-foreground">{empty}</p>}</div>; }
function EmptyLine({ icon: Icon, title, text }: { icon: typeof Car; title: string; text: string }) { return <div className="mt-5 flex min-h-44 flex-col items-center justify-center border-y border-border text-center"><Icon className="size-6 text-muted-foreground"/><h3 className="mt-3 font-medium">{title}</h3><p className="mt-1 text-sm text-muted-foreground">{text}</p></div>; }
function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) { if (!active || !payload?.length) return null; return <div className="rounded-lg border border-border bg-obsidian p-3 shadow-xl"><p className="mb-2 text-xs text-muted-foreground">{label}</p>{payload.map((item)=><p key={item.name} className="text-xs" style={{color:item.color}}>{item.name}: {formatCurrency(item.value)}</p>)}</div>; }

function buildChartData(days: number, payments: Array<{ status: string; amount_cents: number; paid_at: string | null; created_at: string }>, expenses: Array<{ amount_cents: number; date: string }>) {
  const end = new Date(); end.setHours(23,59,59,999);
  const start = new Date(end); start.setDate(start.getDate() - days + 1); start.setHours(0,0,0,0);
  const bucketCount = days <= 7 ? 7 : days <= 30 ? 10 : 12;
  const bucketMs = (end.getTime() - start.getTime() + 1) / bucketCount;
  const buckets = Array.from({length:bucketCount},(_,index)=>({ label: new Date(start.getTime()+index*bucketMs).toLocaleDateString("pt-BR", days >= 90 ? {month:"short"} : {day:"2-digit",month:"2-digit"}), receitas:0, despesas:0 }));
  const indexFor = (value:string) => Math.min(bucketCount-1,Math.max(0,Math.floor((new Date(value).getTime()-start.getTime())/bucketMs)));
  payments.filter((item)=>item.status==="pago" && new Date(item.paid_at ?? item.created_at)>=start).forEach((item)=>{ buckets[indexFor(item.paid_at ?? item.created_at)].receitas += item.amount_cents; });
  expenses.filter((item)=>new Date(`${item.date}T12:00:00`)>=start).forEach((item)=>{ buckets[indexFor(`${item.date}T12:00:00`)].despesas += item.amount_cents; });
  return buckets;
}
