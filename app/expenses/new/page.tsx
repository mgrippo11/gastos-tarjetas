import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db/client";
import { cards } from "@/db/schema";
import { ExpenseFields } from "@/components/ExpenseFields";
import { addExpense } from "../actions";

export default async function NewExpensePage() {
  const session = await auth();
  const ownerEmail = session!.user!.email!;

  const [myCards, allCategories] = await Promise.all([
    db.query.cards.findMany({ where: eq(cards.ownerEmail, ownerEmail) }),
    db.query.categories.findMany(),
  ]);

  return (
    <div className="mx-auto max-w-lg p-8">
      <h1 className="mb-6 text-xl font-semibold">Nuevo gasto</h1>

      <form action={addExpense} className="space-y-4">
        <ExpenseFields cards={myCards} categories={allCategories} />
        <button type="submit" className="rounded bg-foreground px-4 py-2 text-background">
          Guardar
        </button>
      </form>
    </div>
  );
}
