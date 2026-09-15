"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/dal";
import { createClient } from "@/lib/supabase/server";
import { DEFAULT_TARIFF_LB } from "@/lib/types";

export type ClientFormState = { error?: string } | undefined;

export async function createClientAction(
  _prevState: ClientFormState,
  formData: FormData
): Promise<ClientFormState> {
  await requireUser();
  const supabase = await createClient();

  const nombre = String(formData.get("nombre") ?? "").trim();
  if (!nombre) {
    return { error: "El nombre es obligatorio." };
  }

  const { error } = await supabase.from("clients").insert({
    nombre,
    telefono: String(formData.get("telefono") ?? "").trim() || null,
    notas: String(formData.get("notas") ?? "").trim() || null,
    tarifa_lb: DEFAULT_TARIFF_LB,
  });

  if (error) {
    return { error: `No se pudo guardar el cliente: ${error.message}` };
  }

  revalidatePath("/clientes");
  redirect("/clientes");
}

export async function updateClientAction(
  _prevState: ClientFormState,
  formData: FormData
): Promise<ClientFormState> {
  await requireUser();
  const supabase = await createClient();

  const id = String(formData.get("id") ?? "");
  const nombre = String(formData.get("nombre") ?? "").trim();
  if (!id || !nombre) {
    return { error: "Datos incompletos." };
  }

  const { error } = await supabase
    .from("clients")
    .update({
      nombre,
      telefono: String(formData.get("telefono") ?? "").trim() || null,
      notas: String(formData.get("notas") ?? "").trim() || null,
    })
    .eq("id", id);

  if (error) {
    return { error: `No se pudo actualizar el cliente: ${error.message}` };
  }

  revalidatePath("/clientes");
  revalidatePath(`/clientes/${id}`);
  redirect(`/clientes/${id}`);
}

export async function deleteClientAction(formData: FormData) {
  await requireUser();
  const supabase = await createClient();

  const id = String(formData.get("id") ?? "");

  const { error } = await supabase.from("clients").delete().eq("id", id);
  if (error) {
    redirect(`/clientes?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/clientes");
  redirect("/clientes");
}