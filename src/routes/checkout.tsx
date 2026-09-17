import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, Check, AlertCircle } from "lucide-react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { Steps } from "@/components/site/Steps";
import { plansQuery, settingsQuery } from "@/lib/queries";
import { formatCurrency, formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

const searchSchema = z.object({
  plano: z.string().optional(),
  ciclo: z.enum(["mensal", "anual"]).optional(),
});

export const Route = createFileRoute("/checkout")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Checkout — movvia" },
      { name: "description", content: "Finalize sua assinatura e comece a usar o movvia." },
      { property: "og:title", content: "Checkout — movvia" },
      { property: "og:description", content: "Finalize sua assinatura no movvia." },
      { property: "og:url", content: "/checkout" },
      { name: "robots", content: "noindex" },
    ],
    links: [{ rel: "canonical", href: "/checkout" }],
  }),
  component: CheckoutPage,
});

function CheckoutPage() {
  const { plano, ciclo } = Route.useSearch();
  const navigate = useNavigate();
  const { data: plans = [], isLoading: plansLoading } = useQuery(plansQuery);
  const { data: settings } = useQuery(settingsQuery);
  const trialDays = Number(settings?.["trial_days"] ?? 7);

  const [cycle, setCycle] = useState<"mensal" | "anual">(ciclo ?? "mensal");
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const plan = plans.find((item) => item.code === plano) ?? plans[0];
  const price = plan
    ? cycle === "mensal"
      ? plan.price_monthly_cents
      : plan.price_yearly_cents
    : null;

  async function handleSubscribe() {
    if (!plan) return;
    setLoading(true);

    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData.session?.user?.id;

    if (!userId) {
      setLoading(false);
      toast.error("Você precisa estar logado", {
        description: "Redirecionando para o login.",
      });
      navigate({ to: "/login" });
      return;
    }

    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + trialDays);

    const { error } = await supabase.from("subscriptions").insert({
      user_id: userId,
      plan_id: plan.id,
      status: "trial",
      billing_cycle: cycle,
      trial_ends_at: trialEndsAt.toISOString(),
      current_period_starts_at: new Date().toISOString(),
      current_period_ends_at: trialEndsAt.toISOString(),
    });

    setLoading(false);

    if (error) {
      toast.error("Não foi possível ativar sua assinatura", {
        description: error.message,
      });
      return;
    }

    setConfirmed(true);
    toast.success("Assinatura ativada", {
      description: `Você tem ${trialDays} dias de teste.`,
    });
  }

  if (plansLoading) {
    return (
      <div className="aurora grid-backdrop flex min-h-screen items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg">
          <Link to="/" className="mb-8 flex justify-center">
            <Logo />
          </Link>
          <div className="glass-panel rounded-2xl p-8">
            <div className="h-48 animate-pulse rounded-xl bg-surface/50" />
          </div>
        </div>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="aurora grid-backdrop flex min-h-screen items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg text-center">
          <Link to="/" className="mb-8 flex justify-center">
            <Logo />
          </Link>
          <div className="glass-panel rounded-2xl p-8">
            <AlertCircle className="mx-auto size-10 text-muted-foreground" />
            <h1 className="mt-4 font-display text-xl font-semibold">Plano não encontrado</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Escolha um plano para continuar.
            </p>
            <Button asChild className="mt-6">
              <Link to="/planos">Ver planos</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (confirmed) {
    return (
      <div className="aurora grid-backdrop flex min-h-screen items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg text-center">
          <Link to="/" className="mb-8 flex justify-center">
            <Logo />
          </Link>
          <div className="glass-panel rounded-2xl p-8">
            <div className="mx-auto grid size-16 place-items-center rounded-full bg-brand/15">
              <Check className="size-8 text-brand" />
            </div>
            <h1 className="mt-6 font-display text-2xl font-bold">Seu painel está pronto</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Assinatura ativada. Teste grátis até {formatDate(trialEndsAt)}.
            </p>
            <Button asChild className="mt-8 w-full">
              <Link to="/app">Acessar minha frota</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const trialEndsAt = new Date();
  trialEndsAt.setDate(trialEndsAt.getDate() + trialDays);

  return (
    <div className="aurora grid-backdrop min-h-screen px-4 py-12">
      <div className="mx-auto w-full max-w-lg">
        <Link to="/" className="mb-8 flex justify-center">
          <Logo />
        </Link>
        <div className="glass-panel rounded-2xl p-6 sm:p-8">
          <Steps current={3} />
          <h1 className="mt-5 font-display text-2xl font-bold">Finalize sua assinatura</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Revise o plano e comece seu teste grátis.
          </p>

          <div className="mt-6 rounded-xl border border-border bg-surface/50 p-5">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="font-display text-lg font-semibold">{plan.name}</h2>
                <p className="text-sm text-muted-foreground">{plan.tagline}</p>
              </div>
              <span className="rounded-full bg-brand/15 px-2.5 py-1 text-xs font-medium text-brand">
                {trialDays} dias grátis
              </span>
            </div>

            <div className="mt-4 inline-flex rounded-full border border-border bg-background p-1">
              {(["mensal", "anual"] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setCycle(option)}
                  className={cn(
                    "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                    cycle === option
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {option === "mensal" ? "Mensal" : "Anual"}
                </button>
              ))}
            </div>

            <div className="mt-5 border-t border-border pt-5">
              {plan.is_custom || price == null ? (
                <p className="font-display text-3xl font-bold">Sob medida</p>
              ) : (
                <p className="font-display text-3xl font-bold">
                  {formatCurrency(price)}
                  <span className="text-sm font-normal text-muted-foreground">
                    /{cycle === "mensal" ? "mês" : "ano"}
                  </span>
                </p>
              )}
              <p className="mt-1 text-sm text-muted-foreground">
                {plan.vehicle_limit
                  ? `Até ${plan.vehicle_limit} veículos`
                  : "Veículos ilimitados"}
              </p>
            </div>

            <ul className="mt-5 space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Check className="size-4 text-brand" /> Teste grátis de {trialDays} dias
              </li>
              <li className="flex items-center gap-2">
                <Check className="size-4 text-brand" /> Cancele quando quiser
              </li>
              <li className="flex items-center gap-2">
                <Check className="size-4 text-brand" /> Sem CNPJ exigido
              </li>
            </ul>
          </div>

          <div className="mt-6 rounded-xl border border-brand/20 bg-brand/5 p-4 text-sm">
            <p className="flex items-start gap-2 text-brand">
              <AlertCircle className="mt-0.5 size-4 shrink-0" />
              Nenhuma cobrança real será gerada agora. Esta é uma estrutura de checkout; os
              pagamentos serão configurados em breve.
            </p>
          </div>

          <Button
            className="mt-6 w-full"
            disabled={loading}
            onClick={handleSubscribe}
          >
            {loading && <Loader2 className="size-4 animate-spin" />}
            Assinar e começar
          </Button>

          <p className="mt-4 text-center text-xs text-muted-foreground">
            Ao assinar, você concorda com os{" "}
            <Link to="/termos" className="text-brand hover:underline">
              Termos de Uso
            </Link>{" "}
            e{" "}
            <Link to="/privacidade" className="text-brand hover:underline">
              Política de Privacidade
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
