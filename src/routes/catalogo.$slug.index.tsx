import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { catalogQuery } from "@/lib/catalog-queries";
import { catalogHead } from "@/lib/catalog-head";
import { PublicCatalogView } from "@/components/catalog/PublicCatalogView";
import { CatalogError, CatalogNotFound } from "@/components/catalog/CatalogState";
export const Route = createFileRoute("/catalogo/$slug/")({
  loader: async ({ params, context, location }) => { const data = await context.queryClient.ensureQueryData(catalogQuery(params.slug)); return { ...data, origin: new URL(location.href, "https://id-preview--1dec846f-466e-46b4-bef3-01fb22e5e54d.lovable.app").origin }; },
  head: ({ loaderData }) => catalogHead(loaderData?.site, loaderData?.origin || ""),
  component: CatalogPage,
  errorComponent: CatalogError,
  notFoundComponent: CatalogNotFound,
});
function CatalogPage() { const { slug } = Route.useParams(); const { data } = useSuspenseQuery(catalogQuery(slug)); return data.site ? <PublicCatalogView site={data.site} vehicles={data.vehicles}/> : <CatalogNotFound/>; }
