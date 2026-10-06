import type { PublicSite } from "@/lib/queries";
import type { CatalogVehicle } from "@/components/catalog/catalog-utils";
import { sortedPhotos, vehicleTitle } from "@/components/catalog/catalog-utils";

export function catalogHead(site: PublicSite | null | undefined, origin: string, car?: CatalogVehicle | null) {
  const found = Boolean(site && (car !== null));
  const title = !found ? "Catálogo indisponível — movvia" : car ? `${vehicleTitle(car)} | ${site?.display_name}` : `${site?.display_name} | Aluguel de carros`;
  const description = car?.description || site?.description || site?.hero_subtitle || "Confira os veículos disponíveis para aluguel.";
  const image = car ? sortedPhotos(car)[0]?.url || site?.logo_url : site?.banner_url || site?.logo_url;
  const absoluteImage = image && /^https:\/\//.test(image) ? image : null;
  const url = site ? `${origin}/catalogo/${site.slug}${car ? `/veiculo/${car.id}` : ""}` : null;
  return {
    meta: [
      { title }, { name: "description", content: description },
      { property: "og:title", content: title }, { property: "og:description", content: description },
      { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: found ? "index,follow" : "noindex,follow" },
      ...(url ? [{ property: "og:url", content: url }] : []),
      ...(absoluteImage ? [{ property: "og:image", content: absoluteImage }, { name: "twitter:image", content: absoluteImage }] : []),
    ],
    links: [...(url ? [{ rel: "canonical", href: url }] : []), ...(site?.logo_url ? [{ rel: "icon", href: site.logo_url }] : [])],
  };
}