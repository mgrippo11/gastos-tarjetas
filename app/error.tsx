"use client";

import { Button } from "@/components/ui/Button";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center gap-4 p-8 text-center">
      <h1 className="text-lg font-semibold">Algo salió mal</h1>
      <p className="text-sm text-muted-foreground">{error.message || "Revisá los datos e intentá de nuevo."}</p>
      <Button onClick={() => reset()}>Reintentar</Button>
    </div>
  );
}
