import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ArrowDown, ArrowUp, Car, ExternalLink, Globe2, MessageCircle, Save, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Field } from "@/components/app/Field";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { leadsQuery, siteQuery, vehiclesQuery, type PublicSite } from "@/lib/queries";
import { formatDate } from "@/lib/format";
import { CatalogPreview } from "@/components/catalog/CatalogPreview";
import { CatalogUpload } from "@/components/catalog/CatalogUpload";
import { ShareCatalog } from "@/components/catalog/ShareCatalog";
import { DEFAULT_ACCENT, statusInfo, vehicleTitle, whatsappLink, type CatalogVehicle } from "@/components/catalog/catalog-utils";

export const Route = createFileRoute("/_authenticated/app/catalogo")({
  head: () => ({ meta: [{ title: "Meu catálogo — movvia" }, { name: "description", content: "Personalize e compartilhe seu catálogo de carros e acompanhe interesses recebidos." }, { property: "og:title", content: "Meu catálogo — movvia" }, { property: "og:description", content: "Sua vitrine de carros integrada ao movvia." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }, { name: "robots", content: "noindex" }] }),
  component: CatalogPage,
});
type SiteUpdate = Database["public"]["Tables"]["public_sites"]["Update"];
type LeadStatus = Database["public"]["Enums"]["lead_status"];
const LEAD_STATUS: Record<LeadStatus, string> = { novo: "Novo", em_atendimento: "Em atendimento", alugado: "Alugado", sem_interesse: "Sem interesse" };
const TEXT_FIELDS = ["display_name", "slug", "hero_title", "hero_subtitle", "description", "whatsapp", "instagram", "city", "about_title", "about_description", "business_hours", "footer_text"] as const;

