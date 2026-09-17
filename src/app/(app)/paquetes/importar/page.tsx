import { requireUser } from "@/lib/dal";
import { createClient } from "@/lib/supabase/server";
import { Card, EmptyState } from "@/components/ui";
import { ImportXlsxForm } from "@/components/import-xlsx-form";

export default async function ImportarPaquetesPage() {
  await requireUser();
  const supabase = await createClient();

  const { data: clients, error } = await supabase
    .from("clients")
    .select("id, nombre, telefono")
    .order("nombre", { ascending: true });

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">
        Importar lista semanal
      </h1>

      {error ? (
        <Card>
          <EmptyState
            message={`Error al cargar clientes: ${error.message}`}
          />
        </Card>
      ) : (
        <ImportXlsxForm
          clients={(clients ?? []).map((c) => ({
            id: c.id,
            nombre: c.nombre,
            telefono: c.telefono,
          }))}
        />
      )}
    </div>
  );
}