"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updatePackageStatus } from "@/lib/actions/packages";
import { Button } from "@/components/ui";
import { PACKAGE_STATUS_LABELS, type PackageStatus } from "@/lib/types";

export function PackageStatusButtons({
  packageId,
  currentStatus,
  currentPagado,
}: {
  packageId: string;
  currentStatus: PackageStatus;
  currentPagado: boolean | null;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [choosingPagado, setChoosingPagado] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleStatusChange(
    status: PackageStatus,
    pagado: boolean | null = null
  ) {
    setError(null);
    startTransition(async () => {
      const result = await updatePackageStatus(packageId, status, pagado);
      if (result.error) {
        setError(result.error);
      } else {
        setChoosingPagado(false);
        router.refresh();
      }
    });
  }

  const isCurrent = (status: PackageStatus) => currentStatus === status;
  const deliveredSet = currentStatus === "entregado" && currentPagado !== null;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {(["en_camino", "disponible", "entregado"] as PackageStatus[]).map(
          (status) => {
            if (status === "entregado") {
              return (
                <Button
                  key={status}
                  size="sm"
                  variant={deliveredSet ? "primary" : "secondary"}
                  disabled={isPending || deliveredSet}
                  onClick={() => setChoosingPagado(true)}
                >
                  {PACKAGE_STATUS_LABELS[status]}
                </Button>
              );
            }
            return (
              <Button
                key={status}
                size="sm"
                variant={isCurrent(status) ? "primary" : "secondary"}
                disabled={isPending || isCurrent(status)}
                onClick={() => handleStatusChange(status)}
              >
                {PACKAGE_STATUS_LABELS[status]}
              </Button>
            );
          }
        )}
      </div>

      {choosingPagado && (
        <div className="flex flex-wrap items-center gap-2 rounded-md border border-brand-200 bg-brand-50 px-4 py-3 text-sm">
          <span className="font-medium text-brand-800">¿Pagado?</span>
          <Button
            size="sm"
            disabled={isPending}
            onClick={() => handleStatusChange("entregado", true)}
          >
            Pagado
          </Button>
          <Button
            size="sm"
            variant="secondary"
            disabled={isPending}
            onClick={() => handleStatusChange("entregado", false)}
          >
            No pagado
          </Button>
          <Button
            size="sm"
            variant="ghost"
            disabled={isPending}
            onClick={() => setChoosingPagado(false)}
          >
            Cancelar
          </Button>
        </div>
      )}

      {isPending && (
        <p className="text-xs text-gray-400">Actualizando estado...</p>
      )}

      {error && (
        <div
          role="alert"
          className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </div>
      )}
    </div>
  );
}