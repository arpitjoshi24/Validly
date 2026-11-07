import { cn } from "@/lib/utils";

type Tone = "neutral" | "success" | "warning" | "danger";

const tones: Record<Tone, string> = {
  neutral: "bg-canvas text-ink-soft",
  success: "bg-brand-tint text-brand-dark",
  warning: "bg-signal-tint text-signal",
  danger: "bg-danger-tint text-danger",
};

const dots: Record<Tone, string> = {
  neutral: "bg-ink-soft",
  success: "bg-brand",
  warning: "bg-signal",
  danger: "bg-danger",
};

export function Badge({
  tone = "neutral",
  dot = false,
  children,
}: {
  tone?: Tone;
  dot?: boolean;
  children: React.ReactNode;
}) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium", tones[tone])}>
      {dot && <span aria-hidden="true" className={cn("size-1.5 rounded-full", dots[tone])} />}
      {children}
    </span>
  );
}