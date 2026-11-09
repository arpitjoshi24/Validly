"use client";

import { useEffect, useMemo, useState, type ComponentType } from "react";
import { Check, Cookie, CupSoda, Dumbbell, PawPrint, Pencil, Shirt, Sparkles, Tag, UtensilsCrossed } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { INTEREST_SUGGESTIONS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { consumersApi } from "./consumers.api";

const ICONS: Record<string, ComponentType<{ className?: string }>> = {
  Snacks: Cookie,
  Beverages: CupSoda,
  Skincare: Sparkles,
  Fitness: Dumbbell,
  "Home & kitchen": UtensilsCrossed,
  Fashion: Shirt,
  "Pet care": PawPrint,
  Stationery: Pencil,
};

const sameSet = (a: string[], b: string[]) => a.length === b.length && a.every((i) => b.includes(i));

export function ConsumerProfileForm() {
  const [interests, setInterests] = useState<string[]>([]);
  const [saved, setSaved] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    consumersApi
      .getMine()
      .then((p) => {
        const mine = p.interests ?? [];
        setInterests(mine);
        setSaved(mine);
      })
      .catch(() => setLoadFailed(true))
      .finally(() => setLoading(false));
  }, []);

  const dirty = useMemo(() => !sameSet(interests, saved), [interests, saved]);

  const toggle = (item: string) =>
    setInterests((prev) => (prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]));

  async function save() {
    setSaving(true);
    try {
      await consumersApi.updateMine(interests);
      setSaved(interests);
      toast.success("Interests saved");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save your interests");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section
      aria-labelledby="interests-heading"
      className="overflow-hidden rounded-2xl border border-line bg-surface shadow-[0_1px_2px_rgba(18,23,31,0.04)]"
    >
      {/* Header */}
      <div className="flex items-start gap-4 border-b border-line p-6">
        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-brand-tint text-brand">
          <Sparkles className="size-5" />
        </span>
        <div>
          <h2 id="interests-heading" className="text-lg font-semibold">
            What do you like to try?
          </h2>
          <p className="mt-1 text-sm leading-relaxed text-ink-soft">
            We&apos;ll show you new products in these categories first. Pick as many as you like.
          </p>
        </div>
      </div>

      {/* Body */}
      <div className="p-6">
        {loadFailed && (
          <p role="status" className="mb-4 rounded-xl bg-signal-tint px-4 py-3 text-sm text-signal">
            Couldn&apos;t load your saved interests. You can still choose new ones and save.
          </p>
        )}

        {loading ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-[88px] rounded-2xl" />
            ))}
          </div>
        ) : (
          <div role="group" aria-labelledby="interests-heading" className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {INTEREST_SUGGESTIONS.map((item) => {
              const on = interests.includes(item);
              const Icon = ICONS[item] ?? Tag;
              return (
                <button
                  key={item}
                  type="button"
                  aria-pressed={on}
                  onClick={() => toggle(item)}
                  className={cn(
                    "relative flex flex-col items-start gap-3 rounded-2xl border p-4 text-left transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand/15",
                    on
                      ? "border-brand bg-brand-tint"
                      : "border-line bg-surface hover:border-ink-soft/40 hover:bg-canvas"
                  )}
                >
                  <span
                    className={cn(
                      "grid size-10 place-items-center rounded-xl transition-colors",
                      on ? "bg-brand text-white" : "bg-canvas text-ink-soft"
                    )}
                  >
                    <Icon className="size-5" />
                  </span>
                  <span className={cn("text-sm font-medium", on ? "text-brand-dark" : "text-ink")}>{item}</span>
                  <span
                    aria-hidden
                    className={cn(
                      "absolute right-3 top-3 grid size-5 place-items-center rounded-full bg-brand text-white transition-all duration-200",
                      on ? "scale-100 opacity-100" : "scale-50 opacity-0"
                    )}
                  >
                    <Check className="size-3" strokeWidth={3} />
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex flex-col gap-3 border-t border-line bg-canvas/60 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-ink-soft" aria-live="polite">
          {interests.length === 0 ? (
            "Nothing selected yet"
          ) : (
            <>
              <span className="font-semibold text-ink">{interests.length}</span> selected
              <button
                type="button"
                onClick={() => setInterests([])}
                className="ml-3 font-medium text-brand hover:underline"
              >
                Clear all
              </button>
            </>
          )}
        </p>
        <Button onClick={save} loading={saving} disabled={loading || !dirty} className="h-10 sm:min-w-36 text-black">
          {!dirty && saved.length > 0 ? "Saved" : "Save interests"}
        </Button>
      </div>
    </section>
  );
}