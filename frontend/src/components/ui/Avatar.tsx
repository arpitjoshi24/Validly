import { cn } from "@/lib/utils";

export function Avatar({ name, size = "md" }: { name: string; size?: "sm" | "md" }) {
  const initials =
    name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase()).join("") || "?";

  return (
    <span
      aria-hidden="true"
      className={cn(
        "grid shrink-0 place-items-center rounded-full bg-brand-tint font-medium text-brand-dark",
        size === "sm" ? "size-8 text-xs" : "size-10 text-sm"
      )}
    >
      {initials}
    </span>
  );
}