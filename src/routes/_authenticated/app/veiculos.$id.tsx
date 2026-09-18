import { useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ImagePlus, Loader2, Star, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Field } from "@/components/app/Field";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { formatCurrency, formatDate, parseCurrencyToCents } from "@/lib/format";
import { resizeImageToBlob } from "@/lib/image";
import {
  customersQuery, expensesQuery, maintenancesQuery, paymentsQuery, PERIODICITY_LABEL,
  rentalsQuery, VEHICLE_STATUS_LABEL, vehicleQuery, type Vehicle, type VehiclePhoto,
} from "@/lib/queries";

export const Route = createFileRoute("/_authenticated/app/veiculos/$id")({ component: VehicleDetailPage });

const MAX_PHOTOS = 10;
type VehicleWithPhotos = Vehicle & { vehicle_photos: VehiclePhoto[] };

function VehicleDetailPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const client = useQueryClient();
  const vehicle = useQuery(vehicleQuery(id));
  const rentals = useQuery(rentalsQuery);
  const payments = useQuery(paymentsQuery);
  const maintenances = useQuery(maintenancesQuery);
  const expenses = useQuery(expensesQuery);
  useQuery(customersQuery);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (vehicle.isLoading) return <div className="mx-auto max-w-5xl px-4 py-8"><Skeleton className="h-64 w-full rounded-md" /></div>;
  if (vehicle.isError || !vehicle.data) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8">
        <p className="text-destructive">Não foi possível carregar este veículo.</p>
        <Link to="/app/veiculos" className="mt-4 inline-flex items-center gap-2 text-sm text-brand"><ArrowLeft className="size-4" /> Voltar para carros</Link>
      </div>
    );
  }

  const car = vehicle.data;
  const photos = [...car.vehicle_photos].sort((a, b) => a.position - b.position);
  const carRentals = (rentals.data ?? []).filter((r) => r.vehicle_id === id);
  const carPayments = (payments.data ?? []).filter((p) => p.vehicle_id === id);
  const carMaintenances = (maintenances.data ?? []).filter((m) => m.vehicle_id === id);
  const carExpenses = (expenses.data ?? []).filter((e) => e.vehicle_id === id);

  function refresh() {
    client.invalidateQueries({ queryKey: ["vehicle", id] });
    client.invalidateQueries({ queryKey: ["vehicles"] });
  }

  async function saveField(values: Record<string, unknown>) {
    const { error } = await supabase.from("vehicles").update(values as never).eq("id", id);
    if (error) { toast.error(error.message); return; }
    refresh();
    toast.success("Veículo atualizado.");
  }

  async function handleFiles(fileList: FileList | null) {
    if (!fileList || !fileList.length) return;
    const remaining = MAX_PHOTOS - photos.length;
    if (remaining <= 0) { toast.error("Limite de 10 fotos atingido."); return; }
    const files = Array.from(fileList).slice(0, remaining);
    if (fileList.length > remaining) toast.message(`Só cabem mais ${remaining} foto(s). O restante foi ignorado.`);
    setUploading(true);
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) { toast.error("Sua sessão expirou."); setUploading(false); return; }
    let position = photos.length;
    for (const file of files) {
      try {
        const blob = await resizeImageToBlob(file);
        const path = `${auth.user.id}/${id}/${crypto.randomUUID()}.jpg`;
        const { error: uploadError } = await supabase.storage.from("vehicle-photos").upload(path, blob, { contentType: "image/jpeg" });
        if (uploadError) throw uploadError;
        const { data: pub } = supabase.storage.from("vehicle-photos").getPublicUrl(path);
        const { error: insertError } = await supabase.from("vehicle_photos").insert({
          user_id: auth.user.id,
          vehicle_id: id,
          url: pub.publicUrl,
          storage_path: path,
          is_primary: photos.length === 0 && position === photos.length,
          position,
        });
        if (insertError) throw insertError;
        position += 1;
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Falha ao enviar foto.");
      }
    }
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
    refresh();
  }

  async function setPrimary(photo: VehiclePhoto) {
    await supabase.from("vehicle_photos").update({ is_primary: false }).eq("vehicle_id", id);
    await supabase.from("vehicle_photos").update({ is_primary: true }).eq("id", photo.id);
    refresh();
  }

  async function deletePhoto(photo: VehiclePhoto) {
    if (photo.storage_path) await supabase.storage.from("vehicle-photos").remove([photo.storage_path]);
    const { error } = await supabase.from("vehicle_photos").delete().eq("id", photo.id);
    if (error) { toast.error(error.message); return; }
    toast.success("Foto removida.");
    refresh();
  }

  async function movePhoto(photo: VehiclePhoto, direction: -1 | 1) {
    const index = photos.findIndex((p) => p.id === photo.id);
    const target = photos[index + direction];
    if (!target) return;
    await supabase.from("vehicle_photos").update({ position: target.position }).eq("id", photo.id);
    await supabase.from("vehicle_photos").update({ position: photo.position }).eq("id", target.id);
    refresh();
  }

  async function deleteVehicle() {
    const { error } = await supabase.from("vehicles").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Veículo excluído.");
    client.invalidateQueries({ queryKey: ["vehicles"] });
    navigate({ to: "/app/veiculos" });
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:py-9">
      <Link to="/app/veiculos" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" /> Seus carros</Link>

      <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">{car.brand} {car.model}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{[car.year, car.plate, car.category].filter(Boolean).join(" • ") || "Sem detalhes adicionais"}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">{VEHICLE_STATUS_LABEL[car.status]}</Badge>
          <AlertDialog>
            <AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="text-destructive"><Trash2 className="size-4" /></Button></AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Excluir este veículo?</AlertDialogTitle>
                <AlertDialogDescription>Essa ação remove o carro, suas fotos e não pode ser desfeita.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={deleteVehicle}>Excluir</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <Tabs defaultValue="resumo" className="mt-6">
        <TabsList className="flex-wrap">
          <TabsTrigger value="resumo">Resumo</TabsTrigger>
          <TabsTrigger value="fotos">Fotos ({photos.length}/{MAX_PHOTOS})</TabsTrigger>
          <TabsTrigger value="aluguel">Aluguel</TabsTrigger>
          <TabsTrigger value="pagamentos">Pagamentos</TabsTrigger>
          <TabsTrigger value="manutencao">Manutenção</TabsTrigger>
          <TabsTrigger value="despesas">Despesas</TabsTrigger>
        </TabsList>

        <TabsContent value="resumo"><ResumoForm car={car} onSave={saveField} /></TabsContent>

        <TabsContent value="fotos">
          <div className="rounded-md border border-dashed border-border p-5">
            <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/webp" multiple className="hidden" onChange={(e) => handleFiles(e.target.files)} />
            <Button type="button" variant="outline" disabled={uploading || photos.length >= MAX_PHOTOS} onClick={() => fileInputRef.current?.click()}>
              {uploading ? <Loader2 className="size-4 animate-spin" /> : <ImagePlus className="size-4" />}
              {uploading ? "Enviando..." : "Adicionar fotos"}
            </Button>
            <p className="mt-2 text-xs text-muted-foreground">Até 10 fotos por veículo. JPG, PNG ou WebP.</p>
          </div>

          {photos.length === 0 ? <p className="mt-6 text-sm text-muted-foreground">Nenhuma foto cadastrada ainda.</p> : (
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {photos.map((photo, index) => (
                <div key={photo.id} className="overflow-hidden rounded-md border border-border">
                  <img src={photo.url} alt="" className="aspect-video w-full object-cover" />
                  <div className="flex items-center justify-between gap-1 border-t border-border bg-card p-2">
                    <div className="flex gap-1">
                      <Button type="button" size="icon" variant="ghost" disabled={index === 0} onClick={() => movePhoto(photo, -1)}>←</Button>
                      <Button type="button" size="icon" variant="ghost" disabled={index === photos.length - 1} onClick={() => movePhoto(photo, 1)}>→</Button>
                    </div>
                    <div className="flex gap-1">
                      <Button type="button" size="icon" variant="ghost" title="Definir como principal" onClick={() => setPrimary(photo)}><Star className={photo.is_primary ? "size-4 fill-brand text-brand" : "size-4"} /></Button>
                      <Button type="button" size="icon" variant="ghost" className="text-destructive" onClick={() => deletePhoto(photo)}><Trash2 className="size-4" /></Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="aluguel"><RelatedList emptyText="Nenhum aluguel para este carro." rows={carRentals} render={(r) => `${r.customers?.name ?? "Cliente"} • ${formatCurrency(r.amount_cents)} • desde ${formatDate(r.start_date)}`} /></TabsContent>
        <TabsContent value="pagamentos"><RelatedList emptyText="Nenhum pagamento para este carro." rows={carPayments} render={(p) => `${formatCurrency(p.amount_cents)} • vence ${formatDate(p.due_date)} • ${p.status}`} /></TabsContent>
        <TabsContent value="manutencao"><RelatedList emptyText="Nenhuma manutenção registrada." rows={carMaintenances} render={(m) => `${m.type} • ${formatDate(m.date)} • ${formatCurrency(m.cost_cents)}`} /></TabsContent>
        <TabsContent value="despesas"><RelatedList emptyText="Nenhuma despesa registrada." rows={carExpenses} render={(e) => `${e.category} • ${formatDate(e.date)} • ${formatCurrency(e.amount_cents)}`} /></TabsContent>
      </Tabs>
    </div>
  );
}

function RelatedList<T extends { id: string }>({ rows, render, emptyText }: { rows: T[]; render: (row: T) => string; emptyText: string }) {
  if (!rows.length) return <p className="mt-6 text-sm text-muted-foreground">{emptyText}</p>;
  return <div className="mt-5 divide-y divide-border rounded-md border border-border">{rows.map((row) => <div key={row.id} className="p-4 text-sm">{render(row)}</div>)}</div>;
}

function ResumoForm({ car, onSave }: { car: VehicleWithPhotos; onSave: (values: Record<string, unknown>) => Promise<void> }) {
  const [saving, setSaving] = useState(false);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    const f = new FormData(event.currentTarget);
    const value = (key: string) => String(f.get(key) ?? "").trim();
    await onSave({
      brand: value("brand"),
      model: value("model"),
      year: value("year") ? Number(value("year")) : null,
      plate: value("plate") || null,
      color: value("color") || null,
      category: value("category") || null,
      mileage: value("mileage") ? Number(value("mileage")) : null,
      rental_price_cents: parseCurrencyToCents(value("price")),
      rental_periodicity: value("periodicity"),
      status: value("status"),
      description: value("description") || null,
      show_in_catalog: f.get("show_in_catalog") === "on",
    });
    setSaving(false);
  }
  return (
    <form onSubmit={submit} className="mt-5 space-y-4 rounded-md border border-border bg-card p-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Marca" htmlFor="brand"><Input id="brand" name="brand" defaultValue={car.brand} required /></Field>
        <Field label="Modelo" htmlFor="model"><Input id="model" name="model" defaultValue={car.model} required /></Field>
        <Field label="Ano" htmlFor="year"><Input id="year" name="year" type="number" defaultValue={car.year ?? ""} /></Field>
        <Field label="Placa" htmlFor="plate"><Input id="plate" name="plate" defaultValue={car.plate ?? ""} /></Field>
        <Field label="Cor" htmlFor="color"><Input id="color" name="color" defaultValue={car.color ?? ""} /></Field>
        <Field label="Categoria" htmlFor="category"><Input id="category" name="category" defaultValue={car.category ?? ""} /></Field>
        <Field label="Quilometragem" htmlFor="mileage"><Input id="mileage" name="mileage" type="number" defaultValue={car.mileage ?? ""} /></Field>
        <Field label="Valor do aluguel" htmlFor="price"><Input id="price" name="price" defaultValue={(car.rental_price_cents / 100).toFixed(2)} /></Field>
        <Field label="Periodicidade" htmlFor="periodicity">
          <select id="periodicity" name="periodicity" defaultValue={car.rental_periodicity} className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm">
            {Object.entries(PERIODICITY_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </Field>
        <Field label="Status" htmlFor="status">
          <select id="status" name="status" defaultValue={car.status} className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm">
            {Object.entries(VEHICLE_STATUS_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </Field>
      </div>
      <Field label="Descrição" htmlFor="description"><Textarea id="description" name="description" defaultValue={car.description ?? ""} /></Field>
      <label className="flex items-center gap-2 text-sm text-muted-foreground"><input type="checkbox" name="show_in_catalog" defaultChecked={car.show_in_catalog} /> Mostrar este carro no meu catálogo público</label>
      <Button type="submit" disabled={saving}>{saving ? "Salvando..." : "Salvar alterações"}</Button>
    </form>
  );
}