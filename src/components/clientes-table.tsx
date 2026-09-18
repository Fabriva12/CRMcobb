"use client";

import { useMemo, useState } from "react";
import { deleteClientAction } from "@/lib/actions/clients";
import { formatDateShort, normalizeSearch } from "@/lib/format";
import { Badge, Button, Card, EmptyState, Input } from "@/components/ui";
import { ConfirmDeleteForm } from "@/components/confirm-delete-form";

type ClienteRow = {
  id: string;
  nombre: string | null;
  telefono: string | null;
  created_at: string | null;
  packages: { count?: number }[] | { count?: number } | null;
};

export function ClientesTable({ clientes }: { clientes: ClienteRow[] }) {
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const needle = normalizeSearch(q.trim());
    if (!needle) return clientes;
    return clientes.filter((c) =>
      normalizeSearch(`${c.nombre ?? ""} ${c.telefono ?? ""}`).includes(needle)
    );
  }, [clientes, q]);

  if (clientes.length === 0) {
    return (
      <Card>
        <EmptyState message="Todavía no hay clientes registrados." />
      </Card>
    );
  }

  if (filtered.length === 0) {
    return (
      <div className="space-y-4">
        <BuscarClientes q={q} setQ={setQ} total={clientes.length} />
        <Card>
          <EmptyState message="Sin clientes que coincidan con el filtro." />
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <BuscarClientes q={q} setQ={setQ} total={clientes.length} />

      {/* Mobile: cards view */}
      <div className="space-y-3 md:hidden">
        {filtered.map((c) => {
          const packageCount = Array.isArray(c.packages)
            ? Number((c.packages[0] as { count?: number })?.count ?? 0)
            : Number((c.packages as { count?: number } | null)?.count ?? 0);
          return (
            <Card key={c.id} className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <a
                  href={`/clientes/${c.id}`}
                  className="block truncate font-medium text-brand-600 hover:underline"
                >
                  {c.nombre}
                </a>
                <p className="mt-0.5 text-sm text-gray-600">
                  {c.telefono || "-"}
                </p>
                <p className="mt-0.5 text-xs text-gray-400">
                  {packageCount} paquete{packageCount !== 1 && "s"} · Alta{" "}
                  {formatDateShort(c.created_at)}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                  <a
                    href={`/clientes/${c.id}#editar`}
                    className="text-sm font-medium text-brand-600 hover:underline"
                  >
                    Editar
                  </a>
                  <ConfirmDeleteForm
                    action={deleteClientAction}
                    id={c.id}
                    confirmMessage={`¿Eliminar al cliente ${c.nombre}?`}
                  >
                    <Button
                      type="submit"
                      variant="ghost"
                      className="shrink-0 text-red-600 hover:bg-red-50"
                    >
                      Eliminar
                    </Button>
                  </ConfirmDeleteForm>
                </div>
            </Card>
          );
        })}
      </div>

      {/* Desktop: table view */}
      <Card className="hidden overflow-hidden p-0 md:block">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-brand-200 text-xs uppercase tracking-wide text-brand-700">
                <th className="px-4 py-3 font-semibold">Nombre</th>
                <th className="px-4 py-3 font-semibold">Teléfono</th>
                <th className="px-4 py-3 font-semibold">Paquetes</th>
                <th className="px-4 py-3 font-semibold">Alta</th>
                <th className="px-4 py-3 font-semibold" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => {
                const packageCount = Array.isArray(c.packages)
                  ? Number((c.packages[0] as { count?: number })?.count ?? 0)
                  : Number((c.packages as { count?: number } | null)?.count ?? 0);
                return (
                  <tr
                    key={c.id}
                    className="border-b border-gray-100 last:border-0 hover:bg-gray-50"
                  >
                    <td className="px-4 py-3">
                      <a
                        href={`/clientes/${c.id}`}
                        className="font-medium text-brand-600 hover:underline"
                      >
                        {c.nombre}
                      </a>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {c.telefono || "-"}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      <Badge>{packageCount}</Badge>
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {formatDateShort(c.created_at)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <a
                        href={`/clientes/${c.id}#editar`}
                        className="mr-4 text-sm font-medium text-brand-600 hover:underline"
                      >
                        Editar
                      </a>
                      <ConfirmDeleteForm
                        action={deleteClientAction}
                        id={c.id}
                        confirmMessage={`¿Eliminar al cliente ${c.nombre}?`}
                      >
                        <Button
                          type="submit"
                          variant="ghost"
                          className="text-red-600 hover:bg-red-50"
                        >
                          Eliminar
                        </Button>
                      </ConfirmDeleteForm>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
      <p className="text-xs text-gray-400">
        {filtered.length} de {clientes.length} clientes
      </p>
    </div>
  );
}

function BuscarClientes({
  q,
  setQ,
  total,
}: {
  q: string;
  setQ: (value: string) => void;
  total: number;
}) {
  return (
    <div className="flex max-w-md items-center gap-3">
      <div className="flex-1">
        <Input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar por nombre o teléfono..."
          aria-label="Buscar clientes"
        />
      </div>
      <p className="text-xs text-gray-400">{total} clientes</p>
    </div>
  );
}