import { notFound } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db/client";
import { cards, expenses } from "@/db/schema";
import { ExpenseFields } from "@/components/ExpenseFields";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import { updateExpense } from "../../actions";

export default async function EditExpensePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  const ownerEmail = session!.user!.email!;
  const id = Number((await params).id);

  const [expense, myCards, allCategories] = await Promise.all([
    db.query.expenses.findFirst({
      where: and(eq(expenses.id, id), eq(expenses.ownerEmail, ownerEmail)),
    }),
    db.query.cards.findMany({ where: eq(cards.ownerEmail, ownerEmail) }),
    db.query.categories.findMany(),
  ]);
  if (!expense) notFound();

  return (
    <div className="mx-auto max-w-lg p-6">
      <PageHeader title="Editar gasto" />

      <Card className="p-6">
        <form action={updateExpense.bind(null, expense.id)} className="space-y-4">
          <ExpenseFields cards={myCards} categories={allCategories} defaults={expense} />
          <Button type="submit" className="w-full">
            Guardar
          </Button>
        </form>
      </Card>
    </div>
  );
}
