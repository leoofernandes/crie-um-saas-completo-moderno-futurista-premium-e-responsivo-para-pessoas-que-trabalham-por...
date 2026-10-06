import { useState } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Calendar, Car, Fuel, Gauge, MessageCircle, Palette, Settings2, Tag } from "lucide-react";
import { catalogQuery } from "@/lib/catalog-queries";
import { catalogHead } from "@/lib/catalog-head";
import { CatalogError, CatalogNotFound } from "@/components/catalog/CatalogState";
import { Button } from "@/components/ui/button";

import { InterestDialog } from "@/components/catalog/InterestDialog";
import { VehicleGallery } from "@/components/catalog/VehicleGallery";
import {
  FONT_HREF,
  PERIOD_UNIT,
  formatPrice,
  readableOn,
  safeAccent,
  sortedPhotos,
  statusInfo,
  transmissionLabel,
  vehicleTitle,
  whatsappLink,
} from "@/components/catalog/catalog-utils";

export const Route = createFileRoute("/catalogo/$slug/veiculo/$id")({
  loader: async ({ params, context, location }) => {
    const data = await context.queryClient.ensureQueryData(catalogQuery(params.slug));
    return { ...data, vehicle: data.vehicles.find(car => car.id === params.id) ?? null, origin: new URL(location.href, "https://id-preview--1dec846f-466e-46b4-bef3-01fb22e5e54d.lovable.app").origin };
  },
  head: ({ loaderData }) => catalogHead(loaderData?.site, loaderData?.origin || "", loaderData?.vehicle ?? null),
  component: PublicVehiclePage,
  errorComponent: CatalogError,
  notFoundComponent: CatalogNotFound,
});

