"use client";

import { useState } from "react";
import { Field } from "@/components/Field";
import { currentMonth } from "@/lib/dates";

type Card = { id: number; name: string };

export function CardOrDueDayField({
  cards,
  defaultCardId,
  defaultDueDay,
  defaultTotalInstallments,
  defaultPurchaseMonth,
}: {
  cards: Card[];
  defaultCardId?: number | null;
  defaultDueDay?: number | null;
  defaultTotalInstallments?: number;
  defaultPurchaseMonth?: string;
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

      {isVarios ? (
        <>
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
          {/* Varios = pago único, sin cuotas */}
          <input type="hidden" name="totalInstallments" value={1} />
        </>
      ) : (
        <div className="w-32">
          <Field label="Cuotas">
            <input
              type="number"
              name="totalInstallments"
              defaultValue={defaultTotalInstallments ?? 1}
              min={1}
              required
            />
          </Field>
        </div>
      )}

      <Field label={isVarios ? "Mes" : "Mes de la 1ra cuota"}>
        <input
          type="month"
          name="purchaseMonth"
          defaultValue={defaultPurchaseMonth ?? currentMonth()}
          required
        />
      </Field>
    </>
  );
}
