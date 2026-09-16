import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/recuperar-senha")({ component: RecoverPasswordPage });

function RecoverPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: `${window.location.origin}/redefinir-senha` });
    setLoading(false);
    if (error) { toast.error("Não foi possível enviar o e-mail", { description: error.message }); return; }
    setSent(true);
  }
  return <AuthCard title="Recuperar senha" subtitle={sent ? "Confira sua caixa de entrada para continuar." : "Enviaremos um link seguro para redefinir sua senha."}>
    {sent ? <Button asChild className="w-full"><Link to="/login">Voltar para o login</Link></Button> : <form onSubmit={submit} className="space-y-4"><div className="space-y-2"><Label htmlFor="email">E-mail</Label><Input id="email" type="email" required value={email} onChange={e => setEmail(e.target.value)} /></div><Button className="w-full" disabled={loading}>{loading && <Loader2 className="size-4 animate-spin" />}Enviar link</Button></form>}
    <p className="mt-6 text-center text-sm text-muted-foreground"><Link to="/login" className="text-brand hover:underline">Voltar para entrar</Link></p>
  </AuthCard>;
}
function AuthCard({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) { return <div className="aurora flex min-h-screen items-center justify-center px-4 py-12"><div className="w-full max-w-md"><Link to="/" className="mb-8 flex justify-center"><Logo /></Link><div className="glass-panel rounded-xl p-6 sm:p-8"><h1 className="font-display text-2xl font-bold">{title}</h1><p className="mt-1 text-sm text-muted-foreground">{subtitle}</p><div className="mt-6">{children}</div></div></div></div>; }
