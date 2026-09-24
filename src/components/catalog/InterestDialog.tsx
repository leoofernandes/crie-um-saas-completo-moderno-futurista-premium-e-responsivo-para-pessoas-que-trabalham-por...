import { useState, type FormEvent } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { vehicleTitle, type CatalogVehicle } from "./catalog-utils";

export function InterestDialog({
  open,
  onOpenChange,
  car,
  siteId,
  ownerId,
  accent,
  onAccent,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  car: CatalogVehicle;
  siteId: string;
  ownerId: string;
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
    const { error: insertError } = await supabase.from("site_leads").insert({
      user_id: ownerId,
      site_id: siteId,
      vehicle_id: car.id,
      name,
      whatsapp,
      message: message || null,
    });
    setSending(false);

    if (insertError) {
      setError("Não foi possível enviar agora. Tente de novo em instantes.");
      toast.error("Não foi possível enviar seu interesse.");
      return;
    }
    setSent(true);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md rounded-2xl border-white/10 bg-[#17181b] text-[#f3f2ee]">
        {sent ? (
          <div className="py-6 text-center">
            <CheckCircle2 className="mx-auto size-12" style={{ color: accent }} strokeWidth={1.5} />
            <DialogTitle className="catalog-serif mt-4 text-2xl">Interesse enviado com sucesso!</DialogTitle>
            <DialogDescription className="mt-2 text-[#9b9ca4]">
              Em breve entraremos em contato pelo WhatsApp que você informou.
            </DialogDescription>
            <button
              type="button"
              onClick={() => handleOpenChange(false)}
              className="mt-6 rounded-full px-6 py-2.5 text-sm font-medium"
              style={{ background: accent, color: onAccent }}
            >
              Fechar
            </button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="catalog-serif text-2xl">Tenho interesse</DialogTitle>
              <DialogDescription className="text-[#9b9ca4]">
                Você está interessado em:{" "}
                <span className="font-medium text-[#f3f2ee]">{vehicleTitle(car)}</span>
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={submit} className="mt-2 space-y-4" noValidate>
              <div>
                <label htmlFor="interest-name" className="mb-1.5 block text-sm text-[#9b9ca4]">Nome</label>
                <Input id="interest-name" name="name" placeholder="Seu nome" autoComplete="name" required className="h-11 border-white/10 bg-black/30" />
              </div>
              <div>
                <label htmlFor="interest-whatsapp" className="mb-1.5 block text-sm text-[#9b9ca4]">WhatsApp</label>
                <Input id="interest-whatsapp" name="whatsapp" type="tel" inputMode="tel" placeholder="(11) 99999-9999" autoComplete="tel" required className="h-11 border-white/10 bg-black/30" />
              </div>
              <div>
                <label htmlFor="interest-message" className="mb-1.5 block text-sm text-[#9b9ca4]">Mensagem (opcional)</label>
                <Textarea id="interest-message" name="message" placeholder="Alguma dúvida ou preferência?" rows={3} className="border-white/10 bg-black/30" />
              </div>

              {error && (
                <p role="alert" className="text-sm text-red-400">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={sending}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-full text-sm font-semibold transition-opacity disabled:opacity-60"
                style={{ background: accent, color: onAccent }}
              >
                {sending && <Loader2 className="size-4 animate-spin" />}
                {sending ? "Enviando..." : "Enviar interesse"}
              </button>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
