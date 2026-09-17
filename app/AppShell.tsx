import { useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import {
  Bell, Car, ChartNoAxesCombined, Contact, FileChartColumn, Globe2, LayoutDashboard,
  LogOut, Menu, ReceiptText, Settings, Users, WalletCards, Wrench,
} from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { supabase } from "@/supabase/client";
import { cn } from "@/lib/utils";

const navigation = [
  { to: "/app", label: "Dashboard", icon: LayoutDashboard },
  { to: "/app/veiculos", label: "Carros", icon: Car },
  { to: "/app/clientes", label: "Clientes", icon: Users },
  { to: "/app/alugueis", label: "Aluguéis", icon: Contact },
  { to: "/app/pagamentos", label: "Pagamentos", icon: WalletCards },
  { to: "/app/manutencoes", label: "Manutenções", icon: Wrench },
  { to: "/app/despesas", label: "Despesas", icon: ReceiptText },
  { to: "/app/relatorios", label: "Relatórios", icon: FileChartColumn },
  { to: "/app/catalogo", label: "Meu catálogo", icon: Globe2 },
  { to: "/app/notificacoes", label: "Notificações", icon: Bell },
  { to: "/app/configuracoes", label: "Configurações", icon: Settings },
] as const;

function NavLinks({ onSelect }: { onSelect?: () => void }) {
  const pathname = useLocation({ select: (location) => location.pathname });
  return <nav className="space-y-1 p-3">{navigation.map(({ to, label, icon: Icon }) => {
    const active = to === "/app" ? pathname === to : pathname.startsWith(to);
    return <Link key={to} to={to} onClick={onSelect} className={cn("flex h-11 items-center gap-3 rounded-md px-3 text-sm transition-colors", active ? "bg-sidebar-accent font-medium text-sidebar-primary" : "text-sidebar-foreground/65 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground")}><Icon className="size-4" />{label}</Link>;
  })}</nav>;
}

export function AppShell() {
  const navigate = useNavigate();
  const [signingOut, setSigningOut] = useState(false);
  async function signOut() {
    setSigningOut(true);
    await supabase.auth.signOut();
    navigate({ to: "/login" });
  }
  return <div className="min-h-screen bg-background lg:grid lg:grid-cols-[240px_1fr]">
    <aside className="hidden border-r border-sidebar-border bg-sidebar lg:flex lg:min-h-screen lg:flex-col">
      <div className="flex h-20 items-center border-b border-sidebar-border px-6"><Logo /></div>
      <div className="flex-1 overflow-y-auto"><NavLinks /></div>
      <div className="border-t border-sidebar-border p-3"><Button variant="ghost" className="w-full justify-start text-muted-foreground" onClick={signOut} disabled={signingOut}><LogOut /> Sair</Button></div>
    </aside>
    <main className="min-w-0 pb-20 lg:pb-0">
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/90 px-4 backdrop-blur-xl sm:px-6 lg:h-20 lg:px-8">
        <div className="lg:hidden"><Logo /></div><p className="hidden text-sm text-muted-foreground lg:block">Painel de controle da sua frota</p>
        <div className="flex items-center gap-1"><Button asChild size="icon" variant="ghost"><Link to="/app/notificacoes" aria-label="Notificações"><Bell /></Link></Button>
          <Sheet><SheetTrigger asChild><Button size="icon" variant="ghost" className="lg:hidden" aria-label="Abrir menu"><Menu /></Button></SheetTrigger><SheetContent side="right" className="w-72 bg-sidebar p-0"><SheetHeader className="border-b border-sidebar-border p-5"><SheetTitle><Logo /></SheetTitle></SheetHeader><NavLinks /></SheetContent></Sheet>
        </div>
      </header>
      <Outlet />
    </main>
    <nav className="fixed inset-x-0 bottom-0 z-40 grid h-16 grid-cols-5 border-t border-border bg-background/95 px-2 backdrop-blur-xl lg:hidden">
      {[navigation[0], navigation[1], navigation[2], navigation[4], { to: "/app/configuracoes", label: "Mais", icon: Menu } as const].map(({ to, label, icon: Icon }) => <Link key={label} to={to} className="flex flex-col items-center justify-center gap-1 text-[11px] text-muted-foreground data-[status=active]:text-brand"><Icon className="size-4" />{label}</Link>)}
    </nav>
  </div>;
}
