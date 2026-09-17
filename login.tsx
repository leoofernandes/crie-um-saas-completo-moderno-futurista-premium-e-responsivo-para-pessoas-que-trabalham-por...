import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { supabase } from "@/supabase/client";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Entrar — movvia" },
      { name: "description", content: "Acesse o painel da sua frota no movvia." },
      { property: "og:title", content: "Entrar — movvia" },
      { property: "og:description", content: "Acesse o painel da sua frota." },
      { property: "og:url", content: "/login" },
      { name: "robots", content: "noindex" },
    ],
    links: [{ rel: "canonical", href: "/login" }],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setLoading(false);
    if (error) {
      toast.error("Não foi possível entrar", { description: "Confira seu e-mail e sua senha." });
      return;
    }
    toast.success("Bem-vindo de volta!");
    navigate({ to: "/app" });
  }

  return (
    <div className="aurora grid-backdrop flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <Link to="/" className="mb-8 flex justify-center">
          <Logo />
        </Link>
        <div className="glass-panel rounded-2xl p-6 sm:p-8">
          <h1 className="font-display text-2xl font-bold">Entrar</h1>
          <p className="mt-1 text-sm text-muted-foreground">Acesse o painel da sua frota.</p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="voce@email.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="••••••••"
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="size-4 animate-spin" />}
              Entrar
            </Button>
          </form>

          <div className="mt-6 space-y-2 text-center text-sm">
            <Link to="/recuperar-senha" className="text-muted-foreground hover:text-foreground">
              Esqueci minha senha
            </Link>
            <p className="text-muted-foreground">
              Ainda não tenho uma conta →{" "}
              <Link to="/planos" className="font-medium text-brand hover:underline">
                Começar agora
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
