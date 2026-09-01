import { notFound } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db/client";
import { cards } from "@/db/schema";
import { Field } from "@/components/Field";
import { updateCard } from "../../actions";

export default async function EditCardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  const ownerEmail = session!.user!.email!;
  const id = Number((await params).id);

  const card = await db.query.cards.findFirst({
    where: and(eq(cards.id, id), eq(cards.ownerEmail, ownerEmail)),
  });
  if (!card) notFound();

  return (
    <div className="mx-auto max-w-lg p-8">
      <h1 className="mb-6 text-xl font-semibold">Editar tarjeta</h1>

      <form action={updateCard.bind(null, card.id)} className="space-y-4">
        <Field label="Nombre">
          <input
            type="text"
            name="name"
            defaultValue={card.name}
            required
            className="w-full rounded border px-3 py-2"
          />
        </Field>
        <Field label="Día de cierre (cambia mes a mes, actualizalo cuando corresponda)">
          <input
            type="number"
            name="closingDay"
            defaultValue={card.closingDay ?? ""}
            min={1}
            max={31}
            className="w-full rounded border px-3 py-2"
          />
        </Field>
        <button type="submit" className="rounded bg-foreground px-4 py-2 text-background">
          Guardar
        </button>
      </form>
    </div>
  );
}
