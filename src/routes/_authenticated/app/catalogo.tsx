import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Copy, ImagePlus, Loader2, MessageCircle, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field } from "@/components/app/Field";
import { supabase } from "@/integrations/supabase/client";
import { resizeImageToBlob } from "@/lib/image";
import { leadsQuery, siteQuery } from "@/lib/queries";

export const Route = createFileRoute("/_authenticated/app/catalogo")({ component: CatalogPage });

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

function CatalogPage() {
  const site = useQuery(siteQuery);
  const leads = useQuery(leadsQuery);
  const client = useQueryClient();
  const logoInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [saving, setSaving] = useState(false);
  const [bannerPosition, setBannerPosition] = useState<number | null>(null);

  const s = site.data as (typeof site.data & { about_title?: string | null; about_description?: string | null; city?: string | null; accent_color?: string | null }) | null;
  const position = bannerPosition ?? s?.banner_position ?? 50;

  function refresh() {
    client.invalidateQueries({ queryKey: ["public_site"] });
  }

  async function upsertSite(values: Record<string, unknown>) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { toast.error("Sessão expirada."); return false; }

    if (s) {
      const { error } = await supabase.from("public_sites").update(values).eq("id", s.id);
      if (error) { toast.error(error.code === "23505" ? "Esse link já está em uso, escolha outro." : error.message); return false; }
    } else {
      const insertValues: Record<string, unknown> = {
        user_id: user.id,
        is_published: false,
        ...values,
      };
      if (!insertValues.slug) insertValues.slug = user.id;
      if (!insertValues.display_name) insertValues.display_name = "Meu catálogo";
      const { error } = await supabase.from("public_sites").insert(insertValues as never);
      if (error) { toast.error(error.code === "23505" ? "Esse link já está em uso, escolha outro." : error.message); return false; }
    }
    refresh();
    return true;
  }

  async function togglePublish() {
    const ok = await upsertSite({ is_published: !(s?.is_published ?? false) });
    if (ok) toast.success(s?.is_published ? "Catálogo despublicado." : "Catálogo publicado!");
  }

  async function submitDetails(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    const f = new FormData(event.currentTarget);
    const rawSlug = String(f.get("slug") ?? "").trim();
    const values = {
      display_name: String(f.get("display_name") ?? "").trim() || "Meu catálogo",
      slug: slugify(rawSlug) || undefined,
      description: String(f.get("description") ?? "").trim() || null,
      hero_title: String(f.get("hero_title") ?? "").trim() || null,
      hero_subtitle: String(f.get("hero_subtitle") ?? "").trim() || null,
      whatsapp: String(f.get("whatsapp") ?? "").trim() || null,
      instagram: String(f.get("instagram") ?? "").trim() || null,
      city: String(f.get("city") ?? "").trim() || null,
      about_title: String(f.get("about_title") ?? "").trim() || null,
      about_description: String(f.get("about_description") ?? "").trim() || null,
      accent_color: String(f.get("accent_color") ?? "").trim() || "#22c55e",
      banner_position: position,
    };
    const ok = await upsertSite(values);
    setSaving(false);
    if (ok) toast.success("Catálogo salvo com sucesso.");
  }

  async function handleLogo(file: File | undefined) {
    if (!file) return;
    setUploadingLogo(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { toast.error("Sessão expirada."); setUploadingLogo(false); return; }
    try {
      const blob = await resizeImageToBlob(file, 512, 0.85);
      const path = `${user.id}/logo-${crypto.randomUUID()}.jpg`;
      const { error } = await supabase.storage.from("site-assets").upload(path, blob, { contentType: "image/jpeg" });
      if (error) throw error;
      const { data: pub } = supabase.storage.from("site-assets").getPublicUrl(path);
      await upsertSite({ logo_url: pub.publicUrl });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Falha ao enviar logo.");
    }
    setUploadingLogo(false);
  }

  async function handleBanner(file: File | undefined) {
    if (!file) return;
    setUploadingBanner(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { toast.error("Sessão expirada."); setUploadingBanner(false); return; }
    try {
      const blob = await resizeImageToBlob(file, 1920, 0.85);
      const path = `${user.id}/banner-${crypto.randomUUID()}.jpg`;
      const { error } = await supabase.storage.from("site-assets").upload(path, blob, { contentType: "image/jpeg" });
      if (error) throw error;
      const { data: pub } = supabase.storage.from("site-assets").getPublicUrl(path);
      await upsertSite({ banner_url: pub.publicUrl });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Falha ao enviar banner.");
    }
    setUploadingBanner(false);
  }

  async function downloadQrCode() {
    if (!publicUrl) return;
    try {
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=512x512&data=${encodeURIComponent(publicUrl)}`;
      const response = await fetch(qrUrl);
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = "catalogo-qrcode.png";
      link.click();
      URL.revokeObjectURL(objectUrl);
    } catch {
      toast.error("Não foi possível baixar o QR Code.");
    }
  }

  if (site.isLoading || leads.isLoading) return <main className="mx-auto max-w-4xl px-4 py-8">Carregando...</main>;

  const publicUrl = s ? `${window.location.origin}/catalogo/${s.slug}` : null;
  const canShare = Boolean(s?.is_published && publicUrl);

  return (
    <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <h1 className="font-display text-3xl font-bold">Catálogo</h1>
      <p className="mt-1 text-sm text-muted-foreground">Personalize sua vitrine pública e acompanhe quem demonstrou interesse.</p>

      <div className="mt-6 flex items-center justify-between rounded-md border border-border bg-card p-5">
        <div>
          <h2 className="font-display text-lg font-semibold">Publicação</h2>
          <p className="mt-1 text-sm text-muted-foreground">{s?.is_published ? "Seu catálogo está publicado." : "Seu catálogo está oculto."}</p>
        </div>
        <Button type="button" variant={s?.is_published ? "outline" : "default"} onClick={togglePublish}>
          {s?.is_published ? "Despublicar" : "Publicar catálogo"}
        </Button>
      </div>

      {canShare && (
        <div className="mt-5 rounded-md border border-border bg-card p-5">
          <h2 className="font-display text-lg font-semibold">Compartilhar meu catálogo</h2>
          <p className="mt-1 break-all text-sm text-brand">{publicUrl}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => { navigator.clipboard.writeText(publicUrl!); toast.success("Link copiado!"); }}>
              <Copy className="size-4" /> Copiar link
            </Button>
            <Button asChild type="button" variant="outline" size="sm">
              <a href={`https://wa.me/?text=${encodeURIComponent(`Confira meus carros disponíveis: ${publicUrl}`)}`} target="_blank" rel="noreferrer">
                <MessageCircle className="size-4" /> Compartilhar no WhatsApp
              </a>
            </Button>
            {typeof navigator !== "undefined" && "share" in navigator && (
              <Button type="button" variant="outline" size="sm" onClick={() => navigator.share({ title: s?.display_name, url: publicUrl! })}>
                <Share2 className="size-4" /> Compartilhar
              </Button>
            )}
          </div>
          <div className="mt-5 inline-block rounded-md border border-border bg-white p-3">
            <img src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(publicUrl!)}`} alt="QR Code do catálogo" width={180} height={180} />
          </div>
          <div>
            <Button type="button" variant="outline" size="sm" className="mt-3" onClick={downloadQrCode}>
              Baixar QR Code
            </Button>
          </div>
        </div>
      )}

      <form onSubmit={submitDetails} className="mt-5 space-y-5 rounded-md border border-border bg-card p-5">
        <h2 className="font-display text-lg font-semibold">Personalizar meu site</h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="mb-2 text-sm font-medium">Logo</p>
            <div className="flex items-center gap-3">
              {s?.logo_url ? <img src={s.logo_url} alt="Logo" className="size-14 rounded-full object-cover" /> : <div className="grid size-14 place-items-center rounded-full bg-surface text-xs text-muted-foreground">Logo</div>}
              <input ref={logoInputRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={(e) => handleLogo(e.target.files?.[0])} />
              <Button type="button" size="sm" variant="outline" disabled={uploadingLogo} onClick={() => logoInputRef.current?.click()}>
                {uploadingLogo ? <Loader2 className="size-4 animate-spin" /> : <ImagePlus className="size-4" />} Trocar
              </Button>
            </div>
          </div>
          <div>
            <p className="mb-2 text-sm font-medium">Banner (1920×600 recomendado)</p>
            <div className="flex items-center gap-3">
              <input ref={bannerInputRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={(e) => handleBanner(e.target.files?.[0])} />
              <Button type="button" size="sm" variant="outline" disabled={uploadingBanner} onClick={() => bannerInputRef.current?.click()}>
                {uploadingBanner ? <Loader2 className="size-4 animate-spin" /> : <ImagePlus className="size-4" />} {s?.banner_url ? "Trocar banner" : "Adicionar banner"}
              </Button>
            </div>
          </div>
        </div>

        {s?.banner_url && (
          <div>
            <div className="aspect-[16/5] w-full overflow-hidden rounded-md border border-border bg-surface">
              <img src={s.banner_url} alt="Banner" className="size-full object-cover" style={{ objectPosition: `center ${position}%` }} />
            </div>
            <label className="mt-2 block text-xs text-muted-foreground">
              Ajustar enquadramento
              <input type="range" min={0} max={100} value={position} onChange={(e) => setBannerPosition(Number(e.target.value))} className="mt-1 w-full" />
            </label>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nome exibido" htmlFor="display_name"><Input id="display_name" name="display_name" defaultValue={s?.display_name ?? ""} required /></Field>
          <Field label="Link personalizado (slug)" htmlFor="slug">
            <div className="flex items-center gap-1">
              <span className="whitespace-nowrap text-sm text-muted-foreground">/catalogo/</span>
              <Input id="slug" name="slug" defaultValue={s?.slug ?? ""} placeholder="jr-carros" />
            </div>
          </Field>
          <Field label="Título principal" htmlFor="hero_title"><Input id="hero_title" name="hero_title" defaultValue={s?.hero_title ?? ""} placeholder="Encontre seu próximo carro" /></Field>
          <Field label="Texto secundário" htmlFor="hero_subtitle"><Input id="hero_subtitle" name="hero_subtitle" defaultValue={s?.hero_subtitle ?? ""} placeholder="Confira os veículos disponíveis" /></Field>
          <Field label="WhatsApp" htmlFor="whatsapp"><Input id="whatsapp" name="whatsapp" defaultValue={s?.whatsapp ?? ""} placeholder="5511999999999" /></Field>
          <Field label="Instagram" htmlFor="instagram"><Input id="instagram" name="instagram" defaultValue={s?.instagram ?? ""} placeholder="@seuinstagram" /></Field>
          <Field label="Cidade/região" htmlFor="city"><Input id="city" name="city" defaultValue={s?.city ?? ""} placeholder="São Paulo, SP" /></Field>
          <Field label="Cor de destaque" htmlFor="accent_color">
            <div className="flex items-center gap-2">
              <input type="color" name="accent_color" defaultValue={s?.accent_color || "#22c55e"} className="h-9 w-12 rounded-md border border-input bg-background" />
            </div>
          </Field>
        </div>
        <Field label="Descrição" htmlFor="description"><Textarea id="description" name="description" defaultValue={s?.description ?? ""} /></Field>

        <div className="grid gap-4 border-t border-border pt-5 sm:grid-cols-2">
          <Field label="Título da seção Sobre" htmlFor="about_title"><Input id="about_title" name="about_title" defaultValue={s?.about_title ?? ""} placeholder="Aluguel de carros com praticidade" /></Field>
          <div />
          <div className="sm:col-span-2">
            <Field label="Descrição da seção Sobre" htmlFor="about_description"><Textarea id="about_description" name="about_description" defaultValue={s?.about_description ?? ""} placeholder="Conte um pouco sobre o seu negócio..." /></Field>
          </div>
        </div>

        <Button type="submit" disabled={saving}>{saving ? "Salvando..." : "Salvar"}</Button>
      </form>

      <section className="mt-8">
        <h2 className="font-display text-lg font-semibold">Leads recebidos</h2>
        {leads.isError ? <p className="mt-3 text-destructive">Não foi possível carregar os leads.</p>
          : !leads.data?.length ? <p className="mt-3 text-sm text-muted-foreground">Nenhum lead recebido.</p>
          : <div className="mt-3 divide-y divide-border rounded-md border border-border">{leads.data.map((lead) => (
              <div className="flex flex-wrap items-center justify-between gap-3 p-4" key={lead.id}>
                <div>
                  <p className="font-medium">{lead.name}</p>
                  <p className="text-sm text-muted-foreground">{lead.whatsapp}{lead.message ? ` · ${lead.message}` : ""}</p>
                </div>
                <select
                  defaultValue={lead.status}
                  onChange={async (e) => {
                    const { error } = await supabase.from("site_leads").update({ status: e.target.value }).eq("id", lead.id);
                    if (error) { toast.error(error.message); return; }
                    toast.success("Status atualizado.");
                    client.invalidateQueries({ queryKey: ["leads"] });
                  }}
                  className="rounded-md border border-input bg-background px-2 py-1 text-xs"
                >
                  <option value="novo">Novo</option>
                  <option value="em_atendimento">Em atendimento</option>
                  <option value="alugado">Alugado</option>
                  <option value="sem_interesse">Sem interesse</option>
                </select>
              </div>
            ))}</div>}
      </section>
    </main>
  );
}
