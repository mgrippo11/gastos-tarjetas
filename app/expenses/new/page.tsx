import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db/client";
import { cards } from "@/db/schema";
import { ExpenseFields } from "@/components/ExpenseFields";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import { addExpense } from "../actions";

export default async function NewExpensePage() {
  const session = await auth();
  const ownerEmail = session!.user!.email!;

  const [myCards, allCategories] = await Promise.all([
    db.query.cards.findMany({ where: eq(cards.ownerEmail, ownerEmail) }),
    db.query.categories.findMany(),
  ]);

  return (
    <div className="mx-auto max-w-lg p-6">
      <PageHeader title="Nuevo gasto" />

      <Card className="p-6">
        <form action={addExpense} className="space-y-4">
          <ExpenseFields cards={myCards} categories={allCategories} />
          <Button type="submit" className="w-full">
            Guardar
          </Button>
        </form>
      </Card>
    </div>
  );
}
