"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { Button, Card, ErrorMessage, Input } from "@/components/ui";
import {
  confirmImportAction,
  previewImportAction,
  type ConfirmResult,
  type PreviewResult,
} from "@/lib/actions/import";

const CREATE = "__create__";
const UNSET = "";

interface RowSelection {
  clientId: string;
  clientName: string;
}

interface ImportXlsxFormProps {
  clients: { id: string; nombre: string; telefono?: string | null }[];
}

function formatFecha(value: string | null): string {
  if (!value) return "—";
  const [y, m, d] = value.split("-");
  return `${d}/${m}/${y}`;
}

export function ImportXlsxForm({ clients }: ImportXlsxFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<PreviewResult | null>(null);
  const [selection, setSelection] = useState<Record<string, RowSelection>>({});
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ConfirmResult | null>(null);
  const [isParsing, startParsing] = useTransition();
  const [isImporting, startImporting] = useTransition();

  const baseClients = preview?.clients ?? clients;
  const rows = preview?.rows ?? [];

  function reset() {
    setPreview(null);
    setSelection({});
    setError(null);
    setResult(null);
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    setFile(e.target.files?.[0] ?? null);
    reset();
  }

  function handleAnalyze() {
    if (!file) {
      setError("Seleccioná un archivo .xlsx para analizar.");
      return;
    }
    setError(null);
    setResult(null);
    const fd = new FormData();
    fd.append("file", file);
    startParsing(async () => {
      const res = await previewImportAction(fd);
      if (res.error) {
        setError(res.error);
        setPreview(null);
        setSelection({});
        return;
      }
      setPreview(res);
      const sel: Record<string, RowSelection> = {};
      for (const r of res.rows) {
        sel[r.tracking_number] = r.clientId
          ? { clientId: r.clientId, clientName: r.suggestedName }
          : { clientId: CREATE, clientName: r.suggestedName };
      }
      setSelection(sel);
    });
  }

  function setRow(tracking: string, clientId: string) {
    setSelection((prev) => {
      const current = prev[tracking] ?? { clientId: UNSET, clientName: "" };
      return { ...prev, [tracking]: { ...current, clientId } };
    });
  }

  function setRowName(tracking: string, clientName: string) {
    setSelection((prev) => ({
      ...prev,
      [tracking]: { clientId: CREATE, clientName },
    }));
  }

  const counts = useMemo(() => {
    const rows = preview?.rows ?? [];
    let nuevo = 0;
    let existente = 0;
    let sinAsignar = 0;
    for (const r of rows) {
      const id = selection[r.tracking_number]?.clientId ?? UNSET;
      if (id === UNSET) sinAsignar++;
      else if (id === CREATE) nuevo++;
      else existente++;
    }
    return { nuevo, existente, sinAsignar };
  }, [preview, selection]);

  const pending = isParsing || isImporting;

  function handleImport() {
    if (!preview || rows.length === 0 || pending) return;
    setError(null);
    startImporting(async () => {
      const payload = rows.map((r) => {
        const s = selection[r.tracking_number];
        const clientId =
          s?.clientId && s.clientId !== CREATE && s.clientId !== UNSET
            ? s.clientId
            : null;
        const clientName =
          s?.clientId === CREATE
            ? (s.clientName?.trim() || r.suggestedName) || null
            : null;
        return {
          tracking_number: r.tracking_number,
          descripcion: r.descripcion,
          fecha_recepcion: r.fecha_recepcion,
          clientId,
          clientName,
        };
      });
      const res = await confirmImportAction(payload);
      if (res.error) {
        setError(res.error);
        return;
      }
      setResult(res);
      setPreview(null);
      setSelection({});
    });
  }

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex-1">
            <label className="mb-1 block text-sm font-medium text-brand-700">
              Archivo .xlsx del reporte semanal
            </label>
            <Input
              type="file"
              accept=".xlsx"
              onChange={handleFile}
              disabled={pending}
            />
            <p className="mt-1 text-xs text-gray-400">
              Se detecta automáticamente la columna de tracking y el cliente
              (Contact Name).
            </p>
          </div>
          <Button type="button" onClick={handleAnalyze} disabled={pending || !file}>
            {isParsing ? "Analizando..." : "Analizar archivo"}
          </Button>
        </div>
        {(preview?.emptyTracking ?? 0) > 0 && (
          <p className="mt-2 text-xs text-amber-600">
            {preview?.emptyTracking} fila(s) sin número de seguimiento fueron
            ignoradas.
          </p>
        )}
        {(preview?.duplicates ?? 0) > 0 && (
          <p className="mt-1 text-xs text-amber-600">
            {preview?.duplicates} paquete(s) repetido(s) dentro del archivo fueron
            ignorados.
          </p>
        )}
        <ErrorMessage message={error ?? undefined} />
      </Card>

      {result && (
        <Card className="border-emerald-300 bg-emerald-50/40">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <p className="font-semibold text-emerald-800">
                Importación completada: {result.inserted} paquete(s)
                {result.skipped > 0 && `, ${result.skipped} omitido(s) por duplicado`}.
              </p>
              {result.listaNombre && (
                <p className="text-sm text-gray-600">
                  Lista creada: <span className="font-medium">{result.listaNombre}</span>
                </p>
              )}
              {result.clientsCreated > 0 && (
                <p className="text-sm text-gray-600">
                  {result.clientsCreated} cliente(s) nuevos creados.
                </p>
              )}
            </div>
            <Link href="/paquetes">
              <Button>Ver paquetes</Button>
            </Link>
          </div>
        </Card>
      )}

      {preview && rows.length > 0 && (
        <>
          <Card>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm font-medium text-gray-700">
                {rows.length} paquete(s) detectados ·{" "}
                <span className="text-emerald-700">
                  {counts.nuevo} a crear cliente
                </span>
                {counts.existente > 0 && (
                  <>
                    {" · "}
                    <span className="text-brand-700">{counts.existente} con cliente</span>
                  </>
                )}
                {counts.sinAsignar > 0 && (
                  <>
                    {" · "}
                    <span className="text-gray-400">{counts.sinAsignar} sin asignar</span>
                  </>
                )}
              </p>
              <Button
                type="button"
                onClick={handleImport}
                disabled={pending || rows.length === 0}
              >
                {isImporting ? "Importando..." : `Importar ${rows.length} paquete(s)`}
              </Button>
            </div>
            <p className="mt-2 text-xs text-gray-400">
              Revisá la asignación de cada paquete antes de importar. Los clientes
              marcados como &quot;Crear&quot; se dan de alta automáticamente.
            </p>
          </Card>

          <Card className="overflow-hidden p-0">
            <div className="max-h-[32rem] overflow-auto">
              <table className="w-full text-left text-sm">
                <thead className="sticky top-0 bg-white">
                  <tr className="border-b border-brand-200 text-xs uppercase tracking-wide text-brand-700">
                    <th className="whitespace-nowrap px-4 py-3 font-semibold">Tracking</th>
                    <th className="min-w-56 px-4 py-3 font-semibold">Cliente</th>
                    <th className="hidden px-4 py-3 font-semibold sm:table-cell">
                      Descripción
                    </th>
                    <th className="hidden whitespace-nowrap px-4 py-3 font-semibold sm:table-cell">
                      Recibido
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, i) => {
                    const sel = selection[r.tracking_number];
                    const clientId = sel?.clientId ?? UNSET;
                    const clientName = sel?.clientName ?? "";
                    return (
                      <tr
                        key={r.tracking_number}
                        className="border-b border-gray-100 last:border-0 align-top"
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-start gap-2">
                            <span className="mt-0.5 text-xs text-gray-400">
                              {i + 1}
                            </span>
                            <span className="break-all font-mono text-xs font-medium text-brand-600">
                              {r.tracking_number}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <select
                            value={clientId}
                            onChange={(e) => setRow(r.tracking_number, e.target.value)}
                            disabled={pending}
                            aria-label={`Cliente del paquete ${r.tracking_number}`}
                            className="w-full rounded-md border border-brand-300 bg-white px-2 py-1.5 text-xs text-gray-700 shadow-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 disabled:opacity-50"
                          >
                            <option value={CREATE}>
                              Crear: {r.suggestedName}
                            </option>
                            {baseClients.map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.nombre}
                              </option>
                            ))}
                            <option value={UNSET}>Sin asignar</option>
                          </select>
                          {clientId === CREATE && (
                            <Input
                              type="text"
                              value={clientName}
                              onChange={(e) =>
                                setRowName(r.tracking_number, e.target.value)
                              }
                              disabled={pending}
                              className="mt-1.5 text-xs"
                              aria-label={`Nombre para crear del paquete ${r.tracking_number}`}
                            />
                          )}
                        </td>
                        <td className="hidden px-4 py-3 text-gray-600 sm:table-cell">
                          {r.descripcion ?? <span className="text-gray-300">—</span>}
                        </td>
                        <td className="hidden whitespace-nowrap px-4 py-3 text-gray-500 sm:table-cell">
                          {formatFecha(r.fecha_recepcion)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}