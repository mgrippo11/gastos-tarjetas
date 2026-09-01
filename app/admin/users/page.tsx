import { redirect } from "next/navigation";
import { auth, isAdminEmail } from "@/auth";
import { db } from "@/db/client";
import { Field } from "@/components/Field";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { TrashIcon } from "@/components/icons";
import { addUser, removeUser } from "./actions";

export default async function AdminUsersPage() {
  const session = await auth();
  if (!isAdminEmail(session?.user?.email)) redirect("/");

  const allowedUsers = await db.query.users.findMany();

  return (
    <div className="mx-auto max-w-lg p-6">
      <PageHeader title="Usuarios permitidos" />

      <Card className="mb-8 p-4">
        <form action={addUser} className="flex items-end gap-2">
          <div className="flex-1">
            <Field label="Email de Google">
              <input type="email" name="email" placeholder="email@gmail.com" required />
            </Field>
          </div>
          <Button type="submit">Agregar</Button>
        </form>
      </Card>

      <Card className="divide-y divide-border">
        <div className="flex items-center justify-between px-4 py-3 text-sm text-muted-foreground">
          {process.env.ADMIN_EMAIL} (admin, fijo)
        </div>
        {allowedUsers.map((u) => (
          <div key={u.email} className="flex items-center justify-between px-4 py-3">
            {u.email}
            <form action={removeUser.bind(null, u.email)}>
              <Button type="submit" variant="danger" size="sm">
                <TrashIcon size={16} aria-hidden="true" />
                Quitar
              </Button>
            </form>
          </div>
        ))}
      </Card>
    </div>
  );
}
