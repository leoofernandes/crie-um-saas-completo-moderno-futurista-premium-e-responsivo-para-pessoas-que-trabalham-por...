import { Link } from "@tanstack/react-router";
import { Logo } from "@/components/brand/Logo";

export function PublicFooter() {
  return (
    <footer className="border-t border-border/60 bg-background">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <Logo />
          <p className="max-w-xs text-sm text-muted-foreground">
            Gestão de aluguel de carros para quem trabalha por conta própria.
          </p>
        </div>
        <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
          <Link to="/planos" className="hover:text-foreground">
            Planos
          </Link>
          <Link to="/login" className="hover:text-foreground">
            Entrar
          </Link>
          <Link to="/termos" className="hover:text-foreground">
            Termos de uso
          </Link>
          <Link to="/privacidade" className="hover:text-foreground">
            Privacidade
          </Link>
        </nav>
      </div>
      <div className="border-t border-border/60 px-4 py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} movvia. Todos os direitos reservados.
      </div>
    </footer>
  );
}
