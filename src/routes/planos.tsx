import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Check, Sparkles } from "lucide-react";
import { PublicHeader } from "@/components/site/PublicHeader";
import { PublicFooter } from "@/components/site/PublicFooter";
import { Button } from "@/components/ui/button";
import { plansQuery, settingsQuery } from "@/lib/queries";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/planos")({
  head: () => ({
    meta: [
      { title: "Planos — movvia" },
      {
        name: "description",
        content:
          "Planos por tamanho de frota: de 5 a mais de 100 veículos. Escolha o plano ideal para controlar seus carros alugados.",
      },
      { property: "og:title", content: "Planos — movvia" },
      {
        property: "og:description",
        content: "Planos por quantidade de veículos, do primeiro carro à frota inteira.",
      },
      { property: "og:url", content: "/planos" },
    ],
    links: [{ rel: "canonical", href: "/planos" }],
  }),
  component: PlansPage,
});

function PlansPage() {
  const [cycle, setCycle] = useState<"mensal" | "anual">("mensal");
  const { data: plans = [], isLoading } = useQuery(plansQuery);
  const { data: settings } = useQuery(settingsQuery);
  const trialDays = Number(settings?.["trial_days"] ?? 7);

  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />
      <main className="aurora">
        <section className="mx-auto max-w-6xl px-4 py-14 text-center sm:py-20">
          <h1 className="font-display text-4xl font-bold sm:text-5xl">
            Planos do tamanho da <span className="brand-gradient-text">sua frota</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Comece com poucos carros e mude de plano quando sua frota crescer. Sem CNPJ, sem
            burocracia. {trialDays} dias de teste grátis.
          </p>

          <div className="mx-auto mt-8 inline-flex rounded-full border border-border bg-surface p-1">
            {(["mensal", "anual"] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setCycle(option)}
                className={cn(
                  "rounded-full px-5 py-2 text-sm font-medium transition-colors",
                  cycle === option
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {option === "mensal" ? "Mensal" : "Anual"}
              </button>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 pb-20">
          {isLoading ? (
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {[0, 1, 2].map((index) => (
                <div key={index} className="h-80 animate-pulse rounded-2xl border border-border bg-surface/50" />
              ))}
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {plans.map((plan) => {
                const highlighted = plan.code === "pro";
                const price =
                  cycle === "mensal" ? plan.price_monthly_cents : plan.price_yearly_cents;
                const features = Array.isArray(plan.features) ? (plan.features as string[]) : [];
                return (
                  <div
                    key={plan.id}
                    className={cn(
                      "flex flex-col rounded-2xl border bg-surface/50 p-6 transition-all hover:-translate-y-1",
                      highlighted ? "border-brand/50 glow-brand" : "border-border",
                    )}
                  >
                    {highlighted && (
                      <span className="mb-3 inline-flex w-fit items-center gap-1.5 rounded-full bg-brand/15 px-3 py-1 text-xs font-medium text-brand">
                        <Sparkles className="size-3" /> Mais escolhido
                      </span>
                    )}
                    <h2 className="font-display text-xl font-bold">{plan.name}</h2>
                    <p className="text-sm text-muted-foreground">{plan.tagline}</p>

                    <div className="mt-5">
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
                      <p className="mt-1 text-sm text-brand">
                        {plan.vehicle_limit ? `Até ${plan.vehicle_limit} veículos` : "Veículos ilimitados"}
                      </p>
                    </div>

                    <ul className="mt-5 flex-1 space-y-2.5">
                      {features.map((feature) => (
                        <li key={feature} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <Check className="mt-0.5 size-4 shrink-0 text-brand" />
                          {feature}
                        </li>
                      ))}
                    </ul>

                    <Button
                      asChild
                      className="mt-6"
                      variant={highlighted ? "default" : "outline"}
                    >
                      <Link to="/cadastro" search={{ plano: plan.code, ciclo: cycle }}>
                        {plan.is_custom ? "Falar com a gente" : "Começar agora"}
                      </Link>
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>
      <PublicFooter />
    </div>
  );
}
