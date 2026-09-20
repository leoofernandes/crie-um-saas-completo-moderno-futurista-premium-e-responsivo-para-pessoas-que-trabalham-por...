import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Car,
  ChevronRight,
  CircleDollarSign,
  Plus,
  ReceiptText,
  Users,
  WalletCards,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, greeting } from "@/lib/format";
import { paymentsQuery, profileQuery, vehiclesQuery } from "@/lib/queries";

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

  const totals = useMemo(() => {
    const rows = payments.data ?? [];
    return {
      received: rows.filter((item) => item.status === "pago").reduce((sum, item) => sum + item.amount_cents, 0),
      pending: rows.filter((item) => item.status === "pendente").reduce((sum, item) => sum + item.amount_cents, 0),
      overdue: rows.filter((item) => item.status === "atrasado").reduce((sum, item) => sum + item.amount_cents, 0),
    };
  }, [payments.data]);

  const fleet = vehicles.data ?? [];
  const firstName = profile.data?.full_name?.trim().split(/\s+/)[0] ?? "";
  const isLoading = profile.isLoading || vehicles.isLoading || payments.isLoading;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-9">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-medium text-brand">{greeting()}</p>
              {isLoading ? <Skeleton className="mt-2 h-9 w-56" /> : <h1 className="mt-1 font-display text-3xl font-bold">{firstName ? `${firstName},` : "Sua frota"} tudo sob controle.</h1>}
            </div>
                     <Button asChild><Link to="/app/veiculos"><Plus /> Cadastrar carro</Link></Button>
          </div>

          {!isLoading && profile.data && !profile.data.onboarding_done && (
            <div className="mt-5 flex flex-col gap-3 rounded-md border border-brand/30 bg-brand/5 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-medium text-brand">Vamos configurar sua frota?</p>
                <p className="text-sm text-muted-foreground">Leva menos de 1 minuto.</p>
              </div>
              <Button asChild size="sm"><Link to="/app/onboarding">Começar</Link></Button>
            </div>
          )}

          <section className="mt-7 grid grid-cols-2 gap-3 xl:grid-cols-4">
            <Metric label="Seus carros" value={String(fleet.length)} detail={`${fleet.filter((item) => item.status === "alugado").length} alugados`} icon={Car} loading={isLoading} />
            <Metric label="Disponíveis" value={String(fleet.filter((item) => item.status === "disponivel").length)} detail="prontos para alugar" icon={CircleDollarSign} loading={isLoading} />
            <Metric label="Recebidos" value={formatCurrency(totals.received)} detail="pagamentos registrados" icon={WalletCards} loading={isLoading} />
            <Metric label="Em atraso" value={formatCurrency(totals.overdue)} detail={`${formatCurrency(totals.pending)} a receber`} icon={ReceiptText} loading={isLoading} danger={totals.overdue > 0} />
          </section>

          <section className="mt-7 grid gap-5 xl:grid-cols-[1.5fr_1fr]">
            <div className="border-y border-border py-6">
              <div className="flex items-center justify-between"><div><h2 className="font-display text-lg font-semibold">Sua frota agora</h2><p className="mt-1 text-sm text-muted-foreground">Situação atual dos seus veículos</p></div><Car className="size-5 text-brand" /></div>
              {fleet.length === 0 && !isLoading ? (
                <div className="flex min-h-52 flex-col items-center justify-center text-center"><div className="grid size-11 place-items-center rounded-md bg-muted"><Car className="size-5 text-muted-foreground" /></div><h3 className="mt-4 font-medium">Nenhum carro cadastrado</h3><p className="mt-1 max-w-sm text-sm text-muted-foreground">Seu primeiro carro aparecerá aqui com status, valor e próximos compromissos.</p></div>
              ) : (
                <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">{["alugado", "disponivel", "reservado", "manutencao"].map((status) => <div key={status} className="rounded-md bg-surface p-4"><p className="text-2xl font-semibold">{fleet.filter((item) => item.status === status).length}</p><p className="mt-1 text-xs capitalize text-muted-foreground">{status === "manutencao" ? "manutenção" : status}</p></div>)}</div>
              )}
            </div>
            <div className="border-y border-border py-6">
              <h2 className="font-display text-lg font-semibold">Ações rápidas</h2>
              <div className="mt-4 divide-y divide-border">
                 {[{ icon: Car, text: "Cadastrar um carro", to: "/app/veiculos" as const }, { icon: Users, text: "Adicionar cliente", to: "/app/clientes" as const }, { icon: WalletCards, text: "Registrar pagamento", to: "/app/pagamentos" as const }].map(({ icon: Icon, text, to }) => <Link to={to} key={text} className="flex h-14 items-center gap-3 text-sm text-muted-foreground transition-colors hover:text-foreground"><Icon className="size-4 text-brand" /><span className="flex-1">{text}</span><ChevronRight className="size-4" /></Link>)}
              </div>
            </div>
          </section>
    </div>
  );
}

function Metric({ label, value, detail, icon: Icon, loading, danger = false }: { label: string; value: string; detail: string; icon: typeof Car; loading: boolean; danger?: boolean }) {
  return <div className="min-h-32 rounded-md border border-border bg-card p-4 sm:p-5"><div className="flex items-center justify-between"><p className="text-xs font-medium text-muted-foreground sm:text-sm">{label}</p><Icon className={danger ? "size-4 text-destructive" : "size-4 text-brand"} /></div>{loading ? <Skeleton className="mt-4 h-7 w-24" /> : <p className="mt-4 truncate font-display text-xl font-semibold sm:text-2xl">{value}</p>}<p className="mt-1 truncate text-xs text-muted-foreground">{detail}</p></div>;
}
