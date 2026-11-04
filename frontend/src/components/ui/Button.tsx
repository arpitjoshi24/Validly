import { cn } from "@/lib/utils";
import { Spinner } from "./Spinner";
import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  loading?: boolean;
}

const variants: Record<Variant, string> = {
  primary: "bg-brand text-white hover:bg-brand-dark",
  secondary: "bg-surface text-ink border border-line hover:bg-canvas",
  ghost: "text-ink-soft hover:bg-canvas",
  danger: "bg-danger text-white hover:opacity-90",
};

export function Button({ variant = "primary", loading, disabled, className, children, ...props }: Props) {
  return (
    <button
      disabled={disabled || loading}
      className={cn(
        "inline-flex h-10 items-center justify-center gap-2 rounded-md px-4 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60",
        variants[variant],
        className
      )}
      {...props}
    >
      {loading && <Spinner className="size-4" />}
      {children}
    </button>
  );
}