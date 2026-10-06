import { queryOptions } from "@tanstack/react-query";
import { getPublicCatalog } from "./catalog.functions";
import type { CatalogVehicle } from "@/components/catalog/catalog-utils";

export const catalogQuery = (slug: string) => queryOptions({
  queryKey: ["catalog", slug],
  queryFn: async () => {
    const result = await getPublicCatalog({ data: { slug } });
    return { site: result.site, vehicles: result.vehicles as unknown as CatalogVehicle[] };
  },
  staleTime: 0,
  refetchInterval: 15000,
  refetchOnWindowFocus: true,
});