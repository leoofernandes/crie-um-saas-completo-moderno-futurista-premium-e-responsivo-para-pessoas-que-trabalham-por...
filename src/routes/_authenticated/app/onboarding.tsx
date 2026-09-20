import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Car, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { vehiclesQuery } from "@/lib/queries";

export const Route = createFileRoute("/_authenticated/app/onboarding")({ component: OnboardingPage });

const FLEET_OPTIONS = ["1", "2–5", "6–10", "11–20", "21–50", "50+"];

function OnboardingPage() {
  const navigate = useNavigate();
  const client = useQueryClient();
  const vehicles = useQuery(vehiclesQuery);
  const [step, setStep] = useState(0);
  const [fleetSize, setFleetSize] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function saveAndExit(done: boolean) {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("profiles").update({ fleet_size_range: fleetSize, onboarding_done: done }).eq("id", user.id);
      client.invalidateQueries({ queryKey: ["profile"] });
    }
    setSaving(false);
    navigate({ to: "/app" });
  }

  const hasVehicle = (vehicles.data?.length ?? 0) > 0;

  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-xl flex-col justify-center px-4 py-10 sm:px-6">
      <div className="rounded-md border border-border bg-card p-6 sm:p-8">
        {step === 0 && (
          <div>
            <div className="grid size-12 place-items-center rounded-full bg-brand/15"><Car className="size-6 text-brand" /></div>
            <h1 className="mt-4 font-display text-2xl font-bold">Vamos configurar sua frota.</h1>
            <p className="mt-2 text-sm text-muted-foreground">Leva menos de um minuto e você pode pular qualquer parte.</p>
            <Button className="mt-6 w-full" onClick={() => setStep(1)}>Começar</Button>
            <button className="mt-3 w-full text-center text-sm text-muted-foreground hover:text-foreground" onClick={() => saveAndExit(true)}>Pular por agora</button>
          </div>
        )}

        {step === 1 && (
          <div>
            <h1 className="font-display text-2xl font-bold">Quantos carros você aluga atualmente?</h1>
            <p className="mt-2 text-sm text-muted-foreground">Isso só nos ajuda a te mostrar dicas melhores — não limita nada.</p>
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {FLEET_OPTIONS.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setFleetSize(option)}
                  className={`rounded-md border p-4 text-center font-display text-lg font-semibold transition-colors ${fleetSize === option ? "border-brand bg-brand/10 text-brand" : "border-border hover:border-brand/50"}`}
                >
                  {option}
                </button>
              ))}
            </div>
            <Button className="mt-6 w-full" disabled={!fleetSize} onClick={() => setStep(2)}>Continuar</Button>
            <button className="mt-3 w-full text-center text-sm text-muted-foreground hover:text-foreground" onClick={() => setStep(2)}>Pular esta etapa</button>
          </div>
        )}

        {step === 2 && (
          <div>
            <h1 className="font-display text-2xl font-bold">Cadastre seu primeiro carro.</h1>
            <p className="mt-2 text-sm text-muted-foreground">Você pode fazer isso agora ou depois, com calma.</p>
            {hasVehicle ? (
              <p className="mt-4 flex items-center gap-2 text-sm text-brand"><Check className="size-4" /> Você já tem pelo menos um carro cadastrado.</p>
            ) : (
              <Button asChild className="mt-6 w-full" variant="outline">
                <Link to="/app/veiculos">Cadastrar agora</Link>
              </Button>
            )}
            <Button className="mt-3 w-full" disabled={saving} onClick={() => saveAndExit(true)}>{saving ? "Salvando..." : "Ir para o painel"}</Button>
          </div>
        )}
      </div>
    </div>
  );
}
