import { useCallback, useEffect, useRef, useState } from "react";
import { Car, ChevronLeft, ChevronRight, Expand, X } from "lucide-react";
import type { VehiclePhoto } from "@/lib/queries";

export function VehicleGallery({ photos, alt }: { photos: VehiclePhoto[]; alt: string }) {
  const [index, setIndex] = useState(0);
  const [open, setOpen] = useState(false);
  const touchStart = useRef<number | null>(null);
  const closeRef = useRef<HTMLButtonElement | null>(null);
  const total = photos.length;

  const go = useCallback((step: number) => setIndex((i) => (i + step + total) % total), [total]);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
      if (event.key === "ArrowRight") go(1);
      if (event.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, go]);

  const onTouchEnd = (clientX: number) => {
    if (touchStart.current == null || total < 2) return;
    const delta = clientX - touchStart.current;
    touchStart.current = null;
    if (Math.abs(delta) > 40) go(delta < 0 ? 1 : -1);
  };

  const current = photos[index];

  if (!current) {
    return (
      <div className="grid aspect-[16/10] w-full place-items-center rounded-2xl border border-(--c-line) bg-(--c-raise) text-(--c-mute)">
        <div className="text-center">
          <Car className="mx-auto size-10" strokeWidth={1.25} />
          <p className="mt-3 text-sm">Fotos em breve</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div
        className="group relative aspect-[16/10] w-full overflow-hidden rounded-2xl border border-(--c-line) bg-(--c-raise)"
        onTouchStart={(event) => {
          touchStart.current = event.touches[0]?.clientX ?? null;
        }}
        onTouchEnd={(event) => onTouchEnd(event.changedTouches[0]?.clientX ?? 0)}
      >
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="block size-full cursor-zoom-in outline-none focus-visible:ring-2 focus-visible:ring-(--c-accent)"
          aria-label="Ampliar foto"
        >
          <img
            key={current.id}
            src={current.url}
            alt={alt}
            decoding="async"
            fetchPriority={index === 0 ? "high" : "auto"}
            className="size-full object-cover"
          />
        </button>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-black/50 to-transparent" />

        <span className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1 text-xs text-white backdrop-blur-md">
          <Expand className="size-3.5" /> {index + 1} / {total}
        </span>

        {total > 1 && (
          <div className="absolute bottom-3 right-3 flex gap-2">
            <ArrowButton label="Foto anterior" onClick={() => go(-1)}>
              <ChevronLeft className="size-5" />
            </ArrowButton>
            <ArrowButton label="Próxima foto" onClick={() => go(1)}>
              <ChevronRight className="size-5" />
            </ArrowButton>
          </div>
        )}
      </div>

      {total > 1 && (
        <div className="catalog-scroll mt-3 flex gap-2 overflow-x-auto pb-1">
          {photos.map((photo, i) => (
            <button
              key={photo.id}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Ver foto ${i + 1}`}
              aria-current={i === index}
              className={`relative h-16 w-24 shrink-0 overflow-hidden rounded-lg border-2 outline-none transition-opacity focus-visible:ring-2 focus-visible:ring-(--c-accent) sm:h-20 sm:w-28 ${
                i === index ? "border-(--c-accent)" : "border-transparent opacity-60 hover:opacity-100"
              }`}
            >
              <img src={photo.url} alt="" loading="lazy" decoding="async" className="size-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={alt}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95"
          onClick={() => setOpen(false)}
          onTouchStart={(event) => {
            touchStart.current = event.touches[0]?.clientX ?? null;
          }}
          onTouchEnd={(event) => onTouchEnd(event.changedTouches[0]?.clientX ?? 0)}
        >
          <button
            ref={closeRef}
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Fechar"
            className="absolute right-4 top-4 grid size-11 place-items-center rounded-full bg-white/10 text-white outline-none transition-colors hover:bg-white/20 focus-visible:ring-2 focus-visible:ring-white"
          >
            <X className="size-5" />
          </button>
          <img
            src={current.url}
            alt={alt}
            className="max-h-[86vh] max-w-[94vw] select-none object-contain"
            onClick={(event) => event.stopPropagation()}
          />
          {total > 1 && (
            <>
              <button
                type="button"
                aria-label="Foto anterior"
                onClick={(event) => {
                  event.stopPropagation();
                  go(-1);
                }}
                className="absolute left-3 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
              >
                <ChevronLeft className="size-6" />
              </button>
              <button
                type="button"
                aria-label="Próxima foto"
                onClick={(event) => {
                  event.stopPropagation();
                  go(1);
                }}
                className="absolute right-3 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
              >
                <ChevronRight className="size-6" />
              </button>
            </>
          )}
          <p className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-3 py-1 text-sm text-white">
            {index + 1} / {total}
          </p>
        </div>
      )}
    </div>
  );
}

function ArrowButton({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="grid size-10 place-items-center rounded-full bg-black/60 text-white backdrop-blur-md outline-none transition-colors hover:bg-black/80 focus-visible:ring-2 focus-visible:ring-(--c-accent)"
    >
      {children}
    </button>
  );
}
