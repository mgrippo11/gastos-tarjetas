import { redirect } from "next/navigation";
import { auth, isAdminEmail } from "@/auth";
import { db } from "@/db/client";
import { addUser, removeUser } from "./actions";

export default async function AdminUsersPage() {
  const session = await auth();
  if (!isAdminEmail(session?.user?.email)) redirect("/");

  const allowedUsers = await db.query.users.findMany();

  return (
    <div className="mx-auto max-w-lg p-8">
      <h1 className="mb-6 text-xl font-semibold">Usuarios permitidos</h1>

      <form action={addUser} className="mb-8 flex gap-2">
        <input
          type="email"
          name="email"
          placeholder="email@gmail.com"
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
        <li className="flex items-center justify-between rounded border px-3 py-2 text-sm text-zinc-500">
          {process.env.ADMIN_EMAIL} (admin, fijo)
        </li>
        {allowedUsers.map((u) => (
          <li
            key={u.email}
            className="flex items-center justify-between rounded border px-3 py-2"
          >
            {u.email}
            <form action={removeUser.bind(null, u.email)}>
              <button type="submit" className="text-red-600 hover:underline">
                Quitar
              </button>
            </form>
          </li>
        ))}
      </ul>
    </div>
  );
}
