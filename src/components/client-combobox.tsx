"use client";

import { useState } from "react";
import { Input } from "@/components/ui";

interface ClientComboboxProps {
  clients: { id: string; nombre: string; telefono?: string | null }[];
  defaultValueId?: string | null;
  name?: string;
}

export function ClientCombobox({
  clients,
  defaultValueId,
  name = "client_id",
}: ClientComboboxProps) {
  const defaultClient =
    clients.find((c) => c.id === defaultValueId) ?? null;
  const [query, setQuery] = useState(defaultClient?.nombre ?? "");
  const [selectedId, setSelectedId] = useState<string | null>(
    defaultValueId ?? null
  );
  const [open, setOpen] = useState(false);

  const normalized = query.trim().toLowerCase();
  const matches = (normalized
    ? clients.filter(
        (c) =>
          c.nombre.toLowerCase().includes(normalized) ||
          (c.telefono ?? "").toLowerCase().includes(normalized)
      )
    : clients
  ).slice(0, 8);

  function handleSelect(client: { id: string; nombre: string }) {
    setSelectedId(client.id);
    setQuery(client.nombre);
    setOpen(false);
  }

  return (
    <div className="relative">
      <Input
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setSelectedId(null);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        placeholder="Buscar cliente..."
        role="combobox"
        autoComplete="off"
      />
      {selectedId !== null && (
        <input type="hidden" name={name} value={selectedId} />
      )}

      {open && (
        <ul className="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-md border border-gray-300 bg-white shadow-lg">
          {matches.length === 0 ? (
            <li className="px-3 py-2 text-sm text-gray-500">
              Sin coincidencias
            </li>
          ) : (
            matches.map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => handleSelect(c)}
                  className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-gray-100"
                >
                  <span className="font-medium text-gray-900">{c.nombre}</span>
                  {c.telefono && (
                    <span className="text-xs text-gray-400">{c.telefono}</span>
                  )}
                </button>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}