import { and, eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db/client";
import { income } from "@/db/schema";
import { Field } from "@/components/Field";
import { currentMonth } from "@/lib/dates";
import { Card } from "@/components/ui/Card";
import { Money } from "@/components/ui/Money";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { TrashIcon } from "@/components/icons";
import { addIncome, deleteIncome } from "./actions";

export default async function IncomePage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const session = await auth();
  const ownerEmail = session!.user!.email!;
  const month = (await searchParams).month || currentMonth();

  const monthIncome = await db.query.income.findMany({
    where: and(eq(income.ownerEmail, ownerEmail), eq(income.month, month)),
  });

  return (
    <div className="mx-auto max-w-lg p-6">
      <PageHeader title="Ingresos" />

      <form className="mb-6 flex items-end gap-2">
        <Field label="Mes">
          <input type="month" name="month" defaultValue={month} className="w-40" />
        </Field>
        <button type="submit" className="h-11 rounded-md border border-border px-4 text-sm hover:bg-muted">
          Ver mes
        </button>
      </form>

      <Card className="mb-8 p-4">
        <form action={addIncome} className="flex items-end gap-2">
          <input type="hidden" name="month" value={month} />
          <div className="flex-1">
            <Field label="Descripción">
              <input type="text" name="description" placeholder="Sueldo, freelance..." />
            </Field>
          </div>
          <div className="w-36">
            <Field label="Monto">
              <input type="number" name="amount" placeholder="0.00" step="0.01" min="0.01" required />
            </Field>
          </div>
          <Button type="submit">Agregar</Button>
        </form>
      </Card>

      {monthIncome.length === 0 ? (
        <EmptyState>Sin ingresos en {month}.</EmptyState>
      ) : (
        <Card className="divide-y divide-border">
          {monthIncome.map((i) => (
            <div key={i.id} className="flex items-center justify-between px-4 py-3">
              <span>
                {i.description ?? "Ingreso"} — <Money amount={i.amount} tone="positive" />
              </span>
              <form action={deleteIncome.bind(null, i.id)}>
                <Button type="submit" variant="danger" size="sm">
                  <TrashIcon size={16} aria-hidden="true" />
                  <span className="sr-only">Borrar</span>
                </Button>
              </form>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}
