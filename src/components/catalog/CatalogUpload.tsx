import { useRef, useState } from "react";
import { ImagePlus, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export function CatalogUpload({ label, value, onChange, banner = false }: { label: string; value: string | null; onChange: (url: string | null) => void; banner?: boolean }) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  async function upload(file?: File) {
    if (!file) return;
    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type) || file.size > 10 * 1024 * 1024) { toast.error("Envie JPG, PNG ou WebP de até 10 MB."); return; }
    setBusy(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Sessão expirada.");
      const bitmap = await createImageBitmap(file);
      const scale = Math.min(1, (banner ? 1920 : 512) / Math.max(bitmap.width, bitmap.height));
      const canvas = document.createElement("canvas"); canvas.width = Math.max(1, Math.round(bitmap.width * scale)); canvas.height = Math.max(1, Math.round(bitmap.height * scale));
      const ctx = canvas.getContext("2d"); if (!ctx) throw new Error("Não foi possível processar a imagem.");
      ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height); bitmap.close();
      const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob(b => b ? resolve(b) : reject(new Error("Falha ao processar imagem.")), "image/webp", .85));
      const path = `${user.id}/${banner ? "banner" : "logo"}-${crypto.randomUUID()}.webp`;
      const { error } = await supabase.storage.from("site-assets").upload(path, blob, { contentType: "image/webp" }); if (error) throw error;
      const { data } = supabase.storage.from("site-assets").getPublicUrl(path); onChange(data.publicUrl); toast.success("Imagem pronta para salvar.");
    } catch (e) { toast.error(e instanceof Error ? e.message : "Falha ao enviar imagem."); }
    finally { setBusy(false); if (input.current) input.current.value = ""; }
  }
  return <div><p className="mb-3 text-sm font-medium">{label}</p><div className="flex flex-wrap items-center gap-3">{!banner && value && <img src={value} alt="Logo" className="size-16 rounded-md border border-border object-contain"/>}<input ref={input} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" aria-label={label} onChange={e => upload(e.target.files?.[0])}/><Button variant="outline" type="button" disabled={busy} onClick={() => input.current?.click()}>{busy ? <Loader2 className="size-4 animate-spin"/> : <ImagePlus className="size-4"/>}{value ? "Trocar" : "Adicionar"} {banner ? "banner" : "logo"}</Button>{value && <Button variant="ghost" size="icon" type="button" aria-label={`Remover ${banner ? "banner" : "logo"}`} onClick={() => { if (window.confirm("Remover esta imagem do catálogo?")) onChange(null); }}><Trash2 className="size-4"/></Button>}</div></div>;
}