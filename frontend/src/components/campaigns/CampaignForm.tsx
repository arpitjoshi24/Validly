"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { listMyProducts } from "@/lib/campaigns";
import type { Campaign, CampaignPayload, Product } from "@/types/campaign";

type VariantRow = { name: string; description: string; price: string };

type Props = {
  mode: "create" | "edit";
  initial?: Campaign;
  submitLabel: string;
  onSubmit: (payload: CampaignPayload) => Promise<void>;
};

const field =
  "mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand";
const label = "block text-sm font-medium";
const MAX_VARIANTS = 5;

export function CampaignForm({ mode, initial, submitLabel, onSubmit }: Props) {
  const [products, setProducts] = useState<Product[]>([]);
  const [productId, setProductId] = useState(initial?.product?.id ?? "");
  const [objective, setObjective] = useState(initial?.objective ?? "");
  const [targetAudience, setTargetAudience] = useState(initial?.targetAudience ?? "");
  const [location, setLocation] = useState(initial?.location ?? "");
  const [durationDays, setDurationDays] = useState(String(initial?.durationDays ?? 14));
  const [variants, setVariants] = useState<VariantRow[]>(
    initial?.variants.length
      ? initial.variants.map((v) => ({ name: v.name, description: v.description ?? "", price: String(v.price) }))
      : [{ name: "", description: "", price: "" }]
  );
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (mode !== "create") return;
    listMyProducts()
      .then((d) => setProducts(d.items))
      .catch((e) => setError(e instanceof Error ? e.message : "Could not load your products."));
  }, [mode]);

  const updateVariant = (i: number, patch: Partial<VariantRow>) =>
    setVariants((rows) => rows.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));

  function validate(): CampaignPayload | string {
    if (mode === "create" && !productId) return "Choose a product for this campaign.";

    const days = Number(durationDays);
    if (!Number.isInteger(days) || days < 1 || days > 60) return "Duration must be a whole number from 1 to 60 days.";

    if (objective.length > 200) return "Objective can be at most 200 characters.";
    if (targetAudience.length > 200) return "Target audience can be at most 200 characters.";
    if (location.length > 100) return "Location can be at most 100 characters.";

    const parsed = [];
    for (const [i, v] of variants.entries()) {
      const n = i + 1;
      const name = v.name.trim();
      const price = Number(v.price);
      if (!name) return `Variant ${n}: add a name.`;
      if (name.length > 60) return `Variant ${n}: name can be at most 60 characters.`;
      if (v.description.trim().length > 200) return `Variant ${n}: description can be at most 200 characters.`;
      if (!v.price.trim() || !Number.isFinite(price) || price <= 0) return `Variant ${n}: enter a price above 0.`;
      if (price > 100000) return `Variant ${n}: price can be at most ₹1,00,000.`;
      if (Math.round(price * 100) / 100 !== price) return `Variant ${n}: price can have at most 2 decimals.`;
      parsed.push({ name, description: v.description.trim() || undefined, price });
    }

    const payload: CampaignPayload = { durationDays: days, variants: parsed };
    if (mode === "create") {
      payload.productId = productId;
      // create mein khaali optional fields bhejte hi nahi
      if (objective.trim()) payload.objective = objective.trim();
      if (targetAudience.trim()) payload.targetAudience = targetAudience.trim();
      if (location.trim()) payload.location = location.trim();
    } else {
      // edit mein empty string bhejte hain taaki field clear ho sake
      payload.objective = objective.trim();
      payload.targetAudience = targetAudience.trim();
      payload.location = location.trim();
    }
    return payload;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const result = validate();
    if (typeof result === "string") return setError(result);

    setSaving(true);
    try {
      await onSubmit(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Try again.");
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-6">
      {error && (
        <div role="alert" className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <Card>
        <h2 className="font-semibold">Campaign details</h2>

        {mode === "create" && (
          <div className="mt-4">
            <label htmlFor="product" className={label}>Product</label>
            <select id="product" value={productId} onChange={(e) => setProductId(e.target.value)} className={field}>
              <option value="">Select a product</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            {products.length === 0 && (
              <p className="mt-1 text-xs text-ink-soft">You have no products yet. Add a product first, then come back.</p>
            )}
          </div>
        )}
        {mode === "edit" && initial?.product && (
          <p className="mt-4 text-sm text-ink-soft">Product: <span className="font-medium text-black">{initial.product.name}</span></p>
        )}

        <div className="mt-4">
          <label htmlFor="objective" className={label}>What do you want to learn?</label>
          <input id="objective" value={objective} onChange={(e) => setObjective(e.target.value)} maxLength={200}
            placeholder="e.g. Which pack size would people buy?" className={field} />
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="audience" className={label}>Target audience</label>
            <input id="audience" value={targetAudience} onChange={(e) => setTargetAudience(e.target.value)} maxLength={200}
              placeholder="e.g. College students" className={field} />
          </div>
          <div>
            <label htmlFor="location" className={label}>Location</label>
            <input id="location" value={location} onChange={(e) => setLocation(e.target.value)} maxLength={100}
              placeholder="e.g. Jaipur" className={field} />
          </div>
        </div>

        <div className="mt-4 sm:w-1/2">
          <label htmlFor="duration" className={label}>Duration (days)</label>
          <input id="duration" type="number" min={1} max={60} value={durationDays}
            onChange={(e) => setDurationDays(e.target.value)} className={field} />
          <p className="mt-1 text-xs text-ink-soft">The countdown starts when you publish.</p>
        </div>
      </Card>

      <Card>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold">Variants</h2>
            <p className="text-sm text-ink-soft">Options people will vote on. Add 1 to {MAX_VARIANTS}.</p>
          </div>
          <button type="button" disabled={variants.length >= MAX_VARIANTS}
            onClick={() => setVariants((r) => [...r, { name: "", description: "", price: "" }])}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium hover:bg-gray-50 disabled:opacity-50">
            Add variant
          </button>
        </div>

        <div className="mt-4 space-y-4">
          {variants.map((v, i) => (
            <div key={i} className="rounded-md border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Variant {i + 1}</p>
                {variants.length > 1 && (
                  <button type="button" onClick={() => setVariants((r) => r.filter((_, idx) => idx !== i))}
                    className="text-sm text-red-600 hover:underline">
                    Remove
                  </button>
                )}
              </div>
              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                <div className="sm:col-span-2">
                  <label htmlFor={`vname-${i}`} className={label}>Name</label>
                  <input id={`vname-${i}`} value={v.name} maxLength={60}
                    onChange={(e) => updateVariant(i, { name: e.target.value })} className={field} />
                </div>
                <div>
                  <label htmlFor={`vprice-${i}`} className={label}>Price (₹)</label>
                  <input id={`vprice-${i}`} type="number" min={0} step="0.01" value={v.price}
                    onChange={(e) => updateVariant(i, { price: e.target.value })} className={field} />
                </div>
              </div>
              <div className="mt-3">
                <label htmlFor={`vdesc-${i}`} className={label}>Description (optional)</label>
                <input id={`vdesc-${i}`} value={v.description} maxLength={200}
                  onChange={(e) => updateVariant(i, { description: e.target.value })} className={field} />
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div className="flex gap-3">
        <button type="submit" disabled={saving}
          className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark disabled:opacity-60">
          {saving ? "Saving..." : submitLabel}
        </button>
        <Link href="/founder/campaigns" className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50">
          Cancel
        </Link>
      </div>
    </form>
  );
}