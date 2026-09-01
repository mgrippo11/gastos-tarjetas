/** Monto en ARS, fuente monoespaciada (tabular-nums) para que las cifras alineen. */
export function Money({
  amount,
  tone = "neutral",
  className,
}: {
  amount: number;
  tone?: "neutral" | "positive" | "negative";
  className?: string;
}) {
  const toneClass =
    tone === "positive" ? "text-accent" : tone === "negative" ? "text-destructive" : "";

  return (
    <span className={["font-money", toneClass, className].filter(Boolean).join(" ")}>
      ${amount.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
    </span>
  );
}
