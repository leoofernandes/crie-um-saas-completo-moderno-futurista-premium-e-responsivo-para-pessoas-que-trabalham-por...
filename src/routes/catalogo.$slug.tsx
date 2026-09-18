import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Car, MessageCircle } from "lucide-react";
import { publicSiteQuery, publicVehiclesQuery, PERIODICITY_LABEL, VEHICLE_STATUS_LABEL } from "@/lib/queries";
import { formatCurrency } from "@/lib/format";

export const Route = createFileRoute("/catalogo/$slug")({
  head: () => ({
    meta: [
      { name: "robots", content: "index,follow" },
    ],
  }),
  component: PublicCatalogPage,
});

function whatsappLink(number: string | null | undefined, text: string) {
  if (!number) return null;
  const digits = number.replace(/\D/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}

function PublicCatalogPage() {
  const { slug } = Route.useParams();
  const site = useQuery(publicSiteQuery(slug));
  const vehicles = useQuery(publicVehiclesQuery(site.data?.user_id ?? ""));

  useEffect(() => {
    if (site.data?.display_name) document.title = `${site.data.display_name} — Catálogo`;
  }, [site.data?.display_name]);

  if (site.isLoading) {
    return <div className="mx-auto max-w-6xl px-4 py-16 text-center text-muted-foreground">Carregando...</div>;
  }

  if (!site.data) {
    return (
      <div className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center px-4 text-center">
        <Car className="size-10 text-muted-foreground" />
        <h1 className="mt-4 font-display text-2xl font-bold">Catálogo não encontrado</h1>
        <p className="mt-2 text-sm text-muted-foreground">Esse link não existe ou ainda não foi publicado.</p>
      </div>
    );
  }

  const rows = vehicles.data ?? [];
  const chatText = whatsappLink(site.data.whatsapp, `Olá! Vi seu catálogo ${site.data.display_name} e quero saber mais.`);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            {site.data.logo_url ? (
              <img src={site.data.logo_url} alt={site.data.display_name} className="size-9 rounded-full object-cover" />
            ) : (
              <div className="grid size-9 place-items-center rounded-full bg-brand/15 font-display font-bold text-brand">
                {site.data.display_name.charAt(0).toUpperCase()}
              </div>
            )}
            <span className="font-display font-semibold">{site.data.display_name}</span>
          </div>
          {chatText && (
            <a href={chatText} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm text-muted-foreground hover:text-foreground">
              <MessageCircle className="size-4" /> WhatsApp
            </a>
          )}
        </div>
      </header>

      <section
        className="relative flex min-h-64 items-end bg-surface bg-cover bg-center sm:min-h-80"
        style={site.data.banner_url ? { backgroundImage: `url(${site.data.banner_url})`, backgroundPosition: `center ${site.data.banner_position}%` } : undefined}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        <div className="relative mx-auto w-full max-w-6xl px-4 pb-8 sm:px-6">
          <h1 className="font-display text-3xl font-bold sm:text-4xl">
            {site.data.hero_title || `Carros de ${site.data.display_name}`}
          </h1>
          <p className="mt-2 max-w-xl text-muted-foreground">
            {site.data.hero_subtitle || site.data.description || "Confira os veículos disponíveis para aluguel."}
          </p>
        </div>
      </section>

      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6" id="veiculos">
        <h2 className="font-display text-xl font-semibold">Veículos disponíveis</h2>

        {vehicles.isLoading ? (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => <div key={i} className="h-64 animate-pulse rounded-md border border-border bg-surface/50" />)}
          </div>
        ) : rows.length === 0 ? (
          <p className="mt-6 text-sm text-muted-foreground">Nenhum veículo disponível no momento.</p>
        ) : (
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {rows.map((car) => {
              const cover = [...car.vehicle_photos].sort((a, b) => a.position - b.position).find((p) => p.is_primary) ?? car.vehicle_photos[0];
              return (
                <Link key={car.id} to="/catalogo/$slug/veiculo/$id" params={{ slug, id: car.id }} className="group overflow-hidden rounded-md border border-border bg-card transition-colors hover:border-brand/50">
                  <div className="aspect-video w-full overflow-hidden bg-surface">
                    {cover ? (
                      <img src={cover.url} alt={`${car.brand} ${car.model}`} className="size-full object-cover transition-transform group-hover:scale-105" />
                    ) : (
                      <div className="grid size-full place-items-center text-muted-foreground"><Car className="size-8" /></div>
                    )}
                  </div>
                  <div className="p-4">
                    <p className="font-display font-semibold">{car.brand} {car.model}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{[car.year, car.category].filter(Boolean).join(" • ")}</p>
                    <div className="mt-3 flex items-center justify-between">
                      <p className="font-display font-semibold text-brand">
                        {formatCurrency(car.rental_price_cents)}
                        <span className="text-xs font-normal text-muted-foreground"> / {PERIODICITY_LABEL[car.rental_periodicity].toLowerCase()}</span>
                      </p>
                      <span className="text-xs text-muted-foreground">{VEHICLE_STATUS_LABEL[car.status]}</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>

      <footer className="border-t border-border py-8 text-center text-xs text-muted-foreground">
        {site.data.instagram && <span className="mr-3">@{site.data.instagram.replace(/^@/, "")}</span>}
        Catálogo criado com movvia
      </footer>
    </div>
  );
}
