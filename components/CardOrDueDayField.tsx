"use client";

import { useState } from "react";
import { Field } from "@/components/Field";

type Card = { id: number; name: string };

export function CardOrDueDayField({
  cards,
  defaultCardId,
  defaultDueDay,
}: {
  cards: Card[];
  defaultCardId?: number | null;
  defaultDueDay?: number | null;
}) {
  const [cardId, setCardId] = useState(defaultCardId ? String(defaultCardId) : "");
  const isVarios = cardId === "";

  return (
    <>
      <Field label="Tarjeta">
        <select name="cardId" value={cardId} onChange={(e) => setCardId(e.target.value)}>
          <option value="">Varios (efectivo / débito)</option>
          {cards.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </Field>

      {isVarios && (
        <Field label="Día de vencimiento">
          <input
            type="number"
            name="dueDay"
            placeholder="1-31"
            min={1}
            max={31}
            defaultValue={defaultDueDay ?? undefined}
          />
        </Field>
      )}
    </>
  );
}
