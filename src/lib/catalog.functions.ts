import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { catalogPublicClient, PUBLIC_VEHICLE_COLUMNS } from "./catalog.server";

export const getCatalogOrigin = createServerFn({ method: "GET" }).handler(async () => {
  const { getRequestUrl } = await import("@tanstack/react-start/server");
  return getRequestUrl({ xForwardedHost: true, xForwardedProto: true }).origin;
});

export const getPublicCatalog = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => z.object({ slug: z.string().min(3).max(40) }).parse(input))
  .handler(async ({ data }) => {
    const client = catalogPublicClient();
    const { data: site, error } = await client.from("public_sites").select("*").eq("slug", data.slug).eq("is_published", true).maybeSingle();
    if (error) throw new Error("Não foi possível carregar o catálogo.");
    if (!site) return { site: null, vehicles: [] };
    const result = await client.from("vehicles").select(PUBLIC_VEHICLE_COLUMNS).eq("user_id", site.user_id).eq("show_in_catalog", true).neq("status", "inativo").order("catalog_order").order("id");
    if (result.error) throw new Error("Não foi possível carregar os veículos.");
    const vehicles = result.data.filter(car => !site.hide_unavailable || car.status === "disponivel").map(car => ({ ...car, mileage: site.show_mileage ? car.mileage : null, color: site.show_color ? car.color : null }));
    return { site, vehicles };
  });

export const sendCatalogInterest = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => z.object({
    siteId: z.string().uuid(), vehicleId: z.string().uuid(),
    name: z.string().trim().min(2).max(120),
    whatsapp: z.string().trim().max(30).refine(value => { const n = value.replace(/\D/g, "").length; return n >= 10 && n <= 15; }),
    message: z.string().trim().max(2000).optional(),
    website: z.string().max(0).optional(),
  }).parse(input))
  .handler(async ({ data }) => {
    const client = catalogPublicClient();
    const site = await client.from("public_sites").select("id,user_id").eq("id", data.siteId).eq("is_published", true).maybeSingle();
    if (site.error || !site.data) throw new Error("Este catálogo não está disponível.");
    const car = await client.from("vehicles").select("id").eq("id", data.vehicleId).eq("user_id", site.data.user_id).eq("show_in_catalog", true).neq("status", "inativo").maybeSingle();
    if (car.error || !car.data) throw new Error("Este veículo não está disponível no catálogo.");
    const result = await client.from("site_leads").insert({ user_id: site.data.user_id, site_id: site.data.id, vehicle_id: car.data.id, name: data.name, whatsapp: data.whatsapp, message: data.message || null });
    if (result.error) throw new Error("Não foi possível enviar seu interesse. Tente novamente.");
    return { success: true };
  });