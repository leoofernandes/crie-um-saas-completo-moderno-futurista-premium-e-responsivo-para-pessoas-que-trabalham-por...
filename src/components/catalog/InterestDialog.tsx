import { useState, type FormEvent } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { sendCatalogInterest } from "@/lib/catalog.functions";
import { Button } from "@/components/ui/button";
import { vehicleTitle, type CatalogVehicle } from "./catalog-utils";

export function InterestDialog({
  open,
  onOpenChange,
  car,
  siteId,
  accent,
  onAccent,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  car: CatalogVehicle;
  siteId: string;
  accent: string;
  onAccent: string;
}) {
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleOpenChange(next: boolean) {
    onOpenChange(next);
    if (!next) {
      // limpa o estado depois da animação de fechar
      window.setTimeout(() => {
        setSent(false);
        setError(null);
      }, 200);
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") ?? "").trim();
    const whatsapp = String(form.get("whatsapp") ?? "").trim();
    const message = String(form.get("message") ?? "").trim();

    if (name.length < 2) {
      setError("Informe seu nome.");
      return;
    }
    if (whatsapp.replace(/\D/g, "").length < 10) {
      setError("Informe um WhatsApp válido, com DDD.");
      return;
    }

    setSending(true);
    try {
      await sendCatalogInterest({ data: { siteId, vehicleId: car.id, name, whatsapp, message, website: String(form.get("website") ?? "") } });
      setSent(true);
    } catch {
      setError("Não foi possível enviar agora. Tente de novo em instantes.");
      toast.error("Não foi possível enviar seu interesse.");
    } finally { setSending(false); }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="catalog-root max-w-md rounded-lg border-(--c-line) bg-(--c-raise) text-(--c-text)" style={{ "--c-accent": accent, "--c-on-accent": onAccent } as React.CSSProperties}>
        {sent ? (
          <div className="py-6 text-center">
            <CheckCircle2 className="mx-auto size-12" style={{ color: accent }} strokeWidth={1.5} />
            <DialogTitle className="catalog-serif mt-4 text-2xl">Interesse enviado com sucesso!</DialogTitle>
            <DialogDescription className="mt-2 text-(--c-mute)">
              Em breve entraremos em contato pelo WhatsApp que você informou.
            </DialogDescription>
            <Button
              type="button"
              onClick={() => handleOpenChange(false)}
              className="catalog-cta mt-6 px-6 py-2.5 text-sm font-medium"
            >
              Fechar
            </Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="catalog-serif text-2xl">Tenho interesse</DialogTitle>
              <DialogDescription className="text-(--c-mute)">
                Você está interessado em:{" "}
                <span className="font-medium text-(--c-text)">{vehicleTitle(car)}</span>
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={submit} className="mt-2 space-y-4" noValidate>
              <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
              <div>
                <label htmlFor="interest-name" className="mb-1.5 block text-sm text-(--c-mute)">Nome</label>
                <Input id="interest-name" name="name" placeholder="Seu nome" autoComplete="name" maxLength={120} required className="h-11 border-(--c-line) bg-(--c-bg)" />
              </div>
              <div>
                <label htmlFor="interest-whatsapp" className="mb-1.5 block text-sm text-(--c-mute)">WhatsApp</label>
                <Input id="interest-whatsapp" name="whatsapp" type="tel" inputMode="tel" placeholder="(11) 99999-9999" autoComplete="tel" maxLength={30} required className="h-11 border-(--c-line) bg-(--c-bg)" />
              </div>
              <div>
                <label htmlFor="interest-message" className="mb-1.5 block text-sm text-(--c-mute)">Mensagem (opcional)</label>
                <Textarea id="interest-message" name="message" placeholder="Alguma dúvida ou preferência?" rows={3} maxLength={2000} className="border-(--c-line) bg-(--c-bg)" />
              </div>

              {error && (
                <p role="alert" className="text-sm text-destructive">
                  {error}
                </p>
              )}

              <Button
                type="submit"
                disabled={sending}
                className="catalog-cta flex h-12 w-full items-center justify-center gap-2 text-sm font-semibold transition-opacity disabled:opacity-60"
              >
                {sending && <Loader2 className="size-4 animate-spin" />}
                {sending ? "Enviando..." : "Enviar interesse"}
              </Button>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
