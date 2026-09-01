import { notFound } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db/client";
import { cards, expenses } from "@/db/schema";
import { ExpenseFields } from "@/components/ExpenseFields";
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
    <div className="mx-auto max-w-lg p-8">
      <h1 className="mb-6 text-xl font-semibold">Editar gasto</h1>

      <form action={updateExpense.bind(null, expense.id)} className="space-y-4">
        <ExpenseFields cards={myCards} categories={allCategories} defaults={expense} />
        <button type="submit" className="rounded bg-foreground px-4 py-2 text-background">
          Guardar
        </button>
      </form>
    </div>
  );
}
