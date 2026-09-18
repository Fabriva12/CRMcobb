import Link from "next/link";
import { notFound } from "next/navigation";
import { updateClientAction } from "@/lib/actions/clients";
import { requireUser } from "@/lib/dal";
import { createClient } from "@/lib/supabase/server";
import { formatCurrency, formatWeight } from "@/lib/format";
import {
  Button,
  Card,
  EmptyState,
  StatusBadge,
} from "@/components/ui";
import { ClientForm } from "../cliente-form";

export default async function ClienteDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireUser();
  const supabase = await createClient();
  const { id } = await params;

  const [clientRes, packagesRes] = await Promise.all([
    supabase.from("clients").select("*").eq("id", id).single(),
    supabase
      .from("packages")
      .select("id, tracking_number, status, peso_lb, tarifa_lb, total, created_at")
      .eq("client_id", id)
      .order("created_at", { ascending: false }),
  ]);

  if (clientRes.error || !clientRes.data) {
    notFound();
  }

  const client = clientRes.data;
  const packages = packagesRes.data ?? [];
  const totalAcumulado = packages.reduce(
    (acc, p) => acc + (Number(p.total) || 0),
    0
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="break-words text-2xl font-bold text-gray-900">
            {client.nombre}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {client.telefono || "Sin teléfono registrado"}
          </p>
        </div>
        <Link href="/clientes">
          <Button variant="secondary" className="w-full sm:w-auto">
            Volver
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <p className="text-2xl font-bold text-gray-900">
            {formatCurrency(client.tarifa_lb)}
          </p>
          <p className="mt-1 text-sm text-gray-500">Tarifa por libra</p>
        </Card>
        <Card>
          <p className="text-2xl font-bold text-gray-900">{packages.length}</p>
          <p className="mt-1 text-sm text-gray-500">Paquetes</p>
        </Card>
        <Card>
          <p className="text-2xl font-bold text-brand-600">
            {formatCurrency(totalAcumulado)}
          </p>
          <p className="mt-1 text-sm text-gray-500">Total acumulado</p>
        </Card>
      </div>

      <Card id="editar">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          Editar cliente
        </h2>
        <ClientForm
          action={updateClientAction}
          initial={{
            id: client.id,
            nombre: client.nombre,
            telefono: client.telefono ?? "",
            notas: client.notas ?? "",
          }}
        />
      </Card>

      <Card>
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          Paquetes de {client.nombre}
        </h2>
        {packages.length === 0 ? (
          <EmptyState message="Este cliente todavía no tiene paquetes." />
        ) : (
          <>
            {/* Mobile: cards view */}
            <div className="space-y-3 md:hidden">
              {packages.map((p) => (
                <Card key={p.id} className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <Link
                      href={`/paquetes/${p.id}`}
                      className="break-all font-mono text-xs font-medium text-brand-600 hover:underline"
                    >
                      {p.tracking_number}
                    </Link>
                    <p className="mt-1 text-sm font-medium text-gray-900">
                      {formatCurrency(p.total)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatWeight(p.peso_lb)} lb
                    </p>
                  </div>
                  <StatusBadge status={p.status} />
                </Card>
              ))}
            </div>

            {/* Desktop: table view */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-brand-200 text-xs uppercase tracking-wide text-brand-700">
                    <th className="pb-2 pr-4 font-semibold">Seguimiento</th>
                    <th className="pb-2 pr-4 font-semibold">Estado</th>
                    <th className="pb-2 pr-4 font-semibold">Peso</th>
                    <th className="pb-2 font-semibold">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {packages.map((p) => (
                    <tr
                      key={p.id}
                      className="border-b border-gray-100 last:border-0 hover:bg-gray-50"
                    >
                      <td className="py-2.5 pr-4">
                        <Link
                          href={`/paquetes/${p.id}`}
                          className="font-mono text-xs font-medium text-brand-600 hover:underline"
                        >
                          {p.tracking_number}
                        </Link>
                      </td>
                      <td className="py-2.5 pr-4">
                        <StatusBadge status={p.status} />
                      </td>
                      <td className="py-2.5 pr-4 text-gray-700">
                        {formatWeight(p.peso_lb)} lb
                      </td>
                      <td className="py-2.5 font-medium text-gray-900">
                        {formatCurrency(p.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </Card>

      {client.notas && (
        <Card>
          <h2 className="mb-2 text-lg font-semibold text-gray-900">Notas</h2>
          <p className="whitespace-pre-wrap text-sm text-gray-700">
            {client.notas}
          </p>
        </Card>
      )}
    </div>
  );
}