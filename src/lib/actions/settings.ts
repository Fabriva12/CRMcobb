"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/dal";
import { createClient } from "@/lib/supabase/server";
import { SETTINGS_KEY_TIPO_CAMBIO } from "@/lib/settings";

export async function updateExchangeRate(
  rate: number
): Promise<{ error?: string }> {
  await requireUser();
  if (!Number.isFinite(rate) || rate <= 0) {
    return { error: "Ingresá un tipo de cambio válido (mayor a 0)." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("settings")
    .upsert(
      { key: SETTINGS_KEY_TIPO_CAMBIO, value: rate },
      { onConflict: "key" }
    );

  if (error) {
    return { error: `No se pudo guardar: ${error.message}` };
  }

  revalidatePath("/paquetes");
  revalidatePath("/");
  return {};
}