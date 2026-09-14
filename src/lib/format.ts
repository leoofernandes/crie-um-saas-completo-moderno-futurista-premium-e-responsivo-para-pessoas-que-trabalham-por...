export function formatCurrency(cents: number | null | undefined): string {
  const value = (cents ?? 0) / 100;
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function formatCurrencyShort(cents: number | null | undefined): string {
  const value = (cents ?? 0) / 100;
  if (value >= 1000) return `R$ ${(value / 1000).toFixed(1).replace(".", ",")}k`;
  return formatCurrency(cents);
}

export function parseCurrencyToCents(input: string): number {
  const digits = input.replace(/\D/g, "");
  return digits ? parseInt(digits, 10) : 0;
}

export function maskCurrencyInput(input: string): string {
  const cents = parseCurrencyToCents(input);
  return (cents / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function formatDate(value: string | Date | null | undefined): string {
  if (!value) return "—";
  const date = typeof value === "string" ? new Date(`${value.length <= 10 ? `${value}T12:00:00` : value}`) : value;
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("pt-BR");
}

export function daysUntil(value: string | null | undefined): number | null {
  if (!value) return null;
  const date = new Date(`${value.length <= 10 ? `${value}T12:00:00` : value}`);
  if (Number.isNaN(date.getTime())) return null;
  return Math.ceil((date.getTime() - Date.now()) / 86_400_000);
}

export function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Bom dia";
  if (hour < 18) return "Boa tarde";
  return "Boa noite";
}

export function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

export function onlyDigits(input: string): string {
  return input.replace(/\D/g, "");
}

export function whatsappLink(number: string | null | undefined, message?: string): string {
  const digits = onlyDigits(number ?? "");
  const full = digits.length <= 11 ? `55${digits}` : digits;
  const text = message ? `?text=${encodeURIComponent(message)}` : "";
  return `https://wa.me/${full}${text}`;
}
