import Link from "next/link";
import { requireUser } from "@/lib/dal";
import { createClient } from "@/lib/supabase/server";
import { getExchangeRate } from "@/lib/settings";
import { Button, Card, EmptyState } from "@/components/ui";
import { ExchangeRateInput } from "@/components/exchange-rate-input";
import { PaquetesTable } from "@/components/paquetes-table";

export default async function PaquetesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; error?: string }>;
}) {
  await requireUser();
  const supabase = await createClient();
  const rate = await getExchangeRate(supabase);

  const { status, error: errorParam } = await searchParams;

  const { data: packages, error } = await supabase
    .from("packages")
    .select(
      "id, tracking_number, status, peso_lb, tarifa_lb, pagado, created_at, descripcion, clients(id, nombre, telefono)"
    )
    .order("created_at", { ascending: false })
    .limit(200);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Paquetes</h1>
        <Link href="/paquetes/nuevo">
          <Button>Registrar paquete</Button>
        </Link>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <div>
          <p className="mb-1 text-xs font-medium text-gray-500">
            Tipo de cambio
          </p>
          <ExchangeRateInput currentRate={rate} />
        </div>
        <p className="pb-1 text-xs text-gray-400">
          Los totales se muestran en colones · 1 $ = {rate} ₡
        </p>
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
        <PaquetesTable
          paquetes={packages ?? []}
          rate={rate}
          initialStatus={status ?? ""}
        />
      )}
    </div>
  );
}