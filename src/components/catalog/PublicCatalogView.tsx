import { useMemo, useState, type CSSProperties } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowDown, Clock, Menu, MessageCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VehicleCard } from "./VehicleCard";
import { safeAccent, readableOn, whatsappLink, instagramHandle, type CatalogVehicle } from "./catalog-utils";
import type { PublicSite } from "@/lib/queries";

export function PublicCatalogView({ site, vehicles, preview = false }: { site: PublicSite; vehicles: CatalogVehicle[]; preview?: boolean }) {
  const [menu, setMenu] = useState(false);
  const [filter, setFilter] = useState("Todos");
  const accent = safeAccent(site.accent_color);
  const chat = whatsappLink(site.whatsapp, `Olá! Vi o catálogo da ${site.display_name} e quero saber mais.`);
  const handle = instagramHandle(site.instagram);
  const rows = useMemo(() => [...vehicles].filter(v => v.show_in_catalog && v.status !== "inativo").sort((a, b) => a.catalog_order - b.catalog_order || a.id.localeCompare(b.id)), [vehicles]);
  const filters = ["Todos", "Disponíveis", "Automáticos", "Manuais", ...Array.from(new Set(rows.map(v => v.category).filter((c): c is string => Boolean(c))))];
  const filtered = rows.filter(v => filter === "Todos" || (filter === "Disponíveis" ? v.status === "disponivel" : filter === "Automáticos" ? v.transmission === "automatico" : filter === "Manuais" ? v.transmission === "manual" : v.category === filter));
  const about = Boolean(site.about_title || site.about_description);
  const contact = Boolean(site.whatsapp || handle || site.city || site.business_hours);
  const anchor = (id: string) => { document.getElementById(`${preview ? "preview-" : ""}${id}`)?.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" }); setMenu(false); };
  const nav = ["Início", "Veículos", ...(about ? ["Sobre"] : []), ...(contact ? ["Contato"] : [])];
  const ids: Record<string, string> = { "Início": "inicio", "Veículos": "veiculos", "Sobre": "sobre", "Contato": "contato" };
  return <div className={`catalog-root ${preview ? "catalog-preview" : "min-h-screen"}`} style={{ "--c-accent": accent, "--c-on-accent": readableOn(accent) } as CSSProperties}>
    <header className="catalog-header border-b border-(--c-line)"><div className="mx-auto flex h-18 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
      <Button variant="ghost" onClick={() => anchor("inicio")} className="min-w-0 justify-start gap-3 px-0 hover:bg-transparent"><Brand site={site} /></Button>
      <nav className="catalog-desktop-nav items-center gap-3" aria-label="Principal">{nav.map(n => <Button key={n} variant="ghost" onClick={() => anchor(ids[n] ?? "inicio")} className="text-(--c-mute) hover:bg-(--c-raise2) hover:text-(--c-text)">{n}</Button>)}</nav>
      <div className="flex shrink-0 items-center gap-2">{chat && <Button asChild className="catalog-cta"><a href={chat} target="_blank" rel="noreferrer"><MessageCircle className="size-4"/><span className="hidden sm:inline">Falar no </span>WhatsApp</a></Button>}<Button size="icon" variant="outline" className="catalog-mobile-menu" aria-label={menu ? "Fechar menu" : "Abrir menu"} aria-expanded={menu} onClick={() => setMenu(!menu)}>{menu ? <X/> : <Menu/>}</Button></div>
    </div>{menu && <nav className="catalog-mobile-menu border-t border-(--c-line) px-4 py-2" aria-label="Menu móvel">{nav.map(n => <Button key={n} variant="ghost" className="w-full justify-start" onClick={() => anchor(ids[n] ?? "inicio")}>{n}</Button>)}</nav>}</header>
    <section id={`${preview ? "preview-" : ""}inicio`} className={`catalog-hero relative isolate ${site.banner_url ? "" : "catalog-hero-no-image"}`}>
      {site.banner_url && <><img src={site.banner_url} alt="" className="absolute inset-0 -z-20 size-full object-cover" style={{ objectPosition: `center ${site.banner_position}%` }} fetchPriority="high"/><div className="catalog-hero-overlay absolute inset-0 -z-10"/></>}
      <div className="mx-auto flex h-full max-w-6xl flex-col justify-end px-4 pb-12 pt-16 sm:px-6 md:pb-16">
        <p className="catalog-rise text-sm font-medium uppercase text-(--c-hero-muted)">{site.display_name}{site.city ? ` · ${site.city}` : ""}</p>
        <h1 className="catalog-rise mt-4 max-w-3xl text-4xl font-semibold leading-tight text-(--c-hero-text) sm:text-5xl lg:text-6xl">{site.hero_title || site.display_name}</h1>
        <p className="catalog-rise mt-5 max-w-xl text-base leading-relaxed text-(--c-hero-muted) sm:text-lg">{site.hero_subtitle || site.description || "Veículos disponíveis para aluguel."}</p>
        <div className="catalog-rise mt-7 flex flex-wrap gap-3"><Button onClick={() => anchor("veiculos")} className="catalog-cta h-12 px-6">Ver veículos <ArrowDown className="size-4"/></Button>{chat && <Button asChild variant="outline" className="catalog-secondary h-12 px-6"><a href={chat} target="_blank" rel="noreferrer">Falar no WhatsApp</a></Button>}</div>
      </div>
    </section>
    <main id={`${preview ? "preview-" : ""}veiculos`} className="mx-auto max-w-6xl px-4 py-12 sm:px-6 md:py-16">
      <div className="flex flex-wrap items-end justify-between gap-4"><div><h2 className="text-3xl font-semibold">Veículos disponíveis</h2><p className="mt-2 text-(--c-mute)">Escolha o veículo ideal para você.</p></div>{rows.length > 0 && <p className="text-sm text-(--c-mute)" aria-live="polite">{filtered.length} {filtered.length === 1 ? "veículo" : "veículos"}</p>}</div>
      {rows.length > 0 && <div className="catalog-scroll mt-7 flex gap-2 overflow-x-auto pb-2" aria-label="Filtros">{filters.map(f => <Button key={f} variant="outline" aria-pressed={filter === f} onClick={() => setFilter(f)} className={`h-11 shrink-0 ${filter === f ? "catalog-cta" : "border-(--c-line) bg-transparent text-(--c-mute) hover:bg-(--c-raise2)"}`}>{f}</Button>)}</div>}
      {rows.length === 0 ? <div className="py-16 text-center"><h3 className="text-2xl font-semibold">Em breve novos veículos estarão disponíveis.</h3><p className="mt-3 text-(--c-mute)">Entre em contato para consultar disponibilidade.</p>{chat && <Button asChild className="catalog-cta mt-6"><a href={chat} target="_blank" rel="noreferrer">Falar no WhatsApp</a></Button>}</div> : filtered.length === 0 ? <div className="py-16 text-center"><h3 className="text-xl font-medium">Nenhum veículo com esses filtros.</h3><Button variant="ghost" onClick={() => setFilter("Todos")} className="mt-3">Limpar filtros</Button></div> : <div className="catalog-vehicle-grid mt-6 grid gap-6">{filtered.map((car, i) => preview ? <div key={car.id} className="pointer-events-none"><VehicleCard car={car} slug={site.slug} accent={accent} priority={i < 3}/></div> : <VehicleCard key={car.id} car={car} slug={site.slug} accent={accent} priority={i < 3}/>)}</div>}
    </main>
    {about && <section id={`${preview ? "preview-" : ""}sobre`} className="border-y border-(--c-line) bg-(--c-raise)"><div className="mx-auto grid max-w-6xl gap-8 px-4 py-16 sm:px-6 md:grid-cols-2"><h2 className="text-3xl font-semibold">{site.about_title || `Sobre ${site.display_name}`}</h2><p className="whitespace-pre-line text-lg leading-relaxed text-(--c-mute)">{site.about_description}</p></div></section>}
    {contact && <section id={`${preview ? "preview-" : ""}contato`}><div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-8 px-4 py-16 sm:px-6"><div><h2 className="text-3xl font-semibold">Contato</h2><div className="mt-5 space-y-3 text-(--c-mute)">{site.city && <p>{site.city}</p>}{site.business_hours && <p className="flex items-center gap-2"><Clock className="size-4"/>{site.business_hours}</p>}{site.whatsapp && <p>{site.whatsapp}</p>}{handle && <a className="block hover:text-(--c-accent)" href={`https://instagram.com/${encodeURIComponent(handle)}`} target="_blank" rel="noreferrer">@{handle}</a>}</div></div>{chat && <Button asChild className="catalog-cta h-12 px-7"><a href={chat} target="_blank" rel="noreferrer"><MessageCircle className="size-5"/>Falar pelo WhatsApp</a></Button>}</div></section>}
    <footer className="border-t border-(--c-line) px-4 pb-24 pt-9 sm:px-6 md:pb-9"><div className="mx-auto flex max-w-6xl flex-wrap justify-between gap-6"><div><Brand site={site}/>{site.footer_text && <p className="mt-3 max-w-lg whitespace-pre-line text-sm text-(--c-mute)">{site.footer_text}</p>}<p className="mt-3 text-xs text-(--c-mute)">© {new Date().getFullYear()} {site.display_name}. Todos os direitos reservados.</p></div><nav className="flex flex-wrap gap-4 text-sm text-(--c-mute)">{nav.map(n => <Button key={n} variant="ghost" onClick={() => anchor(ids[n] ?? "inicio")}>{n}</Button>)}{chat && <a href={chat} target="_blank" rel="noreferrer">WhatsApp</a>}{handle && <a href={`https://instagram.com/${encodeURIComponent(handle)}`} target="_blank" rel="noreferrer">Instagram</a>}</nav></div><p className="mx-auto mt-7 max-w-6xl text-xs text-(--c-mute)">Catálogo criado com movvia</p></footer>
    {!preview && chat && <Button asChild size="icon" className="catalog-cta fixed bottom-4 right-4 z-40 size-14 rounded-full md:hidden"><a aria-label="Falar no WhatsApp" href={chat} target="_blank" rel="noreferrer"><MessageCircle className="size-6"/></a></Button>}
  </div>;
}
function Brand({ site }: { site: PublicSite }) { return <span className="flex min-w-0 items-center gap-3">{site.logo_url && <img src={site.logo_url} alt="" className="size-10 shrink-0 rounded-md object-contain"/>}<span className="max-w-56 break-words text-lg font-semibold">{site.display_name}</span></span>; }
