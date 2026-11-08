"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

const PRICES = [
  { price: 49, intent: 75, note: "Strongest intent. Healthy volume, so check your margin before you commit." },
  { price: 59, intent: 52, note: "Intent drops. A price between Rs. 49 and Rs. 59 is worth testing, subject to margins." },
  { price: 79, intent: 18, note: "Only a small group would still buy. This price is likely too high for the audience." },
];

export function PriceTest() {
  const [active, setActive] = useState(0);
  const current = PRICES[active];

  return (
    <div className="rounded-3xl border border-line bg-surface p-6 shadow-[0_30px_60px_-40px_rgba(18,23,31,0.35)] sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-ink-soft">Spicy Chips Share</p>
          <p className="font-display text-lg font-semibold">Would you buy it at this price?</p>
        </div>
        <div role="radiogroup" aria-label="Price" className="inline-flex rounded-xl bg-canvas p-1">
          {PRICES.map((p, i) => (
            <button
              key={p.price}
              type="button"
              role="radio"
              aria-checked={active === i}
              onClick={() => setActive(i)}
              className={cn(
                "rounded-lg px-4 py-2 text-sm font-medium tabular-nums transition",
                active === i ? "bg-surface text-brand shadow-sm" : "text-ink-soft hover:text-ink"
              )}
            >
              Rs. {p.price}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-8 grid items-end gap-8 sm:grid-cols-[auto_1fr]">
        <div>
          <p className="font-display text-6xl font-semibold tabular-nums tracking-tight text-brand">
            {current.intent}%
          </p>
          <p className="mt-1 text-sm text-ink-soft">would buy at Rs. {current.price}</p>
        </div>

        <ul className="space-y-3" aria-label="Purchase intent by price">
          {PRICES.map((p, i) => (
            <li key={p.price} className="flex items-center gap-3">
              <span className="w-14 text-sm tabular-nums text-ink-soft">Rs. {p.price}</span>
              <div className="h-3 flex-1 overflow-hidden rounded-full bg-canvas">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-700 ease-out",
                    active === i ? "bg-brand" : "bg-line"
                  )}
                  style={{ width: `${p.intent}%` }}
                />
              </div>
              <span className={cn("w-10 text-right text-sm font-semibold tabular-nums", active === i ? "text-ink" : "text-ink-soft")}>
                {p.intent}%
              </span>
            </li>
          ))}
        </ul>
      </div>

      <p className="mt-8 rounded-2xl bg-brand-tint px-5 py-4 text-sm leading-relaxed text-brand-dark" aria-live="polite">
        <span className="font-semibold">What Validly would tell you: </span>
        {current.note}
      </p>
      <p className="mt-3 text-xs text-ink-soft">Illustrative example, not real market research.</p>
    </div>
  );
}