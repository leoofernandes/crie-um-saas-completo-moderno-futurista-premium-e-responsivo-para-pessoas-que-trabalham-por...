import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  Bell,
  Car,
  ChevronRight,
  CircleDollarSign,
  LayoutDashboard,
  LogOut,
  Menu,
  Plus,
  ReceiptText,
  Users,
  WalletCards,
  Wrench,
} from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
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

const desktopNav = [
  { icon: LayoutDashboard, label: "Dashboard", active: true },
  { icon: Car, label: "Carros" },
  { icon: Users, label: "Clientes" },
  { icon: WalletCards, label: "Pagamentos" },
  { icon: Wrench, label: "Manutenções" },
  { icon: ReceiptText, label: "Despesas" },
];

function DashboardPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [signingOut, setSigningOut] = useState(false);
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

  async function signOut() {
    setSigningOut(true);
    await supabase.auth.signOut();
    queryClient.clear();
    navigate({ to: "/login" });
  }

  const fleet = vehicles.data ?? [];
  const firstName = profile.data?.full_name?.trim().split(/\s+/)[0] ?? "";
  const isLoading = profile.isLoading || vehicles.isLoading || payments.isLoading;

  return (
    <div className="min-h-screen bg-background lg:grid lg:grid-cols-[240px_1fr]">
      <aside className="hidden border-r border-sidebar-border bg-sidebar lg:flex lg:min-h-screen lg:flex-col">
        <div className="flex h-20 items-center border-b border-sidebar-border px-6"><Logo /></div>
        <nav className="flex-1 space-y-1 p-3">
          {desktopNav.map(({ icon: Icon, label, active }) => (
            <div key={label} className={active ? "flex h-11 items-center gap-3 rounded-md bg-sidebar-accent px-3 text-sm font-medium text-sidebar-primary" : "flex h-11 items-center gap-3 rounded-md px-3 text-sm text-sidebar-foreground/65"}>
              <Icon className="size-4" />{label}
            </div>
          ))}
        </nav>
        <div className="border-t border-sidebar-border p-3">
          <Button variant="ghost" className="w-full justify-start text-muted-foreground" onClick={signOut} disabled={signingOut}>
            <LogOut /> Sair
          </Button>
        </div>
      </aside>

      <main className="min-w-0 pb-24 lg:pb-8">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border bg-background/90 px-4 backdrop-blur-xl sm:px-6 lg:h-20 lg:px-8">
          <div className="lg:hidden"><Logo /></div>
          <p className="hidden text-sm text-muted-foreground lg:block">Visão geral da sua frota</p>
          <div className="flex items-center gap-1">
            <Button size="icon" variant="ghost" aria-label="Notificações"><Bell /></Button>
            <Button size="icon" variant="ghost" className="lg:hidden" aria-label="Menu"><Menu /></Button>
          </div>
        </header>

        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-9">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-medium text-brand">{greeting()}</p>
              {isLoading ? <Skeleton className="mt-2 h-9 w-56" /> : <h1 className="mt-1 font-display text-3xl font-bold">{firstName ? `${firstName},` : "Sua frota"} tudo sob controle.</h1>}
            </div>
            <Button disabled title="Cadastro de veículos será liberado na próxima etapa"><Plus /> Cadastrar carro</Button>
          </div>

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
                {[{ icon: Car, text: "Cadastrar um carro" }, { icon: Users, text: "Adicionar cliente" }, { icon: WalletCards, text: "Registrar pagamento" }].map(({ icon: Icon, text }) => <div key={text} className="flex h-14 items-center gap-3 text-sm text-muted-foreground"><Icon className="size-4 text-brand" /><span className="flex-1">{text}</span><ChevronRight className="size-4" /></div>)}
              </div>
            </div>
          </section>
        </div>
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-30 grid h-16 grid-cols-5 border-t border-border bg-background/95 px-2 backdrop-blur-xl lg:hidden">
        {[{ icon: LayoutDashboard, label: "Início" }, { icon: Car, label: "Carros" }, { icon: Users, label: "Clientes" }, { icon: WalletCards, label: "Pagamentos" }, { icon: Menu, label: "Mais" }].map(({ icon: Icon, label }, index) => <div key={label} className={index === 0 ? "flex flex-col items-center justify-center gap-1 text-[11px] text-brand" : "flex flex-col items-center justify-center gap-1 text-[11px] text-muted-foreground"}><Icon className="size-4" />{label}</div>)}
      </nav>
    </div>
  );
}

function Metric({ label, value, detail, icon: Icon, loading, danger = false }: { label: string; value: string; detail: string; icon: typeof Car; loading: boolean; danger?: boolean }) {
  return <div className="min-h-32 rounded-md border border-border bg-card p-4 sm:p-5"><div className="flex items-center justify-between"><p className="text-xs font-medium text-muted-foreground sm:text-sm">{label}</p><Icon className={danger ? "size-4 text-destructive" : "size-4 text-brand"} /></div>{loading ? <Skeleton className="mt-4 h-7 w-24" /> : <p className="mt-4 truncate font-display text-xl font-semibold sm:text-2xl">{value}</p>}<p className="mt-1 truncate text-xs text-muted-foreground">{detail}</p></div>;
}