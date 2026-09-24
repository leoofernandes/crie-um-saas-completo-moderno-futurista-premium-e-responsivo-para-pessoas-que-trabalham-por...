import { useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import {
   Bell, Car, ChartNoAxesCombined, Contact, FileChartColumn, Globe2, LayoutDashboard,
  LogOut, Menu, ReceiptText, Settings, ShieldCheck, Users, WalletCards, Wrench,
} from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
const navigation = [
  { section: "PRINCIPAL", items: [{ to: "/app", label: "Dashboard", icon: LayoutDashboard }] },
  { section: "OPERAÇÃO", items: [{ to: "/app/veiculos", label: "Carros", icon: Car }, { to: "/app/clientes", label: "Clientes", icon: Users }, { to: "/app/alugueis", label: "Aluguéis", icon: Contact }] },
  { section: "FINANCEIRO", items: [{ to: "/app/pagamentos", label: "Pagamentos", icon: WalletCards }, { to: "/app/despesas", label: "Despesas", icon: ReceiptText }, { to: "/app/relatorios", label: "Relatórios", icon: FileChartColumn }] },
  { section: "GESTÃO", items: [{ to: "/app/manutencoes", label: "Manutenções", icon: Wrench }, { to: "/app/catalogo", label: "Meu catálogo", icon: Globe2 }] },
  { section: "SISTEMA", items: [{ to: "/app/notificacoes", label: "Notificações", icon: Bell }, { to: "/app/configuracoes", label: "Configurações", icon: Settings }] },
] as const;

function NavLinks({ onSelect }: { onSelect?: () => void }) {
  const pathname = useLocation({ select: (location) => location.pathname });
  return <nav className="space-y-5 p-4">{navigation.map(({ section, items }) => <div key={section}><p className="mb-2 px-3 text-[10px] font-semibold tracking-[0.16em] text-muted-foreground/55">{section}</p><div className="space-y-0.5">{items.map(({ to, label, icon: Icon }) => { const active = to === "/app" ? pathname === to : pathname.startsWith(to); return <Link key={to} to={to} onClick={onSelect} className={cn("group relative flex h-10 items-center gap-3 rounded-lg px-3 text-sm transition-all duration-200", active ? "bg-brand/10 font-medium text-brand" : "text-sidebar-foreground/60 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground")}><Icon className={cn("size-4 transition-transform group-hover:scale-105", active && "stroke-[2.2]")} />{label}</Link>; })}</div></div>)}</nav>;
}

export function AppShell() {
  const navigate = useNavigate();  const isAdmin = useQuery({
    queryKey: ["is-admin"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;
      const { data } = await supabase.from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin").maybeSingle();
      return Boolean(data);
    },
  });
  const [signingOut, setSigningOut] = useState(false);
  async function signOut() {
    setSigningOut(true);
    await supabase.auth.signOut();
    navigate({ to: "/login" });
  }
  return <div className="min-h-screen bg-background lg:grid lg:grid-cols-[240px_1fr]">
    <aside className="hidden border-r border-sidebar-border/70 bg-sidebar lg:flex lg:min-h-screen lg:flex-col">
      <div className="flex h-20 items-center border-b border-sidebar-border/70 px-5"><Logo /></div>
      <div className="flex-1 overflow-y-auto"><NavLinks /></div>
            <div className="border-t border-sidebar-border p-3">
        {isAdmin.data && <Link to="/app/admin" className="mb-1 flex h-9 items-center gap-2 rounded-md px-3 text-xs text-muted-foreground hover:text-foreground"><ShieldCheck className="size-4" /> Administração</Link>}
        <Button variant="ghost" className="w-full justify-start text-muted-foreground" onClick={signOut} disabled={signingOut}><LogOut /> Sair</Button>
      </div>
    </aside>
    <main className="min-w-0 pb-20 lg:pb-0">
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/90 px-4 backdrop-blur-xl sm:px-6 lg:h-20 lg:px-8">
        <div className="lg:hidden"><Logo /></div><div className="hidden lg:block"><p className="font-display text-lg font-semibold tracking-tight">Centro de controle</p><p className="text-xs text-muted-foreground">Acompanhe sua operação em tempo real</p></div>
        <div className="flex items-center gap-1"><Button asChild size="icon" variant="ghost"><Link to="/app/notificacoes" aria-label="Notificações"><Bell /></Link></Button>
          <Sheet><SheetTrigger asChild><Button size="icon" variant="ghost" className="lg:hidden" aria-label="Abrir menu"><Menu /></Button></SheetTrigger><SheetContent side="right" className="w-72 bg-sidebar p-0"><SheetHeader className="border-b border-sidebar-border p-5"><SheetTitle><Logo /></SheetTitle></SheetHeader><NavLinks /></SheetContent></Sheet>
        </div>
      </header>
      <Outlet />
    </main>
    <nav className="fixed inset-x-0 bottom-0 z-40 grid h-16 grid-cols-5 border-t border-border bg-background/95 px-2 backdrop-blur-xl lg:hidden">
      {[["/app", "Início", LayoutDashboard], ["/app/veiculos", "Carros", Car], ["/app/clientes", "Clientes", Users], ["/app/pagamentos", "Financeiro", WalletCards], ["/app/configuracoes", "Mais", Menu] as const].map(([to, label, Icon]) => <Link key={label} to={to} className="flex flex-col items-center justify-center gap-1 text-[11px] text-muted-foreground transition-colors data-[status=active]:text-brand"><Icon className="size-4" />{label}</Link>)}
    </nav>
  </div>;
}
