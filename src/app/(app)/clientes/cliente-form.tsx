"use client";

import { useActionState } from "react";
import {
  Button,
  ErrorMessage,
  Field,
  Input,
  Textarea,
} from "@/components/ui";
import type { ClientFormState } from "@/lib/actions/clients";

interface ClientFormProps {
  action: (
    prevState: ClientFormState,
    formData: FormData
  ) => Promise<ClientFormState>;
  initial?: {
    id?: string;
    nombre?: string;
    telefono?: string;
    notas?: string;
  };
}

export function ClientForm({ action, initial }: ClientFormProps) {
  const [state, formAction, pending] = useActionState<ClientFormState, FormData>(
    action,
    undefined
  );

  return (
    <form action={formAction} className="space-y-4">
      {initial?.id && <input type="hidden" name="id" value={initial.id} />}

      <Field label="Nombre *">
        <Input name="nombre" required defaultValue={initial?.nombre} />
      </Field>

      <Field label="Teléfono">
        <Input name="telefono" defaultValue={initial?.telefono ?? ""} />
      </Field>

      <Field label="Notas">
        <Textarea name="notas" defaultValue={initial?.notas ?? ""} />
      </Field>

      <ErrorMessage message={state?.error} />

      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={pending}>
          {pending
            ? "Guardando..."
            : initial?.id
              ? "Guardar cambios"
              : "Crear cliente"}
        </Button>
      </div>
    </form>
  );
}