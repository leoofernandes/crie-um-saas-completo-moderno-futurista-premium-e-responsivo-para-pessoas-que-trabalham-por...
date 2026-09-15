import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { plansQuery } from "@/lib/queries";
import { Steps } from "@/components/site/Steps";

const searchSchema = z.object({
  plano: z.string().optional(),
  ciclo: z.enum(["mensal", "anual"]).optional(),
});

export const Route = createFileRoute("/cadastro")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Criar conta — movvia" },
      { name: "description", content: "Crie sua conta e comece a controlar seus carros alugados." },
      { property: "og:title", content: "Criar conta — movvia" },
      { property: "og:description", content: "Crie sua conta no movvia em menos de um minuto." },
      { property: "og:url", content: "/cadastro" },
      { name: "robots", content: "noindex" },
    ],
    links: [{ rel: "canonical", href: "/cadastro" }],
  }),
  component: SignupPage,
});

const formSchema = z
  .object({
    name: z.string().trim().min(2, "Informe seu nome").max(100),
    email: z.string().trim().email("E-mail inválido").max(255),
    whatsapp: z.string().trim().min(10, "Informe seu WhatsApp com DDD").max(20),
    password: z.string().min(8, "A senha precisa de pelo menos 8 caracteres").max(72),
    confirm: z.string(),
  })
  .refine((data) => data.password === data.confirm, {
    message: "As senhas não conferem",
    path: ["confirm"],
  });

function SignupPage() {
  const { plano, ciclo } = Route.useSearch();
  const navigate = useNavigate();
  const { data: plans = [] } = useQuery(plansQuery);
  const plan = plans.find((item) => item.code === plano) ?? plans[0];

  const [form, setForm] = useState({ name: "", email: "", whatsapp: "", password: "", confirm: "" });
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);

  function update(field: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const parsed = formSchema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Verifique os dados");
      return;
    }
    if (!accepted) {
      toast.error("É preciso aceitar os Termos de Uso e a Política de Privacidade");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        emailRedirectTo: `${window.location.origin}/app`,
        data: { full_name: parsed.data.name, whatsapp: parsed.data.whatsapp },
      },
    });
    setLoading(false);
    if (error) {
      toast.error("Não foi possível criar a conta", {
        description: error.message.includes("already")
          ? "Este e-mail já está cadastrado. Tente entrar."
          : error.message,
      });
      return;
    }
    navigate({ to: "/checkout", search: { plano: plan?.code, ciclo: ciclo ?? "mensal" } });
  }

  return (
    <div className="aurora grid-backdrop flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <Link to="/" className="mb-8 flex justify-center">
          <Logo />
        </Link>
        <div className="glass-panel rounded-2xl p-6 sm:p-8">
          <Steps current={2} />
          <h1 className="mt-5 font-display text-2xl font-bold">Criar sua conta</h1>
          {plan && (
            <p className="mt-1 text-sm text-muted-foreground">
              Plano <span className="font-medium text-brand">{plan.name}</span> ·{" "}
              {ciclo === "anual" ? "cobrança anual" : "cobrança mensal"}
            </p>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input id="name" value={form.name} onChange={(e) => update("name", e.target.value)} required maxLength={100} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input id="email" type="email" value={form.email} onChange={(e) => update("email", e.target.value)} required maxLength={255} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="whatsapp">WhatsApp</Label>
                <Input id="whatsapp" inputMode="tel" placeholder="(11) 99999-0000" value={form.whatsapp} onChange={(e) => update("whatsapp", e.target.value)} required maxLength={20} />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input id="password" type="password" value={form.password} onChange={(e) => update("password", e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm">Confirmar senha</Label>
                <Input id="confirm" type="password" value={form.confirm} onChange={(e) => update("confirm", e.target.value)} required />
              </div>
            </div>

            <label className="flex items-start gap-3 text-sm text-muted-foreground">
              <Checkbox checked={accepted} onCheckedChange={(value) => setAccepted(value === true)} className="mt-0.5" />
              <span>
                Li e concordo com os{" "}
                <Link to="/termos" className="text-brand hover:underline">
                  Termos de Uso
                </Link>{" "}
                e a{" "}
                <Link to="/privacidade" className="text-brand hover:underline">
                  Política de Privacidade
                </Link>
                .
              </span>
            </label>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="size-4 animate-spin" />}
              Continuar
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Já tem conta?{" "}
            <Link to="/login" className="font-medium text-brand hover:underline">
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
