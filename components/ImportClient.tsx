"use client";

import { useState, useTransition } from "react";
import { Field } from "@/components/Field";
import { parsePdf, confirmImport, type ImportCandidate, type ImportRow } from "@/app/import/actions";

type Card = { id: number; name: string };
type Category = { id: number; name: string };
type EditableRow = ImportCandidate & {
  categoryId: number | null;
  totalInstallments: number;
  included: boolean;
};

export function ImportClient({ cards, categories }: { cards: Card[]; categories: Category[] }) {
  const [cardId, setCardId] = useState("");
  const [rows, setRows] = useState<EditableRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleParse(formData: FormData) {
    setError(null);
    startTransition(async () => {
      try {
        const candidates = await parsePdf(formData);
        if (candidates.length === 0) {
          setError("No se encontraron líneas de gasto reconocibles en este PDF. Podés cargar el gasto a mano.");
          return;
        }
        setRows(
          candidates.map((c) => ({
            ...c,
            categoryId: null,
            totalInstallments: 1,
            included: c.amount > 0, // los montos negativos suelen ser pagos, no gastos
          }))
        );
      } catch (e) {
        setError(e instanceof Error ? e.message : "Error al leer el PDF");
      }
    });
  }

  function updateRow(index: number, patch: Partial<EditableRow>) {
    setRows((prev) => prev!.map((r, i) => (i === index ? { ...r, ...patch } : r)));
  }

  function handleConfirm() {
    const toImport: ImportRow[] = rows!
      .filter((r) => r.included)
      .map(({ description, amount, purchaseMonth, totalInstallments, categoryId }) => ({
        description,
        amount,
        purchaseMonth,
        totalInstallments,
        categoryId,
      }));
    startTransition(() => confirmImport(cardId ? Number(cardId) : null, toImport));
  }

  if (!rows) {
    return (
      <form action={handleParse} className="space-y-4">
        <Field label="Tarjeta del resumen">
          <select
            value={cardId}
            onChange={(e) => setCardId(e.target.value)}
            className="w-full rounded border px-3 py-2"
          >
            <option value="">Varios (efectivo / débito)</option>
            {cards.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="PDF del resumen">
          <input
            type="file"
            name="file"
            accept="application/pdf"
            required
            className="w-full rounded border px-3 py-2"
          />
        </Field>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={isPending}
          className="rounded bg-foreground px-4 py-2 text-background disabled:opacity-50"
        >
          {isPending ? "Analizando..." : "Analizar PDF"}
        </button>
      </form>
    );
  }

  const includedCount = rows.filter((r) => r.included).length;

  return (
    <div className="space-y-4">
      <p className="text-sm text-zinc-500">
        {rows.length} líneas detectadas. Revisá, corregí o desmarcá antes de confirmar — nada se guarda todavía.
      </p>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[42rem] border-collapse text-sm">
          <thead>
            <tr className="border-b text-left text-zinc-500">
              <th className="py-1 pr-2">Incluir</th>
              <th className="py-1 pr-2">Descripción</th>
              <th className="py-1 pr-2">Monto</th>
              <th className="py-1 pr-2">Mes</th>
              <th className="py-1 pr-2">Cuotas</th>
              <th className="py-1 pr-2">Categoría</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="border-b">
                <td className="py-1 pr-2">
                  <input
                    type="checkbox"
                    checked={r.included}
                    onChange={(e) => updateRow(i, { included: e.target.checked })}
                  />
                </td>
                <td className="py-1 pr-2">
                  <input
                    type="text"
                    value={r.description}
                    onChange={(e) => updateRow(i, { description: e.target.value })}
                    className="w-full min-w-[10rem] rounded border px-2 py-1"
                  />
                </td>
                <td className="py-1 pr-2">
                  <input
                    type="number"
                    step="0.01"
                    value={r.amount}
                    onChange={(e) => updateRow(i, { amount: Number(e.target.value) })}
                    className="w-24 rounded border px-2 py-1"
                  />
                </td>
                <td className="py-1 pr-2">
                  <input
                    type="month"
                    value={r.purchaseMonth}
                    onChange={(e) => updateRow(i, { purchaseMonth: e.target.value })}
                    className="rounded border px-2 py-1"
                  />
                </td>
                <td className="py-1 pr-2">
                  <input
                    type="number"
                    min={1}
                    value={r.totalInstallments}
                    onChange={(e) => updateRow(i, { totalInstallments: Number(e.target.value) })}
                    className="w-14 rounded border px-2 py-1"
                  />
                </td>
                <td className="py-1 pr-2">
                  <select
                    value={r.categoryId ?? ""}
                    onChange={(e) =>
                      updateRow(i, { categoryId: e.target.value ? Number(e.target.value) : null })
                    }
                    className="rounded border px-2 py-1"
                  >
                    <option value="">Sin categoría</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex gap-2">
        <button onClick={() => setRows(null)} className="rounded border px-4 py-2">
          Volver
        </button>
        <button
          onClick={handleConfirm}
          disabled={isPending || includedCount === 0}
          className="rounded bg-foreground px-4 py-2 text-background disabled:opacity-50"
        >
          {isPending ? "Importando..." : `Confirmar importación (${includedCount})`}
        </button>
      </div>
    </div>
  );
}
