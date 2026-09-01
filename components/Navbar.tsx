import { auth, isAdminEmail, signOut } from "@/auth";
import { NavLinks } from "@/components/NavLinks";
import { SignOutIcon } from "@/components/icons";

export async function Navbar() {
  const session = await auth();
  if (!session?.user?.email) return null;

  return (
    <nav className="sticky top-0 z-10 flex flex-wrap items-center gap-2 border-b border-border bg-card px-4 py-2">
      <NavLinks isAdmin={isAdminEmail(session.user.email)} />
      <form
        action={async () => {
          "use server";
          await signOut({ redirectTo: "/login" });
        }}
        className="ml-auto"
      >
        <button
          type="submit"
          title={session.user.email}
          className="flex h-11 cursor-pointer items-center gap-1.5 rounded-md px-3 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <SignOutIcon size={18} aria-hidden="true" />
          Salir
        </button>
      </form>
    </nav>
  );
}
