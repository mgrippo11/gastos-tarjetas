import { db } from "@/db/client";
import { Field } from "@/components/Field";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { TagIcon } from "@/components/icons";
import { addCategory } from "./actions";

export default async function CategoriesPage() {
  const allCategories = await db.query.categories.findMany();

  return (
    <div className="mx-auto max-w-lg p-6">
      <PageHeader title="Categorías" />

      <Card className="mb-8 p-4">
        <form action={addCategory} className="flex items-end gap-2">
          <div className="flex-1">
            <Field label="Nombre">
              <input type="text" name="name" placeholder="Mascotas" required />
            </Field>
          </div>
          <Button type="submit">Agregar</Button>
        </form>
      </Card>

      {allCategories.length === 0 ? (
        <EmptyState>Sin categorías todavía.</EmptyState>
      ) : (
        <div className="flex flex-wrap gap-2">
          {allCategories.map((c) => (
            <span
              key={c.id}
              className="flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-sm"
            >
              <TagIcon size={14} className="text-muted-foreground" aria-hidden="true" />
              {c.name}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
