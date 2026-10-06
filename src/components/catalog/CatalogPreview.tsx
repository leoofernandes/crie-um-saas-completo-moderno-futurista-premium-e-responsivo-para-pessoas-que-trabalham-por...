import { useState } from "react";
import { Monitor, Smartphone, Tablet } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PublicSite } from "@/lib/queries";
import type { CatalogVehicle } from "./catalog-utils";
import { PublicCatalogView } from "./PublicCatalogView";

export function CatalogPreview({ site, vehicles }: { site: PublicSite; vehicles: CatalogVehicle[] }) {
  const [device, setDevice] = useState("desktop");
  return <section className="min-w-0"><div className="mb-4 flex items-center justify-between gap-4"><h2 className="text-lg font-semibold">Prévia do catálogo</h2><div className="flex gap-1" role="group" aria-label="Tamanho da prévia">{[{ id: "desktop", label: "Computador", icon: Monitor }, { id: "tablet", label: "Tablet", icon: Tablet }, { id: "mobile", label: "Celular", icon: Smartphone }].map(({id,label,icon:Icon}) => <Button key={id} type="button" size="icon" variant={device === id ? "secondary" : "ghost"} title={label} aria-label={label} aria-pressed={device === id} onClick={() => setDevice(id)}><Icon className="size-4"/></Button>)}</div></div><div className={`catalog-editor-preview mx-auto h-[640px] max-w-full overflow-auto rounded-lg border border-border ${device === "mobile" ? "w-[390px]" : device === "tablet" ? "w-[768px]" : "w-full"}`}><PublicCatalogView site={site} vehicles={vehicles} preview/></div></section>;
}