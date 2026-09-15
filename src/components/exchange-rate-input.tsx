"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateExchangeRate } from "@/lib/actions/settings";

export function ExchangeRateInput({ currentRate }: { currentRate: number }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [value, setValue] = useState<string>(String(currentRate));
  const [saved, setSaved] = useState(false);

  function save() {
    const rate = Number(value.replace(",", "."));
    if (Number.isNaN(rate) || rate <= 0) {
      setError("Tipo de cambio inválido");
      return;
    }
    if (rate === currentRate) return;
    setError(null);
    setSaved(false);
    startTransition(async () => {
      const result = await updateExchangeRate(rate);
      if (result.error) {
        setError(result.error);
      } else {
        setSaved(true);
        router.refresh();
      }
    });
  }

  return (
    <div>
      <div className="flex items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm">
        <span className="font-medium text-gray-500">$</span>
        <input
          type="number"
          step="0.01"
          min="0.01"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setSaved(false);
          }}
          onBlur={save}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              save();
            }
          }}
          disabled={isPending}
          aria-label="Precio del dólar en colones"
          className="w-20 outline-none"
        />
        <span className="text-xs text-gray-400">₡ por $</span>
        {isPending && <span className="text-xs text-gray-400">Guardando...</span>}
        {saved && !error && (
          <span className="text-xs font-medium text-emerald-600">Guardado</span>
        )}
      </div>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}