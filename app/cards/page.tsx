import Link from "next/link";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db/client";
import { cards } from "@/db/schema";
import { Field } from "@/components/Field";
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

      <form action={addCard} className="mb-8 flex items-end gap-2">
        <div className="flex-1">
          <Field label="Nombre">
            <input
              type="text"
              name="name"
              placeholder="Visa ICBC"
              required
              className="w-full rounded border px-3 py-2"
            />
          </Field>
        </div>
        <div className="w-36">
          <Field label="Día de cierre">
            <input
              type="number"
              name="closingDay"
              placeholder="1-31"
              min={1}
              max={31}
              className="w-full rounded border px-3 py-2"
            />
          </Field>
        </div>
        <button type="submit" className="rounded bg-foreground px-4 py-2 text-background">
          Agregar
        </button>
      </form>

      <ul className="space-y-2">
        {myCards.map((c) => (
          <li key={c.id} className="flex items-center justify-between rounded border px-3 py-2">
            <span>
              {c.name}
              {c.closingDay ? ` — cierra el ${c.closingDay}` : ""}
            </span>
            <Link href={`/cards/${c.id}/edit`} className="text-sm underline">
              Editar
            </Link>
          </li>
        ))}
        {myCards.length === 0 && (
          <li className="text-sm text-zinc-500">Todavía no cargaste tarjetas.</li>
        )}
      </ul>
    </div>
  );
}
