import type { Vehicle, VehiclePhoto } from "@/lib/queries";

export type CatalogVehicle = Vehicle & { vehicle_photos: VehiclePhoto[] };

export const DEFAULT_ACCENT = "#22c55e";
export const MAX_PHOTOS = 10;
export const FONT_HREF =
  "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600;700&display=swap";

export const TRANSMISSION_LABEL: Record<string, string> = {
  automatico: "Automático",
  manual: "Manual",
};

export const PERIOD_UNIT: Record<string, string> = {
  semanal: "semana",
  quinzenal: "quinzena",
  mensal: "mês",
  personalizada: "período",
};

/** Rótulos públicos: o cliente final nunca vê termos internos como "alugado". */
export const PUBLIC_STATUS: Record<string, { label: string; available: boolean }> = {
  disponivel: { label: "Disponível", available: true },
  alugado: { label: "Indisponível", available: false },
  reservado: { label: "Reservado", available: false },
  manutencao: { label: "Em manutenção", available: false },
};

export function statusInfo(status: string) {
  return PUBLIC_STATUS[status] ?? { label: "Indisponível", available: false };
}

export function safeAccent(value: string | null | undefined): string {
  return value && /^#[0-9a-fA-F]{6}$/.test(value) ? value : DEFAULT_ACCENT;
}

/** Escolhe texto preto ou branco conforme o contraste com a cor de destaque. */
export function readableOn(hex: string): string {
  const channel = (start: number) => {
    const c = parseInt(hex.slice(start, start + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };
  const luminance = 0.2126 * channel(1) + 0.7152 * channel(3) + 0.0722 * channel(5);
  const contrastWithBlack = (luminance + 0.05) / 0.05;
  const contrastWithWhite = 1.05 / (luminance + 0.05);
  return contrastWithBlack >= contrastWithWhite ? "#0b0b0c" : "#ffffff";
}

export function whatsappLink(number: string | null | undefined, text: string): string | null {
  if (!number) return null;
  const digits = number.replace(/\D/g, "");
  if (!digits) return null;
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}

export function instagramHandle(value: string | null | undefined): string | null {
  const handle = (value ?? "").trim().replace(/^https?:\/\/(www\.)?instagram\.com\//i, "").replace(/^@/, "").replace(/\/$/, "");
  return handle || null;
}

export function sortedPhotos(car: CatalogVehicle): VehiclePhoto[] {
  return [...car.vehicle_photos]
    .sort((a, b) => Number(b.is_primary) - Number(a.is_primary) || a.position - b.position)
    .slice(0, MAX_PHOTOS);
}

export function formatPrice(cents: number): string {
  const value = cents / 100;
  if (cents % 100 === 0) return `R$ ${value.toLocaleString("pt-BR")}`;
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function vehicleTitle(car: Pick<Vehicle, "brand" | "model" | "year">): string {
  return [car.brand, car.model, car.year].filter(Boolean).join(" ");
}

export function transmissionLabel(value: string | null | undefined): string | null {
  if (!value) return null;
  return TRANSMISSION_LABEL[value] ?? value;
}
