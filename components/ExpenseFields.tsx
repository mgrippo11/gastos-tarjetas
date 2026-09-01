import { Field } from "@/components/Field";
import { currentMonth } from "@/lib/dates";

type Card = { id: number; name: string };
type Category = { id: number; name: string };

export function ExpenseFields({
  cards,
  categories,
  defaults,
}: {
  cards: Card[];
  categories: Category[];
  defaults?: {
    description?: string;
    amount?: number;
    categoryId?: number | null;
    cardId?: number | null;
    dueDay?: number | null;
    totalInstallments?: number;
    purchaseMonth?: string;
  };
}) {
  return (
    <>
      <Field label="Descripción">
        <input
          type="text"
          name="description"
          placeholder="Spotify, supermercado..."
          defaultValue={defaults?.description}
          required
          className="w-full rounded border px-3 py-2"
        />
      </Field>

      <Field label="Monto de cada cuota (ARS)">
        <input
          type="number"
          name="amount"
          placeholder="0.00"
          step="0.01"
          min="0.01"
          defaultValue={defaults?.amount}
          required
          className="w-full rounded border px-3 py-2"
        />
      </Field>

      <Field label="Categoría">
        <select name="categoryId" defaultValue={defaults?.categoryId ?? ""} className="w-full rounded border px-3 py-2">
          <option value="">Sin categoría</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Tarjeta">
        <select name="cardId" defaultValue={defaults?.cardId ?? ""} className="w-full rounded border px-3 py-2">
          <option value="">Varios (efectivo / débito)</option>
          {cards.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Día de vencimiento (solo si es 'Varios')">
        <input
          type="number"
          name="dueDay"
          placeholder="1-31"
          min={1}
          max={31}
          defaultValue={defaults?.dueDay ?? undefined}
          className="w-full rounded border px-3 py-2"
        />
      </Field>

      <div className="flex gap-2">
        <div className="w-32">
          <Field label="Cuotas">
            <input
              type="number"
              name="totalInstallments"
              defaultValue={defaults?.totalInstallments ?? 1}
              min={1}
              required
              className="w-full rounded border px-3 py-2"
            />
          </Field>
        </div>
        <div className="flex-1">
          <Field label="Mes de la 1ra cuota">
            <input
              type="month"
              name="purchaseMonth"
              defaultValue={defaults?.purchaseMonth ?? currentMonth()}
              required
              className="w-full rounded border px-3 py-2"
            />
          </Field>
        </div>
      </div>
    </>
  );
}
