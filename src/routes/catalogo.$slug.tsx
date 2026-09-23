import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Car, Instagram, Menu, MessageCircle, X } from "lucide-react";
import { publicSiteQuery, publicVehiclesQuery, PERIODICITY_LABEL, VEHICLE_STATUS_LABEL } from "@/lib/queries";
import { formatCurrency } from "@/lib/format";

export const Route = createFileRoute("/catalogo/$slug")({
  loader: async ({ params }) => {
    const { supabase } = await import("@/integrations/supabase/client");
    const { data: site } = await supabase.from("public_sites").select("*").eq("slug", params.slug).eq("is_published", true).maybeSingle();
    return { site };
  },
  head: ({ loaderData }) => {
    const site = loaderData?.site as Record<string, unknown> | null | undefined;
    const title = site ? `${site.display_name} — Catálogo` : "Catálogo não encontrado";
    const description = (site?.hero_subtitle as string) || (site?.description as string) || "Confira os veículos disponíveis para aluguel.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        ...(site?.banner_url ? [{ property: "og:image", content: site.banner_url as string }] : []),
        { name: "robots", content: "index,follow" },
      ],
    };
  },
  component: PublicCatalogPage,
});

function whatsappLink(number: string | null | undefined, text: string) {
  if (!number) return null;
  const digits = number.replace(/\D/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}

const TRANSMISSION_LABEL: Record<string, string> = { automatico: "Automático", manual: "Manual" };

function PublicCatalogPage() {
  const { slug } = Route.useParams();
  const site = useQuery(publicSiteQuery(slug));
  const vehicles = useQuery(publicVehiclesQuery(site.data?.user_id ?? ""));
  const [menuOpen, setMenuOpen] = useState(false);
  const [filterAvailable, setFilterAvailable] = useState(false);
  const [filterTransmission, setFilterTransmission] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string | null>(null);

  const s = site.data as (typeof site.data & { about_title?: string; about_description?: string; city?: string; accent_color?: string }) | null;

  useEffect(() => {
    if (s?.display_name) document.title = `${s.display_name} — Catálogo`;
  }, [s?.display_name]);

  const rows = useMemo(() => [...(vehicles.data ?? [])].sort((a, b) => a.catalog_order - b.catalog_order), [vehicles.data]);

  const categories = useMemo(() => Array.from(new Set(rows.map((r) => r.category).filter(Boolean))) as string[], [rows]);

  const filtered = rows.filter((car) => {
    if (filterAvailable && car.status !== "disponivel") return false;
    if (filterTransmission && car.transmission !== filterTransmission) return false;
    if (filterCategory && car.category !== filterCategory) return false;
    return true;
  });

  if (site.isLoading) {
    return <div className="mx-auto max-w-6xl px-4 py-16 text-center text-muted-foreground">Carregando...</div>;
  }

  if (!s) {
    return (
      <div className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center px-4 text-center">
        <Car className="size-10 text-muted-foreground" />
        <h1 className="mt-4 font-display text-2xl font-bold">Catálogo não encontrado</h1>
        <p className="mt-2 text-sm text-muted-foreground">Esse link não existe ou ainda não foi publicado.</p>
      </div>
    );
  }

  const accent = s.accent_color || "#22c55e";
  const chatText = whatsappLink(s.whatsapp, `Olá! Vi seu catálogo ${s.display_name} e quero saber mais.`);
  const hasAbout = Boolean(s.about_title || s.about_description);
  const hasContact = Boolean(s.whatsapp || s.instagram || s.city);

  const navLinks = [
    { href: "#inicio", label: "Início" },
    { href: "#veiculos", label: "Veículos" },
    ...(hasAbout ? [{ href: "#sobre", label: "Sobre" }] : []),
    ...(hasContact ? [{ href: "#contato", label: "Contato" }] : []),
  ];

  return (
    <div className="min-h-screen bg-background" style={{ ["--catalog-accent" as string]: accent }}>
      {/* HEADER */}
      <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <a href="#inicio" className="flex items-center gap-3">
            {s.logo_url ? (
              <img src={s.logo_url} alt={s.display_name} className="size-9 rounded-full object-cover" />
            ) : (
              <div className="grid size-9 place-items-center rounded-full font-display font-bold" style={{ background: `${accent}26`, color: accent }}>
                {s.display_name.charAt(0).toUpperCase()}
              </div>
            )}
            <span className="font-display font-semibold">{s.display_name}</span>
          </a>

          <nav className="hidden items-center gap-6 md:flex">
            {navLinks.map((link) => (
              <a key={link.href} href={link.href} className="text-sm text-muted-foreground transition-colors hover:text-foreground">{link.label}</a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {chatText && (
              <a href={chatText} target="_blank" rel="noreferrer" className="hidden items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-white sm:inline-flex" style={{ background: accent }}>
                <MessageCircle className="size-4" /> WhatsApp
              </a>
            )}
            <button type="button" className="grid size-9 place-items-center rounded-md border border-border md:hidden" onClick={() => setMenuOpen((v) => !v)} aria-label="Abrir menu">
              {menuOpen ? <X className="size-4" /> : <Menu className="size-4" />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <nav className="border-t border-border px-4 py-3 md:hidden">
            {navLinks.map((link) => (
              <a key={link.href} href={link.href} onClick={() => setMenuOpen(false)} className="block py-2 text-sm text-muted-foreground">{link.label}</a>
            ))}
            {chatText && <a href={chatText} target="_blank" rel="noreferrer" className="mt-2 flex items-center justify-center gap-2 rounded-md py-2 text-sm font-medium text-white" style={{ background: accent }}><MessageCircle className="size-4" /> Falar no WhatsApp</a>}
          </nav>
        )}
      </header>

      {/* HERO */}
      <section
        id="inicio"
        className="relative flex min-h-72 items-end bg-surface bg-cover bg-center sm:min-h-96"
        style={s.banner_url ? { backgroundImage: `url(${s.banner_url})`, backgroundPosition: `center ${s.banner_position}%` } : undefined}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/10" />
        <div className="relative mx-auto w-full max-w-6xl px-4 pb-10 sm:px-6">
          <h1 className="font-display text-3xl font-bold sm:text-5xl">{s.hero_title || `Encontre seu próximo carro`}</h1>
          <p className="mt-3 max-w-xl text-muted-foreground">{s.hero_subtitle || s.description || "Veículos disponíveis para aluguel com facilidade, transparência e atendimento rápido."}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a href="#veiculos" className="rounded-md px-5 py-2.5 text-sm font-medium text-white" style={{ background: accent }}>Ver veículos</a>
            {chatText && <a href={chatText} target="_blank" rel="noreferrer" className="rounded-md border border-border bg-background/60 px-5 py-2.5 text-sm font-medium backdrop-blur">Falar no WhatsApp</a>}
          </div>
        </div>
      </section>

      {/* VEÍCULOS */}
      <main id="veiculos" className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <h2 className="font-display text-2xl font-bold sm:text-3xl">Veículos disponíveis</h2>
        <p className="mt-1 text-muted-foreground">Escolha o veículo ideal para você.</p>

        {rows.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-2">
            <FilterChip active={!filterAvailable && !filterTransmission && !filterCategory} onClick={() => { setFilterAvailable(false); setFilterTransmission(null); setFilterCategory(null); }} accent={accent}>Todos</FilterChip>
            <FilterChip active={filterAvailable} onClick={() => setFilterAvailable((v) => !v)} accent={accent}>Disponíveis</FilterChip>
            <FilterChip active={filterTransmission === "automatico"} onClick={() => setFilterTransmission((v) => (v === "automatico" ? null : "automatico"))} accent={accent}>Automáticos</FilterChip>
            <FilterChip active={filterTransmission === "manual"} onClick={() => setFilterTransmission((v) => (v === "manual" ? null : "manual"))} accent={accent}>Manuais</FilterChip>
            {categories.map((cat) => (
              <FilterChip key={cat} active={filterCategory === cat} onClick={() => setFilterCategory((v) => (v === cat ? null : cat))} accent={accent}>{cat}</FilterChip>
            ))}
          </div>
        )}

        {vehicles.isLoading ? (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => <div key={i} className="h-64 animate-pulse rounded-md border border-border bg-surface/50" />)}
          </div>
        ) : rows.length === 0 ? (
          <div className="mt-10 rounded-md border border-dashed border-border p-10 text-center">
            <Car className="mx-auto size-8 text-muted-foreground" />
            <p className="mt-4 font-medium">Estamos atualizando nossa frota.</p>
            <p className="mt-1 text-sm text-muted-foreground">Entre em contato pelo WhatsApp para consultar disponibilidade.</p>
            {chatText && <a href={chatText} target="_blank" rel="noreferrer" className="mt-5 inline-flex rounded-md px-5 py-2.5 text-sm font-medium text-white" style={{ background: accent }}>Falar no WhatsApp</a>}
          </div>
        ) : filtered.length === 0 ? (
          <p className="mt-10 text-center text-sm text-muted-foreground">Nenhum veículo encontrado com esse filtro.</p>
        ) : (
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((car) => {
              const cover = [...car.vehicle_photos].sort((a, b) => a.position - b.position).find((p) => p.is_primary) ?? car.vehicle_photos[0];
              return (
                <Link key={car.id} to="/catalogo/$slug/veiculo/$id" params={{ slug, id: car.id }} className="group overflow-hidden rounded-md border border-border bg-card transition-colors hover:border-brand/50">
                  <div className="relative aspect-video w-full overflow-hidden bg-surface">
                    {cover ? (
                      <img src={cover.url} alt={`${car.brand} ${car.model}`} className="size-full object-cover transition-transform group-hover:scale-105" loading="lazy" />
                    ) : (
                      <div className="grid size-full place-items-center text-muted-foreground"><Car className="size-8" /></div>
                    )}
                    <span className="absolute left-2 top-2 rounded-full bg-background/85 px-2.5 py-1 text-[11px] font-medium backdrop-blur">{VEHICLE_STATUS_LABEL[car.status]}</span>
                  </div>
                  <div className="p-4">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">{car.brand}</p>
                    <p className="font-display font-semibold">{car.model} {car.year ? `· ${car.year}` : ""}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {[car.transmission && TRANSMISSION_LABEL[car.transmission], car.fuel_type].filter(Boolean).join(" • ") || car.category}
                    </p>
                    <div className="mt-3 flex items-center justify-between">
                      <p className="font-display font-semibold" style={{ color: accent }}>
                        {formatCurrency(car.rental_price_cents)}
                        <span className="text-xs font-normal text-muted-foreground"> / {PERIODICITY_LABEL[car.rental_periodicity].toLowerCase()}</span>
                      </p>
                      <span className="text-xs font-medium underline-offset-2 group-hover:underline">Ver detalhes</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>

      {/* SOBRE */}
      {hasAbout && (
        <section id="sobre" className="border-t border-border bg-surface/30">
          <div className="mx-auto max-w-3xl px-4 py-14 text-center sm:px-6">
            {s.about_title && <h2 className="font-display text-2xl font-bold sm:text-3xl">{s.about_title}</h2>}
            {s.about_description && <p className="mt-4 text-muted-foreground">{s.about_description}</p>}
          </div>
        </section>
      )}

      {/* CONTATO */}
      {hasContact && (
        <section id="contato" className="border-t border-border">
          <div className="mx-auto max-w-3xl px-4 py-14 text-center sm:px-6">
            <h2 className="font-display text-2xl font-bold sm:text-3xl">Contato</h2>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
              {s.city && <span>{s.city}</span>}
              {s.instagram && <span className="flex items-center gap-1"><Instagram className="size-4" /> @{s.instagram.replace(/^@/, "")}</span>}
            </div>
            {chatText && <a href={chatText} target="_blank" rel="noreferrer" className="mt-6 inline-flex items-center gap-2 rounded-md px-5 py-2.5 text-sm font-medium text-white" style={{ background: accent }}><MessageCircle className="size-4" /> Falar pelo WhatsApp</a>}
          </div>
        </section>
      )}

      {/* FOOTER */}
      <footer className="border-t border-border py-8 text-center text-xs text-muted-foreground">
        <p>{s.display_name}{s.instagram ? ` · @${s.instagram.replace(/^@/, "")}` : ""}</p>
        <p className="mt-1">Catálogo criado com movvia</p>
      </footer>

      {/* WHATSAPP FLUTUANTE (mobile) */}
      {chatText && (
        <a
          href={chatText}
          target="_blank"
          rel="noreferrer"
          className="fixed bottom-5 right-5 z-40 grid size-14 place-items-center rounded-full text-white shadow-lg md:hidden"
          style={{ background: accent }}
          aria-label="Falar no WhatsApp"
        >
          <MessageCircle className="size-6" />
        </a>
      )}
    </div>
  );
}

function FilterChip({ active, onClick, children, accent }: { active: boolean; onClick: () => void; children: React.ReactNode; accent: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors"
      style={active ? { borderColor: accent, color: accent, background: `${accent}1a` } : { borderColor: "hsl(var(--border))" }}
    >
      {children}
    </button>
  );
}
