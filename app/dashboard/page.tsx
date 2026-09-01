import { and, eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db/client";
import { expenses, income } from "@/db/schema";
import { installmentNumberForMonth } from "@/lib/installments";

function currentMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function money(n: number) {
  return `$${n.toLocaleString("es-AR")}`;
}

function sumBy<T>(items: T[], key: (item: T) => string, amount: (item: T) => number) {
  const totals = new Map<string, number>();
  for (const item of items) {
    const k = key(item);
    totals.set(k, (totals.get(k) ?? 0) + amount(item));
  }
  return [...totals.entries()].sort((a, b) => b[1] - a[1]);
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const session = await auth();
  const ownerEmail = session!.user!.email!;
  const month = (await searchParams).month || currentMonth();

  const [allExpenses, monthIncome] = await Promise.all([
    db.query.expenses.findMany({
      where: eq(expenses.ownerEmail, ownerEmail),
      with: { card: true, category: true },
    }),
    db.query.income.findMany({
      where: and(eq(income.ownerEmail, ownerEmail), eq(income.month, month)),
    }),
  ]);

  const monthExpenses = allExpenses.filter(
    (e) => installmentNumberForMonth(e.purchaseMonth, e.totalInstallments, month) !== null
  );

  const totalExpenses = monthExpenses.reduce((sum, e) => sum + e.amount, 0);
  const totalIncome = monthIncome.reduce((sum, i) => sum + i.amount, 0);
  const byCard = sumBy(monthExpenses, (e) => e.card?.name ?? "Vario", (e) => e.amount);
  const byCategory = sumBy(monthExpenses, (e) => e.category?.name ?? "Sin categoría", (e) => e.amount);

  return (
    <div className="mx-auto max-w-2xl p-8">
      <h1 className="mb-6 text-xl font-semibold">Dashboard</h1>

      <form className="mb-8 flex gap-2">
        <input type="month" name="month" defaultValue={month} className="rounded border px-3 py-2" />
        <button type="submit" className="rounded border px-4 py-2">
          Ver mes
        </button>
      </form>

      <div className="mb-8 grid grid-cols-3 gap-4">
        <div className="rounded border p-4">
          <div className="text-sm text-zinc-500">Ingresos</div>
          <div className="text-lg font-semibold">{money(totalIncome)}</div>
        </div>
        <div className="rounded border p-4">
          <div className="text-sm text-zinc-500">Gastos</div>
          <div className="text-lg font-semibold">{money(totalExpenses)}</div>
        </div>
        <div className="rounded border p-4">
          <div className="text-sm text-zinc-500">Balance</div>
          <div className="text-lg font-semibold">{money(totalIncome - totalExpenses)}</div>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="mb-2 font-medium">Por tarjeta</h2>
        <ul className="space-y-1">
          {byCard.map(([name, total]) => (
            <li key={name} className="flex justify-between rounded border px-3 py-2">
              <span>{name}</span>
              <span>{money(total)}</span>
            </li>
          ))}
          {byCard.length === 0 && <li className="text-sm text-zinc-500">Sin gastos en {month}.</li>}
        </ul>
      </div>

      <div>
        <h2 className="mb-2 font-medium">Por categoría</h2>
        <ul className="space-y-1">
          {byCategory.map(([name, total]) => (
            <li key={name} className="flex justify-between rounded border px-3 py-2">
              <span>{name}</span>
              <span>{money(total)}</span>
            </li>
          ))}
          {byCategory.length === 0 && <li className="text-sm text-zinc-500">Sin gastos en {month}.</li>}
        </ul>
      </div>
    </div>
  );
}
