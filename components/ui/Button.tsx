import Link from "next/link";
import type { ComponentProps } from "react";

const VARIANTS = {
  primary: "bg-primary text-primary-foreground hover:opacity-90",
  outline: "border border-border bg-card text-foreground hover:bg-muted",
  ghost: "text-foreground hover:bg-muted",
  danger: "text-destructive hover:bg-destructive/10",
} as const;

const SIZES = {
  default: "h-11 px-4 text-sm", // 44px, touch-target friendly
  sm: "h-8 px-2.5 text-sm",
} as const;

type Variant = keyof typeof VARIANTS;
type Size = keyof typeof SIZES;

function classes(variant: Variant, size: Size, className?: string) {
  return [
    "inline-flex items-center justify-center gap-1.5 rounded-md font-medium",
    "transition-colors duration-150 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
    VARIANTS[variant],
    SIZES[size],
    className,
  ]
    .filter(Boolean)
    .join(" ");
}

type ButtonProps = ComponentProps<"button"> & { variant?: Variant; size?: Size };

export function Button({ variant = "primary", size = "default", className, ...props }: ButtonProps) {
  return <button className={classes(variant, size, className)} {...props} />;
}

type LinkButtonProps = ComponentProps<typeof Link> & { variant?: Variant; size?: Size };

export function LinkButton({ variant = "primary", size = "default", className, ...props }: LinkButtonProps) {
  return <Link className={classes(variant, size, className)} {...props} />;
}
