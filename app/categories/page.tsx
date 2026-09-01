import { db } from "@/db/client";
import { addCategory } from "./actions";

export default async function CategoriesPage() {
  const allCategories = await db.query.categories.findMany();

  return (
    <div className="mx-auto max-w-lg p-8">
      <h1 className="mb-6 text-xl font-semibold">Categorías</h1>

      <form action={addCategory} className="mb-8 flex gap-2">
        <input
          type="text"
          name="name"
          placeholder="Nombre (ej: Mascotas)"
          required
          className="flex-1 rounded border px-3 py-2"
        />
        <button
          type="submit"
          className="rounded bg-foreground px-4 py-2 text-background"
        >
          Agregar
        </button>
      </form>

      <ul className="space-y-2">
        {allCategories.map((c) => (
          <li key={c.id} className="rounded border px-3 py-2">
            {c.name}
          </li>
        ))}
      </ul>
    </div>
  );
}
