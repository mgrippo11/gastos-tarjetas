import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db/client";
import { expenses } from "@/db/schema";
import { installmentNumberForMonth } from "@/lib/installments";
import { currentMonth } from "@/lib/dates";
import { Field } from "@/components/Field";
import { Card } from "@/components/ui/Card";
import { Money } from "@/components/ui/Money";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button, LinkButton } from "@/components/ui/Button";
import { PlusIcon, PencilSimpleIcon, TrashIcon } from "@/components/icons";
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
    <div className="mx-auto max-w-2xl p-6">
      <PageHeader
        title="Gastos"
        action={
          <LinkButton href="/expenses/new">
            <PlusIcon size={18} aria-hidden="true" /> Nuevo gasto
          </LinkButton>
        }
      />

      <form className="mb-6 flex items-end gap-2">
        <Field label="Mes">
          <input type="month" name="month" defaultValue={month} className="w-40" />
        </Field>
        <button type="submit" className="h-11 rounded-md border border-border px-4 text-sm hover:bg-muted">
          Ver mes
        </button>
      </form>

      {monthExpenses.length === 0 ? (
        <EmptyState>Sin gastos en {month}.</EmptyState>
      ) : (
        <Card className="divide-y divide-border">
          {monthExpenses.map((e) => (
            <div key={e.id} className="flex items-start justify-between gap-3 px-4 py-3">
              <div className="min-w-0">
                <div className="font-medium">
                  {e.description}
                  {e.totalInstallments > 1 ? ` (cuota ${e.installmentNumber}/${e.totalInstallments})` : ""}
                </div>
                <div className="text-sm text-muted-foreground">
                  {e.card?.name ?? "Varios"} · {e.category?.name ?? "Sin categoría"} ·{" "}
                  <Money amount={e.amount} className="text-sm" /> c/u
                </div>
                <div className="text-xs text-muted-foreground/80">
                  1ra cuota: {e.purchaseMonth}
                  {e.dueDay ? ` · vence el ${e.dueDay}` : ""}
                </div>
              </div>
              <div className="flex shrink-0 gap-1">
                <LinkButton href={`/expenses/${e.id}/edit`} variant="ghost" size="sm">
                  <PencilSimpleIcon size={16} aria-hidden="true" />
                  <span className="sr-only">Editar</span>
                </LinkButton>
                <form action={deleteExpense.bind(null, e.id)}>
                  <Button type="submit" variant="danger" size="sm">
                    <TrashIcon size={16} aria-hidden="true" />
                    <span className="sr-only">Borrar</span>
                  </Button>
                </form>
              </div>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}
