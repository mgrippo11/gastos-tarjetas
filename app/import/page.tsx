import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db/client";
import { cards } from "@/db/schema";
import { ImportClient } from "@/components/ImportClient";

export default async function ImportPage() {
  const session = await auth();
  const ownerEmail = session!.user!.email!;

  const [myCards, allCategories] = await Promise.all([
    db.query.cards.findMany({ where: eq(cards.ownerEmail, ownerEmail) }),
    db.query.categories.findMany(),
  ]);

  return (
    <div className="mx-auto max-w-3xl p-8">
      <h1 className="mb-6 text-xl font-semibold">Importar resumen (PDF)</h1>
      <ImportClient cards={myCards} categories={allCategories} />
    </div>
  );
}
