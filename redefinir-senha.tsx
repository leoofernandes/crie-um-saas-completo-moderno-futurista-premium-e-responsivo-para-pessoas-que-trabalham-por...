import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/redefinir-senha")({ component: ResetPasswordPage });

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (password.length < 8 || password !== confirm) {
      toast.error(password !== confirm ? "As senhas não conferem" : "A senha precisa de pelo menos 8 caracteres");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      toast.error("Não foi possível atualizar a senha", { description: error.message });
      return;
    }

    toast.success("Senha atualizada com sucesso");
    navigate({ to: "/login" });
  }

  return (
    <div className="aurora flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="glass-panel rounded-xl p-6 sm:p-8">
          <h1 className="font-display text-2xl font-bold">Redefinir senha</h1>
          <p className="mt-1 text-sm text-muted-foreground">Escolha uma nova senha para sua conta.</p>
          <form onSubmit={submit} className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Nova senha</Label>
              <Input id="password" type="password" minLength={8} required value={password} onChange={(event) => setPassword(event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm">Confirmar senha</Label>
              <Input id="confirm" type="password" required value={confirm} onChange={(event) => setConfirm(event.target.value)} />
            </div>
            <Button className="w-full" disabled={loading}>
              {loading && <Loader2 className="size-4 animate-spin" />}
              Atualizar senha
            </Button>
          </form>
          <p className="mt-6 text-center text-sm">
            <Link to="/login" className="text-brand hover:underline">Voltar para entrar</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
