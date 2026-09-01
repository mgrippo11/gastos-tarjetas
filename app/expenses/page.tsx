import Link from "next/link";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db/client";
import { expenses } from "@/db/schema";
import { installmentNumberForMonth } from "@/lib/installments";
import { currentMonth } from "@/lib/dates";
import { Field } from "@/components/Field";
import { deleteExpense } from "./actions";

export default async function ExpensesPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const session = await auth();
  const ownerEmail = session!.user!.email!;
  const month = (await searchParams).month || currentMonth();

  const allExpenses = await db.query.expenses.findMany({
    where: eq(expenses.ownerEmail, ownerEmail),
    with: { card: true, category: true },
  });

  const monthExpenses = allExpenses
    .map((e) => ({
      ...e,
      installmentNumber: installmentNumberForMonth(e.purchaseMonth, e.totalInstallments, month),
    }))
    .filter((e) => e.installmentNumber !== null);

  return (
    <div className="mx-auto max-w-2xl p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Gastos</h1>
        <Link href="/expenses/new" className="rounded bg-foreground px-4 py-2 text-background">
          Nuevo gasto
        </Link>
      </div>

      <form className="mb-6 flex items-end gap-2">
        <Field label="Mes">
          <input type="month" name="month" defaultValue={month} className="rounded border px-3 py-2" />
        </Field>
        <button type="submit" className="rounded border px-4 py-2">
          Ver mes
        </button>
      </form>

      <ul className="space-y-2">
        {monthExpenses.map((e) => (
          <li key={e.id} className="rounded border px-3 py-2">
            <div className="flex items-start justify-between">
              <div>
                <div className="font-medium">
                  {e.description}
                  {e.totalInstallments > 1 ? ` (cuota ${e.installmentNumber}/${e.totalInstallments})` : ""}
                </div>
                <div className="text-sm text-zinc-500">
                  {e.card?.name ?? "Varios"} · {e.category?.name ?? "Sin categoría"} · $
                  {e.amount.toLocaleString("es-AR")} c/u
                </div>
                <div className="text-xs text-zinc-400">
                  Compra: {e.purchaseMonth}
                  {e.dueDay ? ` · vence el ${e.dueDay}` : ""}
                </div>
              </div>
              <div className="flex shrink-0 gap-3 text-sm">
                <Link href={`/expenses/${e.id}/edit`} className="underline">
                  Editar
                </Link>
                <form action={deleteExpense.bind(null, e.id)}>
                  <button type="submit" className="text-red-600 hover:underline">
                    Borrar
                  </button>
                </form>
              </div>
            </div>
          </li>
        ))}
        {monthExpenses.length === 0 && (
          <li className="text-sm text-zinc-500">Sin gastos en {month}.</li>
        )}
      </ul>
    </div>
  );
}
