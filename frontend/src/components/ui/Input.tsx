import { forwardRef, useId, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, Props>(function Input(
  { label, error, hint, className, ...props },
  ref
) {
  const id = useId();
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-sm font-medium">{label}</label>
      <input
        id={id}
        ref={ref}
        aria-invalid={!!error}
        className={cn(
          "h-10 w-full rounded-md border bg-surface px-3 text-sm placeholder:text-ink-soft/60 disabled:bg-canvas",
          error ? "border-danger" : "border-line",
          className
        )}
        {...props}
      />
      {hint && !error && <p className="text-xs text-ink-soft">{hint}</p>}
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
});