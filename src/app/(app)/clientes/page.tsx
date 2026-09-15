import Link from "next/link";
import { requireUser } from "@/lib/dal";
import { createClient } from "@/lib/supabase/server";
import { Button, Card, EmptyState } from "@/components/ui";
import { ClientesTable } from "@/components/clientes-table";

export default async function ClientesPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  await requireUser();
  const supabase = await createClient();

  const { error: errorParam } = await searchParams;

  const { data: clients, error } = await supabase
    .from("clients")
    .select("id, nombre, telefono, created_at, packages(count)")
    .order("nombre", { ascending: true });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
        <Link href="/clientes/nuevo">
          <Button>Nuevo cliente</Button>
        </Link>
      </div>

      {errorParam && (
        <div
          role="alert"
          className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {errorParam}
        </div>
      )}

      {error ? (
        <Card>
          <EmptyState message={`Error al cargar: ${error.message}`} />
        </Card>
      ) : (
        <ClientesTable clientes={clients ?? []} />
      )}
    </div>
  );
}