function PublicVehiclePage() {
  const { slug, id } = Route.useParams();
  const catalog = useSuspenseQuery(catalogQuery(slug));
  const site = { data: catalog.data.site, isLoading: false };
  const vehicle = { data: catalog.data.vehicles.find(car => car.id === id), isLoading: false };
  const [interestOpen, setInterestOpen] = useState(false);

  if (site.isLoading || vehicle.isLoading) {
    return (
      <div className="catalog-root grid min-h-screen place-items-center bg-(--c-bg)">
        <div className="size-8 animate-spin rounded-full border-2 border-white/15 border-t-white/70" aria-label="Carregando" />
      </div>
    );
  }

  const publicSite = site.data;
  const car = vehicle.data;

  if (!publicSite || !car) {
    return (
      <div className="catalog-root flex min-h-screen flex-col items-center justify-center bg-(--c-bg) px-4 text-center text-(--c-text)">
        <Car className="size-10 text-(--c-mute)" strokeWidth={1.25} />
        <h1 className="catalog-serif mt-5 text-3xl font-semibold">Veículo não encontrado</h1>
        <p className="mt-2 text-sm text-(--c-mute)">Esse carro não está mais disponível no catálogo.</p>
        <Link to="/catalogo/$slug" params={{ slug }} className="mt-6 rounded-full border border-white/25 px-6 py-2.5 text-sm font-medium">
          Ver outros veículos
        </Link>
      </div>
    );
  }

  const accent = safeAccent(publicSite.accent_color);
  const onAccent = readableOn(accent);
  const photos = sortedPhotos(car);
  const status = statusInfo(car.status);
  const unit = PERIOD_UNIT[car.rental_periodicity] ?? "período";
  const title = vehicleTitle(car);
  const chat = whatsappLink(publicSite.whatsapp, `Olá! Vi o ${title} no catálogo e tenho interesse em alugar.`);

  const specs = [
    { icon: Calendar, label: "Ano", value: car.year ? String(car.year) : null },
    { icon: Fuel, label: "Combustível", value: car.fuel_type },
    { icon: Settings2, label: "Câmbio", value: transmissionLabel(car.transmission) },
    { icon: Gauge, label: "Quilometragem", value: car.mileage != null ? `${car.mileage.toLocaleString("pt-BR")} km` : null },
    { icon: Tag, label: "Categoria", value: car.category },
    { icon: Palette, label: "Cor", value: car.color },
  ].filter((spec): spec is { icon: typeof Calendar; label: string; value: string } => Boolean(spec.value));

  const features = car.features ?? [];

  return (
    <div
      className="catalog-root min-h-screen bg-(--c-bg) pb-28 text-(--c-text) lg:pb-0"
      style={{ "--c-accent": accent, "--c-on-accent": onAccent } as React.CSSProperties}
    >
      <header className="sticky top-0 z-30 border-b border-(--c-line) bg-(--c-header) backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
          <Link
            to="/catalogo/$slug"
            params={{ slug }}
            className="inline-flex min-w-0 items-center gap-2 text-sm text-(--c-mute) transition-colors hover:text-(--c-text)"
          >
            <ArrowLeft className="size-4 shrink-0" />
            <span className="catalog-serif truncate text-base font-semibold text-(--c-text)">{publicSite.display_name}</span>
          </Link>
          {chat && (
            <a
              href={chat}
              target="_blank"
              rel="noreferrer"
              className="hidden h-10 items-center gap-2 rounded-full border border-(--c-line-strong) px-4 text-sm font-semibold transition-colors hover:bg-white/5 sm:inline-flex"
            >
              <MessageCircle className="size-4" /> Falar no WhatsApp
            </a>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 md:py-10">
        <nav className="mb-5 text-sm text-(--c-mute)" aria-label="Você está em">
          <Link to="/catalogo/$slug" params={{ slug }} className="transition-colors hover:text-(--c-text)">Nossos carros</Link>
          <span className="mx-2" aria-hidden>/</span>
          <span className="text-(--c-text)">{car.brand} {car.model}</span>
        </nav>

        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] lg:gap-14">
          <div className="min-w-0">
            <VehicleGallery photos={photos} alt={title} />

            <div className="mt-8">
              <p className="text-sm text-(--c-mute)">{[car.brand, car.category].filter(Boolean).join(" · ")}</p>
              <h1 className="catalog-serif mt-1 text-4xl font-semibold leading-[1.08] sm:text-5xl">
                {car.model} {car.year ?? ""}
              </h1>
            </div>

            {specs.length > 0 && (
              <dl className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-(--c-line) bg-(--c-line) sm:grid-cols-3">
                {specs.map(({ icon: Icon, label, value }) => (
                  <div key={label} className="bg-(--c-raise) p-4 sm:p-5">
                    <dt className="flex items-center gap-2 text-xs text-(--c-mute)">
                      <Icon className="size-4" /> {label}
                    </dt>
                    <dd className="mt-1.5 text-base font-medium">{value}</dd>
                  </div>
                ))}
              </dl>
            )}

            {features.length > 0 && (
              <section className="mt-10">
                <h2 className="catalog-serif text-2xl font-semibold">Equipamentos</h2>
                <ul className="mt-4 grid gap-x-8 gap-y-2.5 text-(--c-mute) sm:grid-cols-2 md:grid-cols-3">
                  {features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5 text-sm">
                      <span className="mt-2 size-1.5 shrink-0 rounded-full" style={{ background: accent }} aria-hidden />
                      {feature}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {car.description && (
              <section className="mt-10">
                <h2 className="catalog-serif text-2xl font-semibold">Descrição</h2>
                <p className="mt-4 max-w-prose whitespace-pre-line leading-relaxed text-(--c-mute)">{car.description}</p>
              </section>
            )}
          </div>

          {/* PREÇO E CONTATO */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-3xl border border-(--c-line) bg-(--c-raise) p-6 sm:p-7">
              <span className="inline-flex items-center gap-2 rounded-full border border-(--c-line-strong) px-3 py-1 text-xs font-semibold">
                <span className="size-1.5 rounded-full" style={{ background: status.available ? accent : "#8b8d94" }} aria-hidden />
                {status.label.toUpperCase()}
              </span>

              <p className="mt-5 text-4xl font-semibold tracking-tight sm:text-5xl">{formatPrice(car.rental_price_cents)}</p>
              <p className="mt-1 text-(--c-mute)">por {unit}</p>

              {!status.available && (
                <p className="mt-4 text-sm text-(--c-mute)">
                  No momento este veículo está indisponível. Você ainda pode enviar seu interesse.
                </p>
              )}

              <div className="mt-6 hidden space-y-3 lg:block">
                <Button
                  type="button"
                  onClick={() => setInterestOpen(true)}
                  className="catalog-cta h-auto w-full rounded-md py-3.5 text-base font-semibold transition-transform hover:-translate-y-0.5"
                  
                >
                  Tenho interesse neste veículo
                </Button>
                {chat && (
                  <a
                    href={chat}
                    target="_blank"
                    rel="noreferrer"
                    className="flex w-full items-center justify-center gap-2 rounded-full border border-(--c-line-strong) py-3.5 text-base font-semibold transition-colors hover:bg-white/5"
                  >
                    <MessageCircle className="size-5" /> Falar no WhatsApp
                  </a>
                )}
              </div>
            </div>
          </aside>
        </div>
      </main>

      {/* BARRA FIXA (celular e tablet) */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-(--c-line) bg-(--c-header) px-4 py-3 backdrop-blur-xl lg:hidden">
        <div className="mx-auto flex max-w-2xl items-center gap-3">
          <div className="min-w-0 shrink-0">
            <p className="text-lg font-semibold leading-none">{formatPrice(car.rental_price_cents)}</p>
            <p className="mt-1 text-xs text-(--c-mute)">por {unit}</p>
          </div>
          {chat && (
            <a
              href={chat}
              target="_blank"
              rel="noreferrer"
              aria-label="Falar no WhatsApp"
              className="grid size-12 shrink-0 place-items-center rounded-full border border-(--c-line-strong)"
            >
              <MessageCircle className="size-5" />
            </a>
          )}
          <Button
            type="button"
            onClick={() => setInterestOpen(true)}
            className="catalog-cta h-12 min-w-0 flex-1 rounded-md px-4 text-sm font-semibold"
            
          >
            Tenho interesse
          </Button>
        </div>
      </div>

      <InterestDialog
        open={interestOpen}
        onOpenChange={setInterestOpen}
        car={car}
        siteId={publicSite.id}
        
        accent={accent}
        onAccent={onAccent}
      />
    </div>
  );
}
