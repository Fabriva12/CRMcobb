export function formatCurrency(value: number | string | null): string {
  const numeric = typeof value === "string" ? Number(value) : value;
  if (numeric === null || Number.isNaN(numeric)) return "-";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(numeric);
}

export function formatCurrencyCRC(value: number | string | null): string {
  const numeric = typeof value === "string" ? Number(value) : value;
  if (numeric === null || Number.isNaN(numeric)) return "-";
  return new Intl.NumberFormat("es-CR", {
    style: "currency",
    currency: "CRC",
    maximumFractionDigits: 2,
  }).format(numeric);
}

export function formatWeight(value: number | string | null): string {
  const numeric = typeof value === "string" ? Number(value) : value;
  if (numeric === null || Number.isNaN(numeric)) return "-";
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2,
  }).format(numeric);
}

export function formatDate(value: string | null): string {
  if (!value) return "-";
  return new Intl.DateTimeFormat("es", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function formatDateShort(value: string | null): string {
  if (!value) return "-";
  return new Intl.DateTimeFormat("es", {
    dateStyle: "medium",
  }).format(new Date(value));
}

export function formatDateNumeric(value: string | null): string {
  if (!value) return "-";
  return new Intl.DateTimeFormat("es", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

export function normalizeSearch(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}