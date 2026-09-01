import { and, eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db/client";
import { income } from "@/db/schema";
import { addIncome, deleteIncome } from "./actions";

function currentMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export default async function IncomePage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const session = await auth();
  const ownerEmail = session!.user!.email!;
  const month = (await searchParams).month || currentMonth();

  const monthIncome = await db.query.income.findMany({
    where: and(eq(income.ownerEmail, ownerEmail), eq(income.month, month)),
  });

  return (
    <div className="mx-auto max-w-lg p-8">
      <h1 className="mb-6 text-xl font-semibold">Ingresos</h1>

      <form className="mb-6 flex gap-2">
        <input type="month" name="month" defaultValue={month} className="rounded border px-3 py-2" />
        <button type="submit" className="rounded border px-4 py-2">
          Ver mes
        </button>
      </form>

      <form action={addIncome} className="mb-8 space-y-2">
        <input type="hidden" name="month" value={month} />
        <div className="flex gap-2">
          <input
            type="text"
            name="description"
            placeholder="Descripción (opcional)"
            className="flex-1 rounded border px-3 py-2"
          />
          <input
            type="number"
            name="amount"
            placeholder="Monto"
            step="0.01"
            min="0.01"
            required
            className="w-36 rounded border px-3 py-2"
          />
        </div>
        <button type="submit" className="rounded bg-foreground px-4 py-2 text-background">
          Agregar
        </button>
      </form>

      <ul className="space-y-2">
        {monthIncome.map((i) => (
          <li key={i.id} className="flex items-center justify-between rounded border px-3 py-2">
            <span>
              {i.description ?? "Ingreso"} — ${i.amount.toLocaleString("es-AR")}
            </span>
            <form action={deleteIncome.bind(null, i.id)}>
              <button type="submit" className="text-red-600 hover:underline">
                Borrar
              </button>
            </form>
          </li>
        ))}
        {monthIncome.length === 0 && (
          <li className="text-sm text-zinc-500">Sin ingresos en {month}.</li>
        )}
      </ul>
    </div>
  );
}
