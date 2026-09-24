import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Calendar, Car, Fuel, Gauge, MessageCircle, Palette, Settings2, Tag } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { publicSiteQuery, publicVehicleQuery } from "@/lib/queries";
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
  loader: async ({ params }) => {
    const [{ data: site }, { data: vehicle }] = await Promise.all([
      supabase.from("public_sites").select("*").eq("slug", params.slug).eq("is_published", true).maybeSingle(),
      supabase
        .from("vehicles")
        .select("*, vehicle_photos(*)")
        .eq("id", params.id)
        .eq("show_in_catalog", true)
        .neq("status", "inativo")
        .maybeSingle(),
    ]);
    return { site, vehicle };
  },
  head: ({ loaderData }) => {
    const site = loaderData?.site;
    const vehicle = loaderData?.vehicle;
    const title = vehicle
      ? `${vehicle.brand} ${vehicle.model}${vehicle.year ? ` ${vehicle.year}` : ""} | ${site?.display_name ?? "Catálogo"}`
      : "Veículo não encontrado";
    const description =
      vehicle?.description || `Confira o ${vehicle?.brand ?? ""} ${vehicle?.model ?? ""} disponível para aluguel.`;
    const cover =
      vehicle?.vehicle_photos?.find((p) => p.is_primary) ?? vehicle?.vehicle_photos?.[0];
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        ...(cover ? [{ property: "og:image", content: cover.url }] : []),
        { name: "twitter:card", content: "summary_large_image" },
        { name: "robots", content: "index,follow" },
      ],
      links: [
        { rel: "stylesheet", href: FONT_HREF },
        ...(site?.logo_url ? [{ rel: "icon", href: site.logo_url }] : []),
      ],
    };
  },
  component: PublicVehiclePage,
});

function PublicVehiclePage() {
  const { slug, id } = Route.useParams();
  const site = useQuery(publicSiteQuery(slug));
  const vehicle = useQuery(publicVehicleQuery(id));
  const [interestOpen, setInterestOpen] = useState(false);

  useEffect(() => {
    if (vehicle.data) {
      document.title = `${vehicleTitle(vehicle.data)} | ${site.data?.display_name ?? "Catálogo"}`;
    }
  }, [vehicle.data, site.data?.display_name]);

  if (site.isLoading || vehicle.isLoading) {
    return (
      <div className="catalog-root grid min-h-screen place-items-center bg-[#101113]">
        <div className="size-8 animate-spin rounded-full border-2 border-white/15 border-t-white/70" aria-label="Carregando" />
      </div>
    );
  }

  const publicSite = site.data;
  const car = vehicle.data;

  if (!publicSite || !car || car.user_id !== publicSite.user_id) {
    return (
      <div className="catalog-root flex min-h-screen flex-col items-center justify-center bg-[#101113] px-4 text-center text-[#f3f2ee]">
        <Car className="size-10 text-[#9b9ca4]" strokeWidth={1.25} />
        <h1 className="catalog-serif mt-5 text-3xl font-semibold">Veículo não encontrado</h1>
        <p className="mt-2 text-sm text-[#9b9ca4]">Esse carro não está mais disponível no catálogo.</p>
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
      style={
        {
          "--c-bg": "#101113",
          "--c-raise": "#17181b",
          "--c-raise2": "#1f2024",
          "--c-line": "rgba(255,255,255,0.09)",
          "--c-line-strong": "rgba(255,255,255,0.22)",
          "--c-text": "#f3f2ee",
          "--c-mute": "#9b9ca4",
          "--c-accent": accent,
          "--c-on-accent": onAccent,
        } as React.CSSProperties
      }
    >
      <header className="sticky top-0 z-30 border-b border-(--c-line) bg-[rgba(16,17,19,0.82)] backdrop-blur-xl">
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
                <p className="mt-4 max-w-prose whitespace-pre-line leading-relaxed text-[#c9c9c5]">{car.description}</p>
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
                <button
                  type="button"
                  onClick={() => setInterestOpen(true)}
                  className="w-full rounded-full py-3.5 text-base font-semibold transition-transform hover:-translate-y-0.5"
                  style={{ background: accent, color: onAccent }}
                >
                  Tenho interesse neste veículo
                </button>
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
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-(--c-line) bg-[rgba(16,17,19,0.94)] px-4 py-3 backdrop-blur-xl lg:hidden">
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
          <button
            type="button"
            onClick={() => setInterestOpen(true)}
            className="h-12 min-w-0 flex-1 rounded-full px-4 text-sm font-semibold"
            style={{ background: accent, color: onAccent }}
          >
            Tenho interesse
          </button>
        </div>
      </div>

      <InterestDialog
        open={interestOpen}
        onOpenChange={setInterestOpen}
        car={car}
        siteId={publicSite.id}
        ownerId={publicSite.user_id}
        accent={accent}
        onAccent={onAccent}
      />
    </div>
  );
}
