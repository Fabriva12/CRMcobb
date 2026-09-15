import { createClientAction } from "@/lib/actions/clients";
import { requireUser } from "@/lib/dal";
import { Card } from "@/components/ui";
import { ClientForm } from "../cliente-form";

export default async function NuevoClientePage() {
  await requireUser();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Nuevo cliente</h1>
      <Card>
        <ClientForm action={createClientAction} />
      </Card>
    </div>
  );
}