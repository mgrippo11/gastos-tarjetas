import { signIn } from "@/auth";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6">
      <h1 className="text-xl font-semibold">Gastos Tarjetas</h1>
      <form
        action={async () => {
          "use server";
          await signIn("google", { redirectTo: "/" });
        }}
      >
        <button
          type="submit"
          className="rounded-full bg-foreground px-5 py-3 text-background hover:opacity-90"
        >
          Iniciar sesión con Google
        </button>
      </form>
    </div>
  );
}
