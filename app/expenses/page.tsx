import Link from "next/link";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db/client";
import { expenses } from "@/db/schema";
import { installmentNumberForMonth } from "@/lib/installments";
import { deleteExpense } from "./actions";

function currentMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

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

      <form className="mb-6 flex gap-2">
        <input type="month" name="month" defaultValue={month} className="rounded border px-3 py-2" />
        <button type="submit" className="rounded border px-4 py-2">
          Ver mes
        </button>
      </form>

      <ul className="space-y-2">
        {monthExpenses.map((e) => (
          <li key={e.id} className="flex items-center justify-between rounded border px-3 py-2">
            <div>
              <div className="font-medium">
                {e.description}
                {e.totalInstallments > 1 ? ` (${e.installmentNumber}/${e.totalInstallments})` : ""}
              </div>
              <div className="text-sm text-zinc-500">
                {e.card?.name ?? "Vario"} · {e.category?.name ?? "Sin categoría"} · $
                {e.amount.toLocaleString("es-AR")}
              </div>
            </div>
            <form action={deleteExpense.bind(null, e.id)}>
              <button type="submit" className="text-red-600 hover:underline">
                Borrar
              </button>
            </form>
          </li>
        ))}
        {monthExpenses.length === 0 && (
          <li className="text-sm text-zinc-500">Sin gastos en {month}.</li>
        )}
      </ul>
    </div>
  );
}
