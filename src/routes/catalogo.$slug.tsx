import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Outlet, createFileRoute, useChildMatches } from "@tanstack/react-router";
import { ArrowDown, Car, Instagram, MapPin, Menu, MessageCircle, X } from "lucide-react";
import { publicSiteQuery, publicVehiclesQuery, type PublicSite } from "@/lib/queries";
import { VehicleCard } from "@/components/catalog/VehicleCard";
import {
  FONT_HREF,
  PERIOD_UNIT,
  formatPrice,
  instagramHandle,
  readableOn,
  safeAccent,
  whatsappLink,
  type CatalogVehicle,
} from "@/components/catalog/catalog-utils";

export const Route = createFileRoute("/catalogo/$slug")({
  loader: async ({ params }) => {
    const { supabase } = await import("@/integrations/supabase/client");
    const { data: site } = await supabase
      .from("public_sites")
      .select("*")
      .eq("slug", params.slug)
      .eq("is_published", true)
      .maybeSingle();
    return { site };
  },
  head: ({ loaderData }) => {
    const site = loaderData?.site as PublicSite | null | undefined;
    const title = site ? `${site.display_name} | Aluguel de carros` : "Catálogo não encontrado";
    const description =
      site?.hero_subtitle || site?.description || "Confira os veículos disponíveis para aluguel.";
    const image = site?.banner_url || site?.logo_url;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        ...(image ? [{ property: "og:image", content: image }] : []),
        { name: "twitter:card", content: "summary_large_image" },
        { name: "robots", content: "index,follow" },
      ],
      links: [
        { rel: "stylesheet", href: FONT_HREF },
        ...(site?.logo_url ? [{ rel: "icon", href: site.logo_url }] : []),
      ],
    };
  },
  component: CatalogLayout,
});

/**
 * A página do veículo é uma rota filha (catalogo.$slug.veiculo.$id).
 * Sem o <Outlet />, o link "Ver detalhes" mudava a URL mas continuava mostrando a lista.
 */
function CatalogLayout() {
  const children = useChildMatches();
  if (children.length > 0) return <Outlet />;
  return <PublicCatalogPage />;
}

type Filters = { available: boolean; transmission: string | null; category: string | null };
const NO_FILTERS: Filters = { available: false, transmission: null, category: null };

