import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { supabase } from "@/supabase/client";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/recuperar-senha")({
  head: () => ({
    meta: [
      { title: "Recuperar senha — movvia" },
      { name: "description", content: "Recupere o acesso à sua conta no movvia." },
      { property: "og:title", content: "Recuperar senha — movvia" },
      { property: "og:description", content: "Recupere o acesso à sua conta no movvia." },
      { property: "og:url", content: "/recuperar-senha" },
      { name: "robots", content: "noindex" },
    ],
    links: [{ rel: "canonical", href: "/recuperar-senha" }],
  }),
  component: RecoverPasswordPage,
});

function RecoverPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/redefinir-senha`,
    });
    setLoading(false);
    if (error) {
      toast.error("Não foi possível enviar o e-mail", { description: error.message });
      return;
    }
    setSent(true);
    toast.success("E-mail enviado", {
      description: "Se o e-mail existir, você receberá instruções em instantes.",
    });
  }

  return (
    <div className="aurora grid-backdrop flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <Link to="/" className="mb-8 flex justify-center">
          <Logo />
        </Link>
        <div className="glass-panel rounded-2xl p-6 sm:p-8">
          <h1 className="font-display text-2xl font-bold">Recuperar senha</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Enviaremos um link para redefinir sua senha.
          </p>

          {sent ? (
            <div className="mt-6 space-y-4">
              <p className="text-sm text-muted-foreground">
                Verifique sua caixa de entrada. Se não encontrar, olhe na pasta de spam.
              </p>
              <Button variant="outline" className="w-full" onClick={() => navigate({ to: "/login" })}>
                Voltar para o login
              </Button>
            </div>
          ) : (
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
              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="size-4 animate-spin" />}
                Enviar link
              </Button>
            </form>
          )}

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Lembrou sua senha?{" "}
            <Link to="/login" className="font-medium text-brand hover:underline">
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
