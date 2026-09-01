import Link from "next/link";
import { auth, isAdminEmail, signOut } from "@/auth";

const LINKS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/expenses", label: "Gastos" },
  { href: "/import", label: "Importar PDF" },
  { href: "/income", label: "Ingresos" },
  { href: "/cards", label: "Tarjetas" },
  { href: "/categories", label: "Categorías" },
];

export async function Navbar() {
  const session = await auth();
  if (!session?.user?.email) return null;

  return (
    <nav className="flex flex-wrap items-center gap-4 border-b px-4 py-3 text-sm">
      {LINKS.map((l) => (
        <Link key={l.href} href={l.href} className="hover:underline">
          {l.label}
        </Link>
      ))}
      {isAdminEmail(session.user.email) && (
        <Link href="/admin/users" className="hover:underline">
          Usuarios
        </Link>
      )}
      <form
        action={async () => {
          "use server";
          await signOut({ redirectTo: "/login" });
        }}
        className="ml-auto"
      >
        <button type="submit" className="text-zinc-500 hover:underline">
          Salir ({session.user.email})
        </button>
      </form>
    </nav>
  );
}