function PublicCatalogPage() {
  const { slug } = Route.useParams();
  const site = useQuery(publicSiteQuery(slug));
  const vehicles = useQuery(publicVehiclesQuery(site.data?.user_id ?? ""));
  const [menuOpen, setMenuOpen] = useState(false);
  const [filters, setFilters] = useState<Filters>(NO_FILTERS);

  const s = site.data;

  useEffect(() => {
    if (s?.display_name) document.title = `${s.display_name} | Aluguel de carros`;
  }, [s?.display_name]);

  const rows = useMemo<CatalogVehicle[]>(
    () => [...(vehicles.data ?? [])].sort((a, b) => a.catalog_order - b.catalog_order),
    [vehicles.data],
  );

  const categories = useMemo(
    () => Array.from(new Set(rows.map((r) => r.category).filter((c): c is string => Boolean(c)))),
    [rows],
  );

  const hasAutomatic = rows.some((r) => r.transmission === "automatico");
  const hasManual = rows.some((r) => r.transmission === "manual");

  const filtered = rows.filter((car) => {
    if (filters.available && car.status !== "disponivel") return false;
    if (filters.transmission && car.transmission !== filters.transmission) return false;
    if (filters.category && car.category !== filters.category) return false;
    return true;
  });

  const stats = useMemo(() => {
    const available = rows.filter((r) => r.status === "disponivel");
    if (available.length === 0) return { total: rows.length, available: 0, from: null as null | { price: number; unit: string } };
    // preço "a partir de" só entre carros com a mesma periodicidade mais comum, para não comparar semana com mês
    const counts = new Map<string, number>();
    available.forEach((c) => counts.set(c.rental_periodicity, (counts.get(c.rental_periodicity) ?? 0) + 1));
    const [topPeriod] = [...counts.entries()].sort((a, b) => b[1] - a[1])[0] ?? [];
    const samePeriod = available.filter((c) => c.rental_periodicity === topPeriod);
    const cheapest = samePeriod.reduce((min, c) => (c.rental_price_cents < min ? c.rental_price_cents : min), Infinity);
    return {
      total: rows.length,
      available: available.length,
      from: Number.isFinite(cheapest) ? { price: cheapest, unit: PERIOD_UNIT[topPeriod ?? ""] ?? "período" } : null,
    };
  }, [rows]);

  if (site.isLoading) {
    return (
      <div className="catalog-root grid min-h-screen place-items-center bg-[#101113] text-[#9b9ca4]">
        <div className="size-8 animate-spin rounded-full border-2 border-white/15 border-t-white/70" aria-label="Carregando" />
      </div>
    );
  }

  if (!s) {
    return (
      <div className="catalog-root flex min-h-screen flex-col items-center justify-center bg-[#101113] px-4 text-center text-[#f3f2ee]">
        <Car className="size-10 text-[#9b9ca4]" strokeWidth={1.25} />
        <h1 className="catalog-serif mt-5 text-3xl font-semibold">Catálogo não encontrado</h1>
        <p className="mt-2 max-w-sm text-sm text-[#9b9ca4]">
          Esse link não existe ou o catálogo ainda não foi publicado. Confira o endereço com quem te enviou.
        </p>
      </div>
    );
  }

  const accent = safeAccent(s.accent_color);
  const onAccent = readableOn(accent);
  const chat = whatsappLink(s.whatsapp, `Olá! Vi o catálogo da ${s.display_name} e quero saber mais.`);
  const handle = instagramHandle(s.instagram);
  const hasAbout = Boolean(s.about_title || s.about_description);
  const hasContact = Boolean(s.whatsapp || handle || s.city);

  const navLinks = [
    { href: "#inicio", label: "Início" },
    { href: "#veiculos", label: "Veículos" },
    ...(hasAbout ? [{ href: "#sobre", label: "Sobre" }] : []),
    ...(hasContact ? [{ href: "#contato", label: "Contato" }] : []),
  ];

  const filtersActive = filters.available || filters.transmission !== null || filters.category !== null;

  return (
    <div
      className="catalog-root min-h-screen bg-(--c-bg) text-(--c-text)"
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
      {/* HEADER */}
      <header className="sticky top-0 z-30 border-b border-(--c-line) bg-[rgba(16,17,19,0.82)] backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
          <a href="#inicio" className="flex min-w-0 items-center gap-3 outline-none focus-visible:ring-2 focus-visible:ring-(--c-accent)">
            {s.logo_url ? (
              <img src={s.logo_url} alt="" className="size-9 shrink-0 rounded-full object-cover" />
            ) : (
              <span
                className="catalog-serif grid size-9 shrink-0 place-items-center rounded-full text-lg font-semibold"
                style={{ background: accent, color: onAccent }}
                aria-hidden
              >
                {s.display_name.charAt(0).toUpperCase()}
              </span>
            )}
            <span className="catalog-serif truncate text-lg font-semibold">{s.display_name}</span>
          </a>

          <nav className="hidden items-center gap-8 md:flex" aria-label="Principal">
            {navLinks.map((link) => (
              <a key={link.href} href={link.href} className="text-sm text-(--c-mute) transition-colors hover:text-(--c-text)">
                {link.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {chat && (
              <a
                href={chat}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-10 items-center gap-2 rounded-full px-4 text-sm font-semibold"
                style={{ background: accent, color: onAccent }}
              >
                <MessageCircle className="size-4" />
                <span className="hidden sm:inline">Falar no WhatsApp</span>
                <span className="sm:hidden">WhatsApp</span>
              </a>
            )}
            <button
              type="button"
              className="grid size-10 place-items-center rounded-full border border-(--c-line) md:hidden"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
              aria-expanded={menuOpen}
            >
              {menuOpen ? <X className="size-4" /> : <Menu className="size-4" />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <nav className="border-t border-(--c-line) px-4 py-2 md:hidden" aria-label="Principal">
            {navLinks.map((link) => (
              <a key={link.href} href={link.href} onClick={() => setMenuOpen(false)} className="block py-3 text-base text-(--c-text)">
                {link.label}
              </a>
            ))}
          </nav>
        )}
      </header>

      {/* HERO */}
      <section id="inicio" className="relative isolate overflow-hidden">
        <div
          className="absolute inset-0 -z-10 bg-(--c-raise) bg-cover"
          style={
            s.banner_url
              ? { backgroundImage: `url(${s.banner_url})`, backgroundPosition: `center ${s.banner_position}%` }
              : { backgroundImage: `radial-gradient(60% 80% at 80% 20%, ${accent}33, transparent 70%)` }
          }
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#101113] via-[#101113]/75 to-[#101113]/10" />
        <div className="absolute inset-x-0 bottom-0 -z-10 h-40 bg-gradient-to-t from-[#101113] to-transparent" />

        <div className="mx-auto flex min-h-[76svh] max-w-6xl flex-col justify-end px-4 pb-8 pt-20 sm:px-6 md:min-h-[82vh] md:pb-12">
          <div className="max-w-2xl">
            <h1 className="catalog-serif catalog-rise text-[2.6rem] font-semibold leading-[1.04] sm:text-6xl md:text-7xl">
              {s.hero_title || "Encontre seu próximo carro"}
            </h1>
            <p className="catalog-rise mt-5 max-w-lg text-base text-[#d7d7d3] [animation-delay:120ms] sm:text-lg">
              {s.hero_subtitle ||
                s.description ||
                "Veículos disponíveis para aluguel com facilidade, transparência e atendimento rápido."}
            </p>
            <div className="catalog-rise mt-8 flex flex-wrap gap-3 [animation-delay:220ms]">
              <a
                href="#veiculos"
                className="inline-flex h-12 items-center gap-2 rounded-full px-7 text-sm font-semibold"
                style={{ background: accent, color: onAccent }}
              >
                Ver veículos
                <ArrowDown className="size-4" />
              </a>
              {chat && (
                <a
                  href={chat}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-12 items-center gap-2 rounded-full border border-white/30 bg-black/30 px-7 text-sm font-semibold text-white backdrop-blur-md transition-colors hover:bg-black/50"
                >
                  <MessageCircle className="size-4" />
                  Falar no WhatsApp
                </a>
              )}
            </div>
          </div>

          {stats.total > 0 && (
            <dl className="catalog-rise mt-12 grid max-w-2xl grid-cols-3 divide-x divide-white/15 rounded-2xl border border-white/15 bg-black/45 py-4 backdrop-blur-md [animation-delay:340ms]">
              <Stat label="Na frota" value={String(stats.total)} />
              <Stat label="Disponíveis" value={String(stats.available)} />
              <Stat
                label={stats.from ? `A partir de / ${stats.from.unit}` : "A partir de"}
                value={stats.from ? formatPrice(stats.from.price) : "Consulte"}
              />
            </dl>
          )}
        </div>
      </section>

      {/* VEÍCULOS */}
      <main id="veiculos" className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-24">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="catalog-serif text-3xl font-semibold sm:text-4xl">Veículos disponíveis</h2>
            <p className="mt-2 text-(--c-mute)">Escolha o veículo ideal para você.</p>
          </div>
          {rows.length > 0 && (
            <p className="text-sm text-(--c-mute)" aria-live="polite">
              {filtered.length} {filtered.length === 1 ? "veículo" : "veículos"}
            </p>
          )}
        </div>

        {rows.length > 0 && (
          <div className="catalog-scroll -mx-4 mt-8 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0" role="group" aria-label="Filtros">
            <Chip active={!filtersActive} onClick={() => setFilters(NO_FILTERS)}>Todos</Chip>
            <Chip active={filters.available} onClick={() => setFilters((f) => ({ ...f, available: !f.available }))}>Disponíveis</Chip>
            {hasAutomatic && (
              <Chip active={filters.transmission === "automatico"} onClick={() => setFilters((f) => ({ ...f, transmission: f.transmission === "automatico" ? null : "automatico" }))}>Automáticos</Chip>
            )}
            {hasManual && (
              <Chip active={filters.transmission === "manual"} onClick={() => setFilters((f) => ({ ...f, transmission: f.transmission === "manual" ? null : "manual" }))}>Manuais</Chip>
            )}
            {categories.map((cat) => (
              <Chip key={cat} active={filters.category === cat} onClick={() => setFilters((f) => ({ ...f, category: f.category === cat ? null : cat }))}>{cat}</Chip>
            ))}
          </div>
        )}

        {vehicles.isLoading ? (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-[26rem] animate-pulse rounded-2xl border border-(--c-line) bg-(--c-raise)" />
            ))}
          </div>
        ) : vehicles.isError ? (
          <div className="mt-10 rounded-2xl border border-(--c-line) bg-(--c-raise) p-10 text-center">
            <p className="font-medium">Não foi possível carregar os veículos.</p>
            <p className="mt-1 text-sm text-(--c-mute)">Atualize a página em alguns instantes.</p>
          </div>
        ) : rows.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-dashed border-(--c-line-strong) p-12 text-center">
            <Car className="mx-auto size-10 text-(--c-mute)" strokeWidth={1.25} />
            <p className="catalog-serif mt-5 text-2xl font-semibold">Estamos atualizando nossa frota.</p>
            <p className="mx-auto mt-2 max-w-sm text-sm text-(--c-mute)">
              Entre em contato pelo WhatsApp para consultar disponibilidade.
            </p>
            {chat && (
              <a href={chat} target="_blank" rel="noreferrer" className="mt-6 inline-flex h-12 items-center gap-2 rounded-full px-7 text-sm font-semibold" style={{ background: accent, color: onAccent }}>
                <MessageCircle className="size-4" /> Falar no WhatsApp
              </a>
            )}
          </div>
        ) : filtered.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-(--c-line) bg-(--c-raise) p-10 text-center">
            <p className="font-medium">Nenhum veículo com esses filtros.</p>
            <button type="button" onClick={() => setFilters(NO_FILTERS)} className="mt-3 text-sm underline underline-offset-4" style={{ color: accent }}>
              Limpar filtros
            </button>
          </div>
        ) : (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((car, index) => (
              <VehicleCard key={car.id} car={car} slug={slug} accent={accent} priority={index < 3} />
            ))}
          </div>
        )}
      </main>

      {/* SOBRE */}
      {hasAbout && (
        <section id="sobre" className="border-t border-(--c-line) bg-(--c-raise)">
          <div className="mx-auto grid max-w-6xl gap-8 px-4 py-16 sm:px-6 md:grid-cols-[1fr_1.2fr] md:gap-16 md:py-24">
            <h2 className="catalog-serif text-3xl font-semibold leading-tight sm:text-4xl">
              {s.about_title || `Sobre a ${s.display_name}`}
            </h2>
            {s.about_description && (
              <p className="max-w-prose whitespace-pre-line text-lg leading-relaxed text-[#c9c9c5]">{s.about_description}</p>
            )}
          </div>
        </section>
      )}

      {/* CONTATO */}
      {hasContact && (
        <section id="contato" className="border-t border-(--c-line)">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-24">
            <div className="grid gap-8 rounded-3xl border border-(--c-line) bg-(--c-raise) p-8 md:grid-cols-[1fr_auto] md:items-center md:p-12">
              <div>
                <h2 className="catalog-serif text-3xl font-semibold sm:text-4xl">Contato</h2>
                <ul className="mt-5 space-y-3 text-(--c-mute)">
                  {s.city && (
                    <li className="flex items-center gap-3"><MapPin className="size-4 shrink-0" /> {s.city}</li>
                  )}
                  {handle && (
                    <li>
                      <a href={`https://instagram.com/${handle}`} target="_blank" rel="noreferrer" className="flex items-center gap-3 transition-colors hover:text-(--c-text)">
                        <Instagram className="size-4 shrink-0" /> @{handle}
                      </a>
                    </li>
                  )}
                </ul>
              </div>
              {chat && (
                <a href={chat} target="_blank" rel="noreferrer" className="inline-flex h-14 items-center justify-center gap-2 rounded-full px-8 text-base font-semibold" style={{ background: accent, color: onAccent }}>
                  <MessageCircle className="size-5" /> Falar pelo WhatsApp
                </a>
              )}
            </div>
          </div>
        </section>
      )}

      {/* FOOTER */}
      <footer className="border-t border-(--c-line) pb-24 pt-10 md:pb-10">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 sm:px-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="catalog-serif text-lg font-semibold">{s.display_name}</p>
            <p className="mt-1 text-sm text-(--c-mute)">© {new Date().getFullYear()} {s.display_name}. Todos os direitos reservados.</p>
          </div>
          <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-(--c-mute)" aria-label="Rodapé">
            {navLinks.map((link) => (
              <a key={link.href} href={link.href} className="transition-colors hover:text-(--c-text)">{link.label}</a>
            ))}
            {chat && <a href={chat} target="_blank" rel="noreferrer" className="transition-colors hover:text-(--c-text)">WhatsApp</a>}
            {handle && <a href={`https://instagram.com/${handle}`} target="_blank" rel="noreferrer" className="transition-colors hover:text-(--c-text)">Instagram</a>}
          </nav>
        </div>
        <p className="mx-auto mt-6 max-w-6xl px-4 text-xs text-(--c-mute)/70 sm:px-6">Catálogo criado com movvia</p>
      </footer>

      {/* WHATSAPP FLUTUANTE (celular) */}
      {chat && (
        <a
          href={chat}
          target="_blank"
          rel="noreferrer"
          className="fixed bottom-4 right-4 z-40 grid size-14 place-items-center rounded-full shadow-xl shadow-black/40 md:hidden"
          style={{ background: accent, color: onAccent }}
          aria-label="Falar no WhatsApp"
        >
          <MessageCircle className="size-6" />
        </a>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-4 first:pl-5 sm:px-6">
      <dt className="text-xs text-white/70">{label}</dt>
      <dd className="mt-1 text-lg font-semibold text-white sm:text-2xl">{value}</dd>
    </div>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`h-10 shrink-0 rounded-full border px-5 text-sm font-medium transition-colors ${
        active
          ? "border-transparent bg-(--c-accent) text-(--c-on-accent)"
          : "border-(--c-line-strong) text-(--c-text) hover:bg-white/5"
      }`}
    >
      {children}
    </button>
  );
}
