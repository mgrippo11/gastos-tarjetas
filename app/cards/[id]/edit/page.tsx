import { notFound } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db/client";
import { cards } from "@/db/schema";
import { Field } from "@/components/Field";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
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
    <div className="mx-auto max-w-lg p-6">
      <PageHeader title="Editar tarjeta" />

      <Card className="p-6">
        <form action={updateCard.bind(null, card.id)} className="space-y-4">
          <Field label="Nombre">
            <input type="text" name="name" defaultValue={card.name} required />
          </Field>
          <Field label="Día de cierre (cambia mes a mes, actualizalo cuando corresponda)">
            <input type="number" name="closingDay" defaultValue={card.closingDay ?? ""} min={1} max={31} />
          </Field>
          <Button type="submit" className="w-full">
            Guardar
          </Button>
        </form>
      </Card>
    </div>
  );
}
