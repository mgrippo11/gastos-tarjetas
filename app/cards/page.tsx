import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db/client";
import { cards } from "@/db/schema";
import { Field } from "@/components/Field";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button, LinkButton } from "@/components/ui/Button";
import { CreditCardIcon, PencilSimpleIcon } from "@/components/icons";
import { addCard } from "./actions";

export default async function CardsPage() {
  const session = await auth();
  const ownerEmail = session!.user!.email!;
  const myCards = await db.query.cards.findMany({
    where: eq(cards.ownerEmail, ownerEmail),
  });

  return (
    <div className="mx-auto max-w-lg p-6">
      <PageHeader title="Tarjetas" />

      <Card className="mb-8 p-4">
        <form action={addCard} className="flex items-end gap-2">
          <div className="flex-1">
            <Field label="Nombre">
              <input type="text" name="name" placeholder="Visa ICBC" required />
            </Field>
          </div>
          <div className="w-36">
            <Field label="Día de cierre">
              <input type="number" name="closingDay" placeholder="1-31" min={1} max={31} />
            </Field>
          </div>
          <Button type="submit">Agregar</Button>
        </form>
      </Card>

      {myCards.length === 0 ? (
        <EmptyState>Todavía no cargaste tarjetas.</EmptyState>
      ) : (
        <Card className="divide-y divide-border">
          {myCards.map((c) => (
            <div key={c.id} className="flex items-center justify-between px-4 py-3">
              <span className="flex items-center gap-2">
                <CreditCardIcon size={18} className="text-muted-foreground" aria-hidden="true" />
                {c.name}
                {c.closingDay ? ` — cierra el ${c.closingDay}` : ""}
              </span>
              <LinkButton href={`/cards/${c.id}/edit`} variant="ghost" size="sm">
                <PencilSimpleIcon size={16} aria-hidden="true" />
                <span className="sr-only">Editar</span>
              </LinkButton>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}
