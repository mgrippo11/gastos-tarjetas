import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db/client";
import { cards } from "@/db/schema";
import { addExpense } from "../actions";

function currentMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

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
        <input
          type="text"
          name="description"
          placeholder="Descripción"
          required
          className="w-full rounded border px-3 py-2"
        />

        <input
          type="number"
          name="amount"
          placeholder="Monto de cada cuota (ARS)"
          step="0.01"
          min="0.01"
          required
          className="w-full rounded border px-3 py-2"
        />

        <select name="categoryId" className="w-full rounded border px-3 py-2">
          <option value="">Sin categoría</option>
          {allCategories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <select name="cardId" className="w-full rounded border px-3 py-2">
          <option value="">Vario (efectivo / débito)</option>
          {myCards.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <input
          type="number"
          name="dueDay"
          placeholder="Día de vencimiento (solo si es 'Vario')"
          min={1}
          max={31}
          className="w-full rounded border px-3 py-2"
        />

        <div className="flex gap-2">
          <input
            type="number"
            name="totalInstallments"
            defaultValue={1}
            min={1}
            required
            className="w-32 rounded border px-3 py-2"
          />
          <input
            type="month"
            name="purchaseMonth"
            defaultValue={currentMonth()}
            required
            className="flex-1 rounded border px-3 py-2"
          />
        </div>

        <button
          type="submit"
          className="rounded bg-foreground px-4 py-2 text-background"
        >
          Guardar
        </button>
      </form>
    </div>
  );
}
