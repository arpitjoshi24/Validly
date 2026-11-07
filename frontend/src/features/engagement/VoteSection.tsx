"use client";

import { formatPrice } from "@/lib/format";
import { INTENT_OPTIONS, type EngagementVariant, type IntentLevel, type MyEngagement } from "./engagement.types";

type Props = {
  variants: EngagementVariant[];
  me: MyEngagement;
  disabled: boolean;
  onVote: (variantId: string) => void;
  onRemoveVote: () => void;
  onIntent: (variantId: string, level: IntentLevel) => void;
};

export function VoteSection({ variants, me, disabled, onVote, onRemoveVote, onIntent }: Props) {
  return (
    <ul className="mt-4 space-y-3">
      {variants.map((v) => {
        const voted = me.votedVariantId === v.id;
        const intent = me.intents.find((i) => i.variantId === v.id)?.level ?? "";
        const price = formatPrice(v.pricePaise);
        return (
          <li key={v.id}
            className={`rounded-md border p-4 ${voted ? "border-brand bg-brand/5" : "border-line"}`}>
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="font-medium">{v.name}</p>
                {v.description && <p className="mt-0.5 text-sm text-ink-soft">{v.description}</p>}
                <p className="mt-1 text-sm font-medium tabular-nums">{price}</p>
              </div>

              {voted ? (
                <button type="button" disabled={disabled} onClick={onRemoveVote}
                  className="shrink-0 rounded-md border border-brand px-3 py-1.5 text-sm font-medium text-brand hover:bg-brand/10 disabled:opacity-60">
                  Your vote. Remove
                </button>
              ) : (
                <button type="button" disabled={disabled} onClick={() => onVote(v.id)}
                  className="shrink-0 rounded-md bg-brand px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-dark disabled:opacity-60">
                  {me.votedVariantId ? "Switch vote to this" : "Vote for this"}
                </button>
              )}
            </div>

            <div className="mt-3">
              <label htmlFor={`intent-${v.id}`} className="block text-xs text-ink-soft">
                Would you buy this at {price}?
              </label>
              <select id={`intent-${v.id}`} value={intent} disabled={disabled}
                onChange={(e) => onIntent(v.id, e.target.value as IntentLevel)}
                className="mt-1 w-full rounded-md border border-line bg-surface px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand disabled:opacity-60 sm:w-64">
                <option value="" disabled>Select an answer</option>
                {INTENT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </li>
        );
      })}
    </ul>
  );
}