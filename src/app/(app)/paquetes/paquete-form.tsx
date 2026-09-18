"use client";

import { useActionState, useState } from "react";
import {
  Button,
  ErrorMessage,
  Field,
  Input,
  Select,
  Textarea,
} from "@/components/ui";
import { ClientCombobox } from "@/components/client-combobox";
import {
  DEFAULT_TARIFF_LB,
  PACKAGE_STATUS_LABELS,
  PACKAGE_STATUS_ORDER,
  type PackageStatus,
} from "@/lib/types";
import type { PackageFormState } from "@/lib/actions/packages";

interface PackageFormProps {
  action: (
    prevState: PackageFormState,
    formData: FormData
  ) => Promise<PackageFormState>;
  clients: { id: string; nombre: string; telefono?: string | null }[];
  initial?: {
    id?: string;
    tracking_number?: string;
    client_id?: string | null;
    status?: (typeof PACKAGE_STATUS_ORDER)[number];
    peso_lb?: number;
    tarifa_lb?: number;
    pagado?: boolean | null;
    descripcion?: string;
    notas?: string;
    vuelo?: string | null;
    fecha_recepcion?: string | null;
  };
}

export function PackageForm({ action, clients, initial }: PackageFormProps) {
  const [state, formAction, pending] = useActionState<PackageFormState, FormData>(
    action,
    undefined
  );
  const isEdit = Boolean(initial?.id);
  const [status, setStatus] = useState<PackageStatus>(
    initial?.status ?? "en_camino"
  );
  const pagadoInitial =
    initial?.status === "entregado"
      ? initial.pagado === null || initial.pagado === undefined
        ? ""
        : String(initial.pagado)
      : "";

  return (
    <form action={formAction} className="space-y-4">
      {isEdit && <input type="hidden" name="id" value={initial?.id} />}

      <Field label="Número de seguimiento *">
        <Input
          name="tracking_number"
          required
          defaultValue={initial?.tracking_number}
          placeholder="Ej: 1Z999AA10123456784"
        />
      </Field>

      <Field label="Cliente">
        <ClientCombobox
          clients={clients}
          defaultValueId={initial?.client_id ?? null}
        />
      </Field>

      <Field label="Descripción">
        <Textarea
          name="descripcion"
          defaultValue={initial?.descripcion ?? ""}
          placeholder="Ej: Ropa, zapatos, celular..."
        />
      </Field>

      <Field label="Notas">
        <Textarea
          name="notas"
          defaultValue={initial?.notas ?? ""}
          placeholder="Comentarios internos (opcional)"
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Vuelo">
          <Input
            name="vuelo"
            type="text"
            placeholder="Ej: Viernes 03"
            maxLength={120}
            defaultValue={initial?.vuelo ?? ""}
          />
        </Field>
        <Field label="Recibido a bodega">
          <Input
            name="fecha_recepcion"
            type="date"
            defaultValue={initial?.fecha_recepcion ?? ""}
          />
        </Field>
      </div>

      {isEdit && (
        <>
          <Field label="Estado">
            <Select
              name="status"
              defaultValue={initial?.status ?? "en_camino"}
              onChange={(e) => setStatus(e.target.value as PackageStatus)}
            >
              {PACKAGE_STATUS_ORDER.map((s) => (
                <option key={s} value={s}>
                  {PACKAGE_STATUS_LABELS[s]}
                </option>
              ))}
            </Select>
          </Field>

          {status === "entregado" && (
            <Field label="¿Pagado?">
              <Select name="pagado" defaultValue={pagadoInitial}>
                <option value="">Sin definir</option>
                <option value="true">Pagado</option>
                <option value="false">No pagado</option>
              </Select>
            </Field>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Peso (lb)">
              <Input
                name="peso_lb"
                type="number"
                step="0.01"
                min="0"
                defaultValue={initial?.peso_lb ?? 0}
              />
            </Field>
            <Field label="Tarifa por libra (USD)">
              <Input
                name="tarifa_lb"
                type="number"
                step="0.01"
                min="0.01"
                defaultValue={initial?.tarifa_lb ?? DEFAULT_TARIFF_LB}
              />
            </Field>
          </div>

          <Field label="Nota del cambio de estado (opcional)">
            <Textarea
              name="note"
              placeholder="Ej: llegó al depósito con la caja abierta"
            />
          </Field>
        </>
      )}

      <ErrorMessage message={state?.error} />

      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={pending}>
          {pending
            ? "Guardando..."
            : isEdit
              ? "Guardar cambios"
              : "Registrar paquete"}
        </Button>
      </div>
    </form>
  );
}