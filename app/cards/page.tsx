import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db/client";
import { cards } from "@/db/schema";
import { addCard } from "./actions";

export default async function CardsPage() {
  const session = await auth();
  const ownerEmail = session!.user!.email!;
  const myCards = await db.query.cards.findMany({
    where: eq(cards.ownerEmail, ownerEmail),
  });

  return (
    <div className="mx-auto max-w-lg p-8">
      <h1 className="mb-6 text-xl font-semibold">Tarjetas</h1>

      <form action={addCard} className="mb-8 flex gap-2">
        <input
          type="text"
          name="name"
          placeholder="Nombre (ej: Visa ICBC)"
          required
          className="flex-1 rounded border px-3 py-2"
        />
        <input
          type="number"
          name="closingDay"
          placeholder="Día de cierre"
          min={1}
          max={31}
          className="w-36 rounded border px-3 py-2"
        />
        <button
          type="submit"
          className="rounded bg-foreground px-4 py-2 text-background"
        >
          Agregar
        </button>
      </form>

      <ul className="space-y-2">
        {myCards.map((c) => (
          <li key={c.id} className="rounded border px-3 py-2">
            {c.name}
            {c.closingDay ? ` — cierra el ${c.closingDay}` : ""}
          </li>
        ))}
        {myCards.length === 0 && (
          <li className="text-sm text-zinc-500">Todavía no cargaste tarjetas.</li>
        )}
      </ul>
    </div>
  );
}