function emptySite(): PublicSite {
  return { id: "", user_id: "", slug: "", display_name: "Meu catálogo", description: null, hero_title: null, hero_subtitle: null, logo_url: null, banner_url: null, banner_position: 50, whatsapp: null, instagram: null, city: null, about_title: null, about_description: null, business_hours: null, footer_text: null, accent_color: DEFAULT_ACCENT, is_published: false, created_at: "", updated_at: "" };
}
function CatalogPage() {
  const site = useQuery(siteQuery), vehicles = useQuery(vehiclesQuery), leads = useQuery(leadsQuery);
  const client = useQueryClient();
  const [draft, setDraft] = useState<PublicSite>(emptySite);
  const [initialized, setInitialized] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [tab, setTab] = useState("overview");
  const [saving, setSaving] = useState(false);
  const [busyVehicle, setBusyVehicle] = useState<string | null>(null);
  const [busyLead, setBusyLead] = useState<string | null>(null);
  const [leadFilter, setLeadFilter] = useState("todos");
  const [origin, setOrigin] = useState("");
  useEffect(() => { setOrigin(window.location.origin); }, []);
  useEffect(() => { if (!site.isLoading && !initialized) { setDraft(site.data ?? emptySite()); setInitialized(true); } }, [site.data, site.isLoading, initialized]);
  useEffect(() => { if (!dirty) return; const guard = (event: BeforeUnloadEvent) => { event.preventDefault(); }; window.addEventListener("beforeunload", guard); return () => window.removeEventListener("beforeunload", guard); }, [dirty]);
  const update = (values: Partial<PublicSite>) => { setDraft(d => ({ ...d, ...values })); setDirty(true); };
  const rows = [...(vehicles.data ?? [])].sort((a,b) => a.catalog_order - b.catalog_order || a.id.localeCompare(b.id));
  const visible = rows.filter(v => v.show_in_catalog && v.status !== "inativo");
  const publicUrl = site.data ? `${origin}/catalogo/${site.data.slug}` : "";
  async function save(publish?: boolean) {
    const slug = draft.slug.trim().toLowerCase();
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug) || slug.length < 3 || slug.length > 40) { toast.error("O link deve ter de 3 a 40 caracteres: letras minúsculas, números e hífens."); setTab("personalization"); return; }
    if (!draft.display_name.trim()) { toast.error("Informe o nome exibido."); setTab("personalization"); return; }
    if (publish === false && !window.confirm("Despublicar o catálogo? O link deixará de estar disponível aos visitantes.")) return;
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser(); if (!user) throw new Error("Sessão expirada.");
      const values: SiteUpdate = { slug, logo_url: draft.logo_url, banner_url: draft.banner_url, banner_position: draft.banner_position, accent_color: draft.accent_color, is_published: publish ?? draft.is_published };
      values.display_name = draft.display_name.trim();
      for (const key of TEXT_FIELDS) { if (key !== "slug" && key !== "display_name") values[key] = draft[key]?.trim() || null; }
      const result = site.data ? await supabase.from("public_sites").update(values).eq("id", site.data.id).eq("user_id", user.id).select().single() : await supabase.from("public_sites").insert({ ...values, user_id: user.id, slug }).select().single();
      if (result.error) throw new Error(result.error.code === "23505" ? "Esse link já está em uso. Escolha outro." : result.error.message);
      setDraft(result.data); setDirty(false);
      await client.invalidateQueries({ queryKey: ["public_site"] }); await client.invalidateQueries({ queryKey: ["catalog"] });
      toast.success(publish === true ? "Catálogo publicado!" : publish === false ? "Catálogo despublicado." : "Catálogo salvo com sucesso.");
    } catch (e) { toast.error(e instanceof Error ? e.message : "Não foi possível salvar o catálogo."); }
    finally { setSaving(false); }
  }
  async function toggleVehicle(car: CatalogVehicle, show: boolean) {
    setBusyVehicle(car.id);
    try { const { error } = await supabase.from("vehicles").update({ show_in_catalog: show }).eq("id", car.id); if (error) throw error; await client.invalidateQueries({ queryKey: ["vehicles"] }); await client.invalidateQueries({ queryKey: ["catalog"] }); toast.success(show ? "Carro exibido no catálogo." : "Carro ocultado do catálogo."); }
    catch { toast.error("Não foi possível alterar a exibição."); } finally { setBusyVehicle(null); }
  }
  async function moveVehicle(index: number, direction: -1 | 1) {
    const car = rows[index]; if (!car || !rows[index + direction]) return;
    setBusyVehicle(car.id);
    const ordered = [...rows]; const other = ordered[index + direction]; if (!other) return; ordered[index] = other; ordered[index + direction] = car;
    try { const results = await Promise.all(ordered.map((v, position) => supabase.from("vehicles").update({ catalog_order: position }).eq("id", v.id))); if (results.some(r => r.error)) throw new Error(); await client.invalidateQueries({ queryKey: ["vehicles"] }); await client.invalidateQueries({ queryKey: ["catalog"] }); toast.success("Ordem atualizada."); }
    catch { toast.error("Não foi possível atualizar a ordem. Confira a lista."); await client.invalidateQueries({ queryKey: ["vehicles"] }); } finally { setBusyVehicle(null); }
  }
  async function changeLead(id: string, status: LeadStatus) {
    setBusyLead(id);
    try { const { error } = await supabase.from("site_leads").update({ status }).eq("id", id); if (error) throw error; await client.invalidateQueries({ queryKey: ["leads"] }); toast.success("Status atualizado."); }
    catch { toast.error("Não foi possível atualizar o status."); } finally { setBusyLead(null); }
  }
  if (site.isLoading || !initialized) return <div className="mx-auto max-w-6xl p-6"><Skeleton className="h-12 w-64"/><Skeleton className="mt-6 h-96 w-full"/></div>;
  if (site.isError) return <div className="mx-auto max-w-6xl p-6"><p role="alert">Não foi possível carregar seu catálogo.</p><Button className="mt-4" onClick={() => site.refetch()}>Tentar novamente</Button></div>;
  const filteredLeads = (leads.data ?? []).filter(l => leadFilter === "todos" || l.status === leadFilter);
  const field = (key: typeof TEXT_FIELDS[number], label: string, multiline = false) => <Field key={key} label={label} htmlFor={`catalog-${key}`}>{multiline ? <Textarea id={`catalog-${key}`} value={draft[key] ?? ""} maxLength={key === "about_description" ? 5000 : 2000} onChange={e => update({ [key]: e.target.value })}/> : <Input id={`catalog-${key}`} value={draft[key] ?? ""} maxLength={key === "slug" ? 40 : 200} onChange={e => update({ [key]: e.target.value })}/>}</Field>;
  return <div className="mx-auto max-w-6xl px-4 py-7 sm:px-6 lg:py-9">
    <div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs font-medium uppercase text-brand">Sua vitrine</p><h1 className="mt-2 text-3xl font-semibold">Meu catálogo</h1><p className="mt-2 text-sm text-muted-foreground">{site.data?.is_published ? "Publicado" : "Privado"}{dirty ? " · Alterações não salvas" : ""}</p></div><div className="flex flex-wrap gap-2"><Button variant="outline" onClick={() => save()} disabled={saving}><Save className="size-4"/>{saving ? "Salvando…" : "Salvar alterações"}</Button><Button onClick={() => save(!(site.data?.is_published ?? false))} disabled={saving}>{site.data?.is_published ? "Despublicar" : "Publicar catálogo"}</Button></div></div>
    <Tabs value={tab} onValueChange={setTab} className="mt-7"><div className="overflow-x-auto pb-2"><TabsList className="h-12 w-max gap-1 bg-transparent p-0">{[{id:"overview",label:"Visão geral"},{id:"personalization",label:"Personalização"},{id:"vehicles",label:"Veículos"},{id:"appearance",label:"Aparência"},{id:"sharing",label:"Compartilhar"},{id:"leads",label:`Leads${leads.data?.length ? ` (${leads.data.length})` : ""}`}].map(t => <TabsTrigger key={t.id} value={t.id} className="h-11 border border-transparent px-4 data-[state=active]:border-border data-[state=active]:bg-surface">{t.label}</TabsTrigger>)}</TabsList></div>
    <TabsContent value="overview" className="mt-6 space-y-8"><div className="grid gap-4 border-y border-border py-6 sm:grid-cols-3">{[{label:"Carros no catálogo",value:visible.length},{label:"Disponíveis",value:visible.filter(v => v.status === "disponivel").length},{label:"Novos interesses",value:(leads.data ?? []).filter(l => l.status === "novo").length}].map(stat => <div key={stat.label}><p className="text-sm text-muted-foreground">{stat.label}</p><p className="mt-2 text-3xl font-semibold">{stat.value}</p></div>)}</div><div className="flex flex-wrap gap-3"><Button variant="outline" onClick={() => setTab("personalization")}>Editar catálogo</Button><Button variant="outline" onClick={() => setTab("sharing")}><Share2 className="size-4"/>Compartilhar catálogo</Button>{site.data?.is_published && <Button variant="outline" asChild><Link to="/catalogo/$slug" params={{slug:site.data.slug}} target="_blank"><ExternalLink className="size-4"/>Visualizar catálogo</Link></Button>}</div>{!rows.length && !vehicles.isLoading && <div className="border-y border-border py-8"><h2 className="text-xl font-semibold">Seu catálogo está vazio.</h2><p className="mt-2 text-muted-foreground">Cadastre seu primeiro veículo para começar a divulgar sua frota.</p><Button asChild className="mt-4"><Link to="/app/veiculos">Adicionar veículo</Link></Button></div>}<CatalogPreview site={draft} vehicles={rows}/></TabsContent>
    <TabsContent value="personalization" className="mt-6"><div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]"><div className="space-y-6"><div className="grid gap-4 sm:grid-cols-2">{field("display_name","Nome exibido")}{field("slug","Link personalizado (slug)")}</div><p className="-mt-3 break-all text-xs text-muted-foreground">/catalogo/{draft.slug || "seu-link"}</p><CatalogUpload label="Logo" value={draft.logo_url} onChange={logo_url => update({logo_url})}/><CatalogUpload label="Banner · 1920 × 600 recomendado" value={draft.banner_url} onChange={banner_url => update({banner_url})} banner/>{draft.banner_url && <div><div className="aspect-[16/5] overflow-hidden rounded-md border border-border"><img src={draft.banner_url} alt="Enquadramento do banner" className="size-full object-cover" style={{objectPosition:`center ${draft.banner_position}%`}}/></div><label className="mt-3 block text-sm">Ajustar enquadramento<input aria-label="Ajustar enquadramento" type="range" min="0" max="100" value={draft.banner_position} onChange={e => update({banner_position:Number(e.target.value)})} className="mt-3 w-full"/></label></div>}{field("hero_title","Título principal")}{field("hero_subtitle","Subtítulo")}{field("description","Descrição",true)}<div className="grid gap-4 sm:grid-cols-2">{field("whatsapp","WhatsApp")}{field("instagram","Instagram")}{field("city","Cidade/região")}{field("business_hours","Horário de atendimento")}</div>{field("about_title","Título da seção Sobre")}{field("about_description","Texto da seção Sobre",true)}{field("footer_text","Texto do rodapé",true)}</div><div className="min-w-0 lg:sticky lg:top-28 lg:self-start"><CatalogPreview site={draft} vehicles={rows}/></div></div></TabsContent>
    <TabsContent value="vehicles" className="mt-6"><div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-xl font-semibold">Veículos do catálogo</h2><Button variant="outline" asChild><Link to="/app/veiculos"><Car className="size-4"/>Seus carros</Link></Button></div>{vehicles.isLoading ? <Skeleton className="mt-5 h-40 w-full"/> : vehicles.isError ? <p className="mt-5 text-destructive">Não foi possível carregar os carros.<Button variant="ghost" onClick={() => vehicles.refetch()}>Tentar novamente</Button></p> : !rows.length ? <p className="py-10 text-muted-foreground">Seu catálogo está vazio.</p> : <div className="mt-5 divide-y divide-border border-y border-border">{rows.map((car,index) => <div key={car.id} className="flex flex-wrap items-center gap-4 py-4"><div className="size-16 shrink-0 overflow-hidden rounded-md bg-surface">{car.vehicle_photos[0] ? <img src={car.vehicle_photos.find(p => p.is_primary)?.url || car.vehicle_photos[0].url} alt="" className="size-full object-cover" loading="lazy"/> : <Car className="m-5 size-6 text-muted-foreground"/>}</div><div className="min-w-0 flex-1"><Link to="/app/veiculos/$id" params={{id:car.id}} className="font-medium hover:text-brand">{vehicleTitle(car)}</Link><p className="mt-1 text-xs text-muted-foreground">{statusInfo(car.status).label}{car.status === "inativo" ? " · Inativo: não será exibido" : ""}</p></div><div className="flex items-center gap-3"><Button variant="ghost" size="icon" title="Mover para cima" aria-label={`Mover ${car.model} para cima`} disabled={index === 0 || busyVehicle !== null} onClick={() => moveVehicle(index,-1)}><ArrowUp className="size-4"/></Button><Button variant="ghost" size="icon" title="Mover para baixo" aria-label={`Mover ${car.model} para baixo`} disabled={index === rows.length - 1 || busyVehicle !== null} onClick={() => moveVehicle(index,1)}><ArrowDown className="size-4"/></Button><Switch aria-label={`Mostrar ${car.model} no catálogo`} checked={car.show_in_catalog} disabled={busyVehicle !== null} onCheckedChange={show => toggleVehicle(car,show)}/></div></div>)}</div>}</TabsContent>
    <TabsContent value="appearance" className="mt-6"><div className="grid gap-8 lg:grid-cols-2"><div><h2 className="text-xl font-semibold">Premium Dark</h2><div className="mt-6"><label htmlFor="catalog-accent" className="text-sm font-medium">Cor de destaque</label><div className="mt-3 flex items-center gap-3"><input id="catalog-accent" type="color" value={draft.accent_color} onChange={e => update({accent_color:e.target.value})} className="h-11 w-16 cursor-pointer rounded-md border border-input bg-background"/><span className="text-sm text-muted-foreground">{draft.accent_color}</span></div></div></div><CatalogPreview site={draft} vehicles={rows}/></div></TabsContent>
    <TabsContent value="sharing" className="mt-6"><ShareCatalog url={publicUrl} name={site.data?.display_name || draft.display_name} published={Boolean(site.data?.is_published)}/></TabsContent>
    <TabsContent value="leads" className="mt-6"><div className="flex flex-wrap items-center justify-between gap-4"><h2 className="text-xl font-semibold">Leads recebidos</h2><Select value={leadFilter} onValueChange={setLeadFilter}><SelectTrigger className="w-48" aria-label="Filtrar leads"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="todos">Todos</SelectItem>{Object.entries(LEAD_STATUS).map(([value,label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectContent></Select></div>{leads.isLoading ? <Skeleton className="mt-6 h-40 w-full"/> : leads.isError ? <p className="mt-6 text-destructive">Não foi possível carregar os leads.<Button variant="ghost" onClick={() => leads.refetch()}>Tentar novamente</Button></p> : !filteredLeads.length ? <p className="py-10 text-muted-foreground">{leads.data?.length ? "Nenhum lead com esse status." : "Nenhum lead recebido."}</p> : <div className="mt-6 divide-y divide-border border-y border-border">{filteredLeads.map(lead => { const chat = whatsappLink(lead.whatsapp,`Olá, ${lead.name}! Recebi seu interesse${lead.vehicles ? ` no ${vehicleTitle(lead.vehicles)}` : ""}.`); return <article key={lead.id} className="flex flex-wrap items-start justify-between gap-5 py-5"><div className="min-w-0 flex-1"><h3 className="font-semibold">{lead.name}</h3><p className="mt-1 text-sm text-muted-foreground">{lead.whatsapp} · {formatDate(lead.created_at)}</p><p className="mt-2 text-sm">{lead.vehicles ? vehicleTitle(lead.vehicles) : "Veículo não disponível"}</p>{lead.message && <p className="mt-2 whitespace-pre-line break-words text-sm text-muted-foreground">{lead.message}</p>}</div><div className="flex flex-wrap gap-2"><Select value={lead.status} disabled={busyLead === lead.id} onValueChange={status => changeLead(lead.id,status as LeadStatus)}><SelectTrigger className="w-44" aria-label={`Status de ${lead.name}`}><SelectValue/></SelectTrigger><SelectContent>{Object.entries(LEAD_STATUS).map(([value,label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectContent></Select>{chat && <Button asChild variant="outline"><a href={chat} target="_blank" rel="noreferrer"><MessageCircle className="size-4"/>Conversar no WhatsApp</a></Button>}</div></article>; })}</div>}</TabsContent>
    </Tabs>
  </div>;
}
