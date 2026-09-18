import "server-only";

import * as XLSX from "xlsx";

export interface ParsedImportRow {
  tracking_number: string;
  contact: string;
  descripcion: string | null;
  fecha_recepcion: string | null;
  vuelo: string | null;
}

export interface ParseResult {
  rows: ParsedImportRow[];
  emptyTracking: number;
  duplicates: number;
}

const MAX_IMPORT_ROWS = 5000;
const FUTURE_SLACK_MS = 24 * 60 * 60 * 1000;

export function cleanText(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

export function normalizeTracking(value: unknown): string {
  let raw = "";
  if (typeof value === "number" && Number.isFinite(value)) {
    raw = value.toFixed(0);
  } else if (typeof value === "string") {
    raw = value.trim();
  } else {
    return "";
  }
  if (/^[\d.]+e[+-]?\d+$/i.test(raw)) {
    const num = Number(raw);
    if (Number.isFinite(num)) raw = num.toFixed(0);
  }
  let out = raw.replace(/\s+/g, "").toUpperCase();
  out = out.replace(/\.0+$/, "");
  return out;
}

export function toTitleCase(value: string): string {
  return value
    .toLowerCase()
    .replace(/(^|[\s'-])(\p{L})/gu, (_m, sep: string, ch: string) => sep + ch.toUpperCase());
}

function toDateString(d: Date): string | null {
  if (Number.isNaN(d.getTime())) return null;
  if (d.getTime() > Date.now() + FUTURE_SLACK_MS) return null;
  return d.toISOString().slice(0, 10);
}

export function parseFechaRecepcion(value: unknown): string | null {
  if (value instanceof Date) return toDateString(value);
  if (typeof value === "number") {
    if (value >= 40000 && value <= 80000) {
      const d = new Date(Math.round((value - 25569) * 86400 * 1000));
      return toDateString(d);
    }
    return null;
  }
  if (typeof value === "string") {
    const s = value.trim();
    if (!s) return null;
    return toDateString(new Date(s));
  }
  return null;
}

export function cleanVuelo(value: unknown): string | null {
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return null;
    return value.toISOString().slice(0, 10);
  }
  const raw = cleanText(String(value ?? ""));
  if (!raw) return null;
  return raw.replace(/\s+-\s+\d{4}\s*$/u, "").trim();
}

export function parseXlsx(buffer: ArrayBuffer): ParseResult {
  const empty: ParseResult = { rows: [], emptyTracking: 0, duplicates: 0 };

  let wb: XLSX.WorkBook;
  try {
    wb = XLSX.read(new Uint8Array(buffer), { type: "array", cellDates: true });
  } catch {
    return empty;
  }

  if (!wb.SheetNames.length) return empty;
  const ws = wb.Sheets[wb.SheetNames[0]];
  if (!ws) return empty;

  const aoa = XLSX.utils.sheet_to_json<unknown[]>(ws, {
    header: 1,
    defval: null,
    raw: true,
  });
  if (!Array.isArray(aoa) || aoa.length === 0) return empty;

  let headerIdx = -1;
  const colByHeader: Record<string, number> = {};
  for (let i = 0; i < aoa.length; i++) {
    const row = aoa[i];
    if (!Array.isArray(row)) continue;
    for (let c = 0; c < row.length; c++) {
      const h = String(row[c] ?? "")
        .trim()
        .toLowerCase();
      if (h.includes("tracking")) colByHeader.tracking = c;
      else if (h.includes("contact")) colByHeader.contact = c;
      else if (h.includes("descripc")) colByHeader.descripcion = c;
      else if (h.includes("recibid")) colByHeader.recibido = c;
      else if (h.includes("vuelo")) colByHeader.vuelo = c;
    }
    if (colByHeader.tracking !== undefined) {
      headerIdx = i;
      break;
    }
  }
  if (headerIdx === -1) return empty;

  const seen = new Set<string>();
  const rows: ParsedImportRow[] = [];
  let emptyTracking = 0;
  let duplicates = 0;

  for (let i = headerIdx + 1; i < aoa.length; i++) {
    if (rows.length >= MAX_IMPORT_ROWS) break;
    const row = aoa[i];
    if (!Array.isArray(row)) continue;
    if (row.every((cell) => cell === null || cell === undefined || String(cell).trim() === "")) {
      continue;
    }

    const tracking = normalizeTracking(row[colByHeader.tracking]);
    if (!tracking) {
      emptyTracking++;
      continue;
    }
    if (seen.has(tracking)) {
      duplicates++;
      continue;
    }
    seen.add(tracking);

    rows.push({
      tracking_number: tracking,
      contact: cleanText(String(row[colByHeader.contact] ?? "")),
      descripcion: cleanText(String(row[colByHeader.descripcion] ?? "")) || null,
      fecha_recepcion: parseFechaRecepcion(row[colByHeader.recibido]),
      vuelo: cleanVuelo(row[colByHeader.vuelo]),
    });
  }

  return { rows, emptyTracking, duplicates };
}