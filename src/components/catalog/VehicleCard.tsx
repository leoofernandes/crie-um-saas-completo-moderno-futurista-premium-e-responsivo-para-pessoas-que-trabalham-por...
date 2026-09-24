import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Car } from "lucide-react";
import {
  PERIOD_UNIT,
  formatPrice,
  sortedPhotos,
  statusInfo,
  transmissionLabel,
  type CatalogVehicle,
} from "./catalog-utils";

export function VehicleCard({
  car,
  slug,
  accent,
  priority = false,
}: {
  car: CatalogVehicle;
  slug: string;
  accent: string;
  priority?: boolean;
}) {
  const photos = sortedPhotos(car);
  const cover = photos[0];
  const second = photos[1];
  const status = statusInfo(car.status);
  const unit = PERIOD_UNIT[car.rental_periodicity] ?? "período";

  const specs = [
    { label: "Câmbio", value: transmissionLabel(car.transmission) },
    { label: "Combustível", value: car.fuel_type },
    { label: "Km", value: car.mileage != null ? car.mileage.toLocaleString("pt-BR") : null },
  ].filter((spec): spec is { label: string; value: string } => Boolean(spec.value));

  return (
    <Link
      to="/catalogo/$slug/veiculo/$id"
      params={{ slug, id: car.id }}
      className="group flex flex-col overflow-hidden rounded-2xl border border-(--c-line) bg-(--c-raise) outline-none transition-colors hover:border-(--c-line-strong) focus-visible:ring-2 focus-visible:ring-(--c-accent)"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-(--c-raise2)">
        {cover ? (
          <>
            <img
              src={cover.url}
              alt={`${car.brand} ${car.model}`}
              loading={priority ? "eager" : "lazy"}
              decoding="async"
              className={`absolute inset-0 size-full object-cover transition-opacity duration-500 ${
                second ? "group-hover:opacity-0" : ""
              } ${status.available ? "" : "grayscale-[0.55] brightness-90"}`}
            />
            {second && (
              <img
                src={second.url}
                alt=""
                loading="lazy"
                decoding="async"
                className={`absolute inset-0 size-full object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100 ${
                  status.available ? "" : "grayscale-[0.55] brightness-90"
                }`}
              />
            )}
          </>
        ) : (
          <div className="grid size-full place-items-center text-(--c-mute)">
            <Car className="size-10" strokeWidth={1.25} />
          </div>
        )}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/45 to-transparent" />

        <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1 text-xs font-medium text-white backdrop-blur-md">
          <span
            className="size-1.5 rounded-full"
            style={{ background: status.available ? accent : "#8b8d94" }}
            aria-hidden
          />
          {status.label}
        </span>
        {photos.length > 1 && (
          <span className="absolute bottom-3 right-3 rounded-full bg-black/60 px-2.5 py-1 text-xs text-white/90 backdrop-blur-md">
            {photos.length} fotos
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <p className="text-sm text-(--c-mute)">{car.brand}</p>
        <h3 className="catalog-serif mt-0.5 text-2xl font-semibold leading-tight text-(--c-text)">
          {car.model}
        </h3>
        <p className="mt-1 text-sm text-(--c-mute)">
          {[car.year, car.category].filter(Boolean).join(" · ")}
        </p>

        {specs.length > 0 && (
          <dl className="mt-5 flex border-y border-(--c-line) py-3">
            {specs.map((spec, index) => (
              <div
                key={spec.label}
                className={`min-w-0 flex-1 ${index > 0 ? "border-l border-(--c-line) pl-4" : "pr-4"}`}
              >
                <dt className="text-xs text-(--c-mute)">{spec.label}</dt>
                <dd className="mt-0.5 truncate text-sm font-medium text-(--c-text)">{spec.value}</dd>
              </div>
            ))}
          </dl>
        )}

        <div className="mt-auto flex items-end justify-between gap-3 pt-5">
          <div>
            <p className="text-2xl font-semibold tracking-tight text-(--c-text)">
              {formatPrice(car.rental_price_cents)}
            </p>
            <p className="text-sm text-(--c-mute)">por {unit}</p>
          </div>
          <span
            className="inline-flex items-center gap-1.5 rounded-full border border-(--c-line-strong) px-4 py-2 text-sm font-medium text-(--c-text) transition-colors group-hover:border-transparent group-hover:bg-(--c-accent) group-hover:text-(--c-on-accent)"
          >
            Ver detalhes
            <ArrowUpRight className="size-4" />
          </span>
        </div>
      </div>
    </Link>
  );
}
