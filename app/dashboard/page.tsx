import Link from "next/link";
import { and, eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db/client";
import { expenses, income } from "@/db/schema";
import { installmentNumberForMonth } from "@/lib/installments";
import { currentMonth, subtractMonths } from "@/lib/dates";
import { Field } from "@/components/Field";
import { Card } from "@/components/ui/Card";
import { Money } from "@/components/ui/Money";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { CurrencyDollarIcon, ReceiptIcon, ChartBarIcon } from "@/components/icons";

function sumBy<T>(items: T[], key: (item: T) => string, amount: (item: T) => number) {
  const totals = new Map<string, number>();
  for (const item of items) {
    const k = key(item);
    totals.set(k, (totals.get(k) ?? 0) + amount(item));
  }
  return [...totals.entries()].sort((a, b) => b[1] - a[1]);
}

function monthLabel(month: string) {
  const [year, m] = month.split("-").map(Number);
  const label = new Date(year, m - 1, 1).toLocaleDateString("es-AR", { month: "long", year: "numeric" });
  return label.charAt(0).toUpperCase() + label.slice(1);
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
  const balance = totalIncome - totalExpenses;
  const byCard = sumBy(monthExpenses, (e) => e.card?.name ?? "Varios", (e) => e.amount);
  const byCategory = sumBy(monthExpenses, (e) => e.category?.name ?? "Sin categoría", (e) => e.amount);

  return (
    <div className="mx-auto max-w-3xl p-6">
      <PageHeader title="Dashboard" />

      <div className="mb-6 flex items-end justify-between gap-2">
        <div className="flex items-end gap-2">
          <Link
            href={`?month=${subtractMonths(month, 1)}`}
            className="flex h-11 w-11 items-center justify-center rounded-md border border-border text-lg hover:bg-muted"
            aria-label="Mes anterior"
          >
            ‹
          </Link>
          <div className="w-44 text-center">
            <div className="mb-1 text-sm font-medium text-foreground">{monthLabel(month)}</div>
          </div>
          <Link
            href={`?month=${subtractMonths(month, -1)}`}
            className="flex h-11 w-11 items-center justify-center rounded-md border border-border text-lg hover:bg-muted"
            aria-label="Mes siguiente"
          >
            ›
          </Link>
        </div>
        <form className="flex items-end gap-2">
          <Field label="Ir a un mes">
            <input type="month" name="month" defaultValue={month} className="w-40" />
          </Field>
          <button type="submit" className="h-11 rounded-md border border-border px-3 text-sm hover:bg-muted">
            Ir
          </button>
        </form>
      </div>

      <div className="mb-8 grid grid-cols-3 gap-3">
        <Card className="p-4">
          <div className="mb-1 flex items-center gap-1.5 text-sm text-muted-foreground">
            <CurrencyDollarIcon size={16} aria-hidden="true" /> Ingresos
          </div>
          <Money amount={totalIncome} tone="positive" className="text-lg font-semibold" />
        </Card>
        <Card className="p-4">
          <div className="mb-1 flex items-center gap-1.5 text-sm text-muted-foreground">
            <ReceiptIcon size={16} aria-hidden="true" /> Gastos
          </div>
          <Money amount={totalExpenses} className="text-lg font-semibold" />
        </Card>
        <Card className="p-4">
          <div className="mb-1 flex items-center gap-1.5 text-sm text-muted-foreground">
            <ChartBarIcon size={16} aria-hidden="true" /> Balance
          </div>
          <Money
            amount={balance}
            tone={balance >= 0 ? "positive" : "negative"}
            className="text-lg font-semibold"
          />
        </Card>
      </div>

      <div className="mb-8">
        <h2 className="mb-2 text-sm font-semibold text-muted-foreground">Por tarjeta</h2>
        {byCard.length === 0 ? (
          <EmptyState>Sin gastos en {monthLabel(month).toLowerCase()}.</EmptyState>
        ) : (
          <Card className="divide-y divide-border">
            {byCard.map(([name, total]) => (
              <div key={name} className="flex justify-between px-4 py-3 text-sm">
                <span>{name}</span>
                <Money amount={total} className="font-medium" />
              </div>
            ))}
          </Card>
        )}
      </div>

      <div>
        <h2 className="mb-2 text-sm font-semibold text-muted-foreground">Por categoría</h2>
        {byCategory.length === 0 ? (
          <EmptyState>Sin gastos en {monthLabel(month).toLowerCase()}.</EmptyState>
        ) : (
          <Card className="divide-y divide-border">
            {byCategory.map(([name, total]) => (
              <div key={name} className="flex justify-between px-4 py-3 text-sm">
                <span>{name}</span>
                <Money amount={total} className="font-medium" />
              </div>
            ))}
          </Card>
        )}
      </div>
    </div>
  );
}
