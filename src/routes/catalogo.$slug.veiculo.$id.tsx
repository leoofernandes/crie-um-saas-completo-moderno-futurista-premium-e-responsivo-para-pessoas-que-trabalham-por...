import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Car, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { publicSiteQuery, publicVehicleQuery, PERIODICITY_LABEL } from "@/lib/queries";
import { formatCurrency } from "@/lib/format";

export const Route = createFileRoute("/catalogo/$slug/veiculo/$id")({
  loader: async ({ params }) => {
    const [{ data: site }, { data: vehicle }] = await Promise.all([
      supabase.from("public_sites").select("*").eq("slug", params.slug).eq("is_published", true).maybeSingle(),
      supabase.from("vehicles").select("*, vehicle_photos(*)").eq("id", params.id).eq("show_in_catalog", true).neq("status", "inativo").maybeSingle(),
    ]);
    return { site, vehicle };
  },
  head: ({ loaderData }) => {
    const site = loaderData?.site;
    const vehicle = loaderData?.vehicle;
    const title = vehicle ? `${vehicle.brand} ${vehicle.model} — ${site?.display_name ?? "Catálogo"}` : "Veículo não encontrado";
    const description = vehicle?.description || `Confira o ${vehicle?.brand ?? ""} ${vehicle?.model ?? ""} disponível para aluguel.`;
    const cover = vehicle?.vehicle_photos?.find((p) => p.is_primary) ?? vehicle?.vehicle_photos?.[0];
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        ...(cover ? [{ property: "og:image", content: cover.url }] : []),
        { name: "robots", content: "index,follow" },
      ],
    };
  },
  component: PublicVehiclePage,
});

function whatsappLink(number: string | null | undefined, text: string) {
  if (!number) return null;
  return `https://wa.me/${number.replace(/\D/g, "")}?text=${encodeURIComponent(text)}`;
}

function PublicVehiclePage() {
  const { slug, id } = Route.useParams();
  const site = useQuery(publicSiteQuery(slug));
  const vehicle = useQuery(publicVehicleQuery(id));
  const [activePhoto, setActivePhoto] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (vehicle.data) document.title = `${vehicle.data.brand} ${vehicle.data.model} — ${site.data?.display_name ?? "Catálogo"}`;
  }, [vehicle.data, site.data?.display_name]);

  if (site.isLoading || vehicle.isLoading) {
    return <div className="mx-auto max-w-4xl px-4 py-16 text-center text-muted-foreground">Carregando...</div>;
  }

  if (!site.data || !vehicle.data || vehicle.data.user_id !== site.data.user_id) {
    return (
      <div className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center px-4 text-center">
        <Car className="size-10 text-muted-foreground" />
        <h1 className="mt-4 font-display text-2xl font-bold">Veículo não encontrado</h1>
        <p className="mt-2 text-sm text-muted-foreground">Esse carro não está mais disponível.</p>
        <Link to="/catalogo/$slug" params={{ slug }} className="mt-4 text-sm text-brand hover:underline">Voltar ao catálogo</Link>
      </div>
    );
  }

  const car = vehicle.data;
  const publicSite = site.data;
  const photos = [...car.vehicle_photos].sort((a, b) => a.position - b.position);
  const message = `Olá! Vi o ${car.brand} ${car.model} no seu catálogo e tenho interesse em alugar.`;
  const chatLink = whatsappLink(publicSite.whatsapp, message);

  async function submitInterest(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSending(true);
    const form = new FormData(event.currentTarget);
    const { error } = await supabase.from("site_leads").insert({
      user_id: publicSite.user_id,
      site_id: publicSite.id,
      vehicle_id: car.id,
      name: String(form.get("name") ?? "").trim(),
      whatsapp: String(form.get("whatsapp") ?? "").trim(),
      message: String(form.get("message") ?? "").trim() || null,
    });
    setSending(false);
    if (error) { toast.error("Não foi possível enviar. Tente novamente."); return; }
    setSent(true);
    toast.success("Interesse enviado!");
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-border bg-background/90 px-4 py-4 backdrop-blur-xl sm:px-6">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <Link to="/catalogo/$slug" params={{ slug }} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="size-4" /> {publicSite.display_name}
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-[1.3fr_1fr]">
          <div>
            <div className="aspect-video w-full overflow-hidden rounded-md border border-border bg-surface">
              {photos[activePhoto] ? (
                <img src={photos[activePhoto].url} alt={`${car.brand} ${car.model}`} className="size-full object-cover" />
              ) : (
                <div className="grid size-full place-items-center text-muted-foreground"><Car className="size-10" /></div>
              )}
            </div>
            {photos.length > 1 && (
              <div className="mt-3 flex gap-2 overflow-x-auto">
                {photos.map((p, i) => (
                  <button key={p.id} onClick={() => setActivePhoto(i)} className={`size-16 shrink-0 overflow-hidden rounded-md border ${i === activePhoto ? "border-brand" : "border-border"}`}>
                    <img src={p.url} alt="" className="size-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <p className="text-sm text-brand">{car.category || "Veículo"}</p>
            <h1 className="mt-1 font-display text-3xl font-bold">{car.brand} {car.model}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{[car.year, car.color].filter(Boolean).join(" • ")}</p>

            <p className="mt-5 font-display text-2xl font-semibold text-brand">
              {formatCurrency(car.rental_price_cents)}
              <span className="text-sm font-normal text-muted-foreground"> / {(PERIODICITY_LABEL[car.rental_periodicity] ?? car.rental_periodicity).toLowerCase()}</span>
            </p>

            {car.description && <p className="mt-4 text-sm text-muted-foreground">{car.description}</p>}

            {car.features?.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {car.features.map((feature) => (
                  <span key={feature} className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">{feature}</span>
                ))}
              </div>
            )}

            <div className="mt-6 space-y-2">
              {!showForm && !sent && (
                <Button className="w-full" onClick={() => setShowForm(true)}>Tenho interesse neste carro</Button>
              )}
              {chatLink && (
                <Button asChild variant="outline" className="w-full">
                  <a href={chatLink} target="_blank" rel="noreferrer"><MessageCircle className="size-4" /> Falar pelo WhatsApp</a>
                </Button>
              )}
            </div>

            {showForm && !sent && (
              <form onSubmit={submitInterest} className="mt-5 space-y-3 rounded-md border border-border bg-card p-4">
                <Input name="name" placeholder="Seu nome" required />
                <Input name="whatsapp" placeholder="Seu WhatsApp" required />
                <Textarea name="message" placeholder="Mensagem (opcional)" />
                <Button type="submit" className="w-full" disabled={sending}>{sending ? "Enviando..." : "Enviar interesse"}</Button>
              </form>
            )}

            {sent && (
              <p className="mt-5 rounded-md border border-brand/40 bg-brand/10 p-4 text-sm text-brand">
                Recebemos seu interesse! O anunciante vai entrar em contato.
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
