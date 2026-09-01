import { signIn } from "@/auth";
import { Card } from "@/components/ui/Card";
import { ReceiptIcon } from "@/components/icons";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-muted p-4">
      <div className="flex items-center gap-2 text-lg font-semibold">
        <ReceiptIcon size={28} weight="fill" className="text-primary" aria-hidden="true" />
        Gastos Tarjetas
      </div>

      <Card className="w-full max-w-sm p-8 text-center">
        <p className="mb-6 text-sm text-muted-foreground">
          Control de gastos de tarjetas, ingresos y varios.
        </p>
        <form
          action={async () => {
            "use server";
            await signIn("google", { redirectTo: "/" });
          }}
        >
          <button
            type="submit"
            className="flex h-11 w-full cursor-pointer items-center justify-center gap-3 rounded-md border border-border bg-card px-5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
              <path
                fill="#4285F4"
                d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.9c1.7-1.57 2.7-3.88 2.7-6.62z"
              />
              <path
                fill="#34A853"
                d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.8.54-1.84.86-3.06.86-2.35 0-4.34-1.59-5.05-3.72H.96v2.33A9 9 0 0 0 9 18z"
              />
              <path
                fill="#FBBC05"
                d="M3.95 10.7A5.4 5.4 0 0 1 3.67 9c0-.59.1-1.17.28-1.7V4.97H.96A9 9 0 0 0 0 9c0 1.45.35 2.83.96 4.03l2.99-2.33z"
              />
              <path
                fill="#EA4335"
                d="M9 3.58c1.32 0 2.51.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.97l2.99 2.33C4.66 5.17 6.65 3.58 9 3.58z"
              />
            </svg>
            Iniciar sesión con Google
          </button>
        </form>
      </Card>
    </div>
  );
}
