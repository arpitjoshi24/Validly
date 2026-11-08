"use client";

import { BadgeCheck, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";
import { INTENT_OPTIONS, type EngagementVariant, type IntentLevel, type MyEngagement } from "./engagement.types";

type Props = {
  variants: EngagementVariant[];
  me: MyEngagement;
  disabled: boolean;
  onVote: (variantId: string) => void;
  onRemoveVote: () => void;
  onIntent: (variantId: string, level: IntentLevel) => void;
};

// Colour each answer so a glance shows how strong the intent is
const INTENT_ON: Record<string, string> = {
  DEFINITELY: "border-brand bg-brand text-white",
  PROBABLY: "border-brand/40 bg-brand-tint text-brand-dark",
  MAYBE: "border-signal/40 bg-signal-tint text-signal",
  NO: "border-ink-soft/30 bg-canvas text-ink",
};

export function VoteSection({ variants, me, disabled, onVote, onRemoveVote, onIntent }: Props) {
  return (
    <ul className="mt-5 space-y-4">
      {variants.map((v) => {
        const voted = me.votedVariantId === v.id;
        const intent = me.intents.find((i) => i.variantId === v.id)?.level ?? "";
        const price = formatPrice(v.pricePaise);

        return (
          <li
            key={v.id}
            className={cn(
              "rounded-2xl border p-5 transition",
              voted ? "border-brand bg-brand-tint/50 ring-4 ring-brand/10" : "border-line bg-surface"
            )}
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-display text-lg font-semibold">{v.name}</h3>
                  {voted && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-brand px-2.5 py-0.5 text-xs font-medium text-white">
                      <BadgeCheck className="size-3.5" /> Your vote
                    </span>
                  )}
                </div>
                {v.description && <p className="mt-1 text-sm leading-relaxed text-ink-soft">{v.description}</p>}
                <p className="mt-2 text-xl font-semibold tabular-nums">{price}</p>
              </div>

              {voted ? (
                <Button variant="secondary" className="h-10 shrink-0" disabled={disabled} onClick={onRemoveVote}>
                  Remove vote
                </Button>
              ) : (
                <Button className="h-10 shrink-0" disabled={disabled} onClick={() => onVote(v.id)}>
                  <Check className="size-4" />
                  {me.votedVariantId ? "Switch vote here" : "Vote for this"}
                </Button>
              )}
            </div>

            <div className="mt-5 border-t border-line pt-4">
              <p id={`intent-${v.id}`} className="text-sm font-medium">
                Would you buy this at {price}?
              </p>
              <div role="radiogroup" aria-labelledby={`intent-${v.id}`} className="mt-2.5 flex flex-wrap gap-2">
                {INTENT_OPTIONS.map((o) => {
                  const on = intent === o.value;
                  return (
                    <button
                      key={o.value}
                      type="button"
                      role="radio"
                      aria-checked={on}
                      disabled={disabled}
                      onClick={() => onIntent(v.id, o.value as IntentLevel)}
                      className={cn(
                        "rounded-full border px-4 py-1.5 text-sm font-medium transition disabled:opacity-60",
                        on
                          ? (INTENT_ON[o.value] ?? "border-brand bg-brand-tint text-brand-dark")
                          : "border-line bg-surface text-ink-soft hover:border-ink-soft/40 hover:bg-canvas hover:text-ink"
                      )}
                    >
                      {o.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}