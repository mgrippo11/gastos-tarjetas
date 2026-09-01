import { Field } from "@/components/Field";
import { CardOrDueDayField } from "@/components/CardOrDueDayField";

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
          className="font-money"
        />
      </Field>

      <Field label="Categoría">
        <select name="categoryId" defaultValue={defaults?.categoryId ?? ""}>
          <option value="">Sin categoría</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </Field>

      <CardOrDueDayField
        cards={cards}
        defaultCardId={defaults?.cardId}
        defaultDueDay={defaults?.dueDay}
        defaultTotalInstallments={defaults?.totalInstallments}
        defaultPurchaseMonth={defaults?.purchaseMonth}
      />
    </>
  );
}
