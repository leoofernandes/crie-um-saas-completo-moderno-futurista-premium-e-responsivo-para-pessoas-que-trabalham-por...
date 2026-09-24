import { useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import {
  Bell, Car, Contact, FileChartColumn, Globe2, LayoutDashboard, LogOut, Menu,
  ReceiptText, Settings, ShieldCheck, Users, WalletCards, Wrench,
} from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";

const groups = [
  { label: "Principal", items: [{ to: "/app", label: "Dashboard", icon: LayoutDashboard }] },
  { label: "Operação", items: [
    { to: "/app/veiculos", label: "Carros", icon: Car },
    { to: "/app/clientes", label: "Clientes", icon: Users },
    { to: "/app/alugueis", label: "Aluguéis", icon: Contact },
  ] },
  { label: "Financeiro", items: [
    { to: "/app/pagamentos", label: "Pagamentos", icon: WalletCards },
    { to: "/app/despesas", label: "Despesas", icon: ReceiptText },
    { to: "/app/relatorios", label: "Relatórios", icon: FileChartColumn },
  ] },
  { label: "Gestão", items: [
    { to: "/app/manutencoes", label: "Manutenções", icon: Wrench },
    { to: "/app/catalogo", label: "Meu catálogo", icon: Globe2 },
  ] },
  { label: "Sistema", items: [
    { to: "/app/notificacoes", label: "Notificações", icon: Bell },
    { to: "/app/configuracoes", label: "Configurações", icon: Settings },
  ] },
] as const;
const navigation = groups.flatMap((group) => group.items);

function NavLinks({ onSelect }: { onSelect?: () => void }) {
  const pathname = useLocation({ select: (location) => location.pathname });
  return <nav className="space-y-5 px-3 py-5">
    {groups.map((group) => <div key={group.label}>
      <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/55">{group.label}</p>
      <div className="space-y-1">{group.items.map(({ to, label, icon: Icon }) => {
        const active = to === "/app" ? pathname === to : pathname.startsWith(to);
        return <Link key={to} to={to} onClick={onSelect} className={cn(
          "group relative flex h-10 items-center gap-3 rounded-lg px-3 text-[13px] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          active ? "bg-sidebar-accent text-sidebar-foreground" : "text-sidebar-foreground/58 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
        )}>
          {active && <span className="absolute inset-y-2 left-0 w-0.5 rounded-full bg-brand" />}
          <Icon className={cn("size-[17px] transition-colors", active ? "text-brand" : "text-sidebar-foreground/55 group-hover:text-sidebar-foreground")} strokeWidth={1.7} />
          <span>{label}</span>
        </Link>;
      })}</div>
    </div>)}
  </nav>;
}

function UserBadge() {
  const profile = useQuery({ queryKey: ["profile"], queryFn: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    return user?.user_metadata?.name || user?.email?.split("@")[0] || "Operador";
  } });
  const name = String(profile.data ?? "Operador");
  return <div className="hidden items-center gap-3 border-l border-border pl-4 sm:flex">
    <div className="grid size-8 place-items-center rounded-full bg-surface-2 text-xs font-semibold text-foreground">{name.slice(0, 2).toUpperCase()}</div>
    <div className="hidden leading-tight xl:block"><p className="text-xs font-medium">{name}</p><p className="text-[10px] text-muted-foreground">Administrador</p></div>
  </div>;
}

export function AppShell() {
  const navigate = useNavigate();
  const isAdmin = useQuery({ queryKey: ["is-admin"], queryFn: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;
    const { data } = await supabase.from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin").maybeSingle();
    return Boolean(data);
  } });
  const [signingOut, setSigningOut] = useState(false);
  async function signOut() { setSigningOut(true); await supabase.auth.signOut(); navigate({ to: "/login" }); }
  return <div className="min-h-screen bg-background lg:grid lg:grid-cols-[248px_1fr]">
    <aside className="hidden border-r border-sidebar-border bg-sidebar lg:flex lg:min-h-screen lg:flex-col">
      <div className="flex h-20 items-center border-b border-sidebar-border px-6"><Logo /></div>
      <div className="flex-1 overflow-y-auto"><NavLinks /></div>
      <div className="border-t border-sidebar-border p-3">
        {isAdmin.data && <Link to="/app/admin" className="mb-1 flex h-9 items-center gap-2 rounded-lg px-3 text-xs text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground"><ShieldCheck className="size-4" /> Administração</Link>}
        <Button variant="ghost" className="h-9 w-full justify-start gap-2 rounded-lg px-3 text-xs text-muted-foreground hover:bg-sidebar-accent hover:text-foreground" onClick={signOut} disabled={signingOut}><LogOut className="size-4" /> {signingOut ? "Saindo..." : "Sair"}</Button>
      </div>
    </aside>
    <main className="min-w-0 pb-20 lg:pb-0">
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border/70 bg-background/85 px-4 backdrop-blur-xl sm:px-6 lg:h-20 lg:px-8">
        <div className="flex items-center gap-4"><div className="lg:hidden"><Logo /></div><div className="hidden lg:block"><p className="text-sm font-medium">Centro de controle</p><p className="text-xs text-muted-foreground">Gestão da sua frota em um só lugar</p></div></div>
        <div className="flex items-center gap-1 sm:gap-3"><span className="hidden text-[11px] text-muted-foreground sm:block">Atualizado agora</span><Button asChild size="icon" variant="ghost" className="rounded-lg" aria-label="Notificações"><Link to="/app/notificacoes"><Bell className="size-[18px]" /></Link></Button><UserBadge /><Sheet><SheetTrigger asChild><Button size="icon" variant="ghost" className="rounded-lg lg:hidden" aria-label="Abrir menu"><Menu /></Button></SheetTrigger><SheetContent side="right" className="w-72 bg-sidebar p-0"><SheetHeader className="border-b border-sidebar-border p-5"><SheetTitle><Logo /></SheetTitle></SheetHeader><NavLinks /></SheetContent></Sheet></div>
      </header><Outlet />
    </main>
    <nav className="fixed inset-x-0 bottom-0 z-40 grid h-16 grid-cols-5 border-t border-border bg-background/95 px-2 backdrop-blur-xl lg:hidden">
      {[navigation[0], navigation[1], navigation[2], navigation[3], { to: "/app/configuracoes", label: "Mais", icon: Menu } as const].map(({ to, label, icon: Icon }) => <Link key={label} to={to} className="flex flex-col items-center justify-center gap-1 text-[11px] text-muted-foreground transition-colors hover:text-foreground data-[status=active]:text-brand"><Icon className="size-4" />{label}</Link>)}
    </nav>
  </div>;
}
