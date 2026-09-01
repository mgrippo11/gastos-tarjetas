export function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={["rounded-lg border border-border bg-card text-card-foreground", className]
        .filter(Boolean)
        .join(" ")}
      {...props}
    />
  );
}
