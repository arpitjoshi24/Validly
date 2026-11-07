"use client";

import { useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { CATEGORIES, type ProductInput } from "@/lib/products";
import type { Product } from "@/types/campaign";

type Props = {
  initial?: Product;
  submitLabel: string;
  onSubmit: (values: ProductInput) => Promise<void>;
  onCancel?: () => void;
};

const field =
  "mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand";
const label = "block text-sm font-medium";

export function ProductForm({ initial, submitLabel, onSubmit, onCancel }: Props) {
  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [category, setCategory] = useState(initial?.category ?? "");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const n = name.trim();
    const d = description.trim();
    if (n.length < 2 || n.length > 120) return setError("Product name must be 2 to 120 characters.");
    if (d.length < 10 || d.length > 2000) return setError("Description must be 10 to 2000 characters.");
    if (!category) return setError("Choose a category.");

    setSaving(true);
    try {
      await onSubmit({ name: n, description: d, category });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card className="space-y-4">
        {error && (
          <div role="alert" className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="name" className={label}>Product name</label>
          <input id="name" value={name} onChange={(e) => setName(e.target.value)} maxLength={120}
            placeholder="e.g. Spicy Chips" className={field} />
        </div>

        <div>
          <label htmlFor="category" className={label}>Category</label>
          <select id="category" value={category} onChange={(e) => setCategory(e.target.value)} className={field}>
            <option value="">Select a category</option>
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="description" className={label}>Description</label>
          <textarea id="description" rows={5} value={description} onChange={(e) => setDescription(e.target.value)}
            maxLength={2000} placeholder="What is it, who is it for, and what makes it different?" className={field} />
          <p className="mt-1 text-xs text-ink-soft">{description.trim().length} / 2000</p>
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={saving}
            className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark disabled:opacity-60">
            {saving ? "Saving..." : submitLabel}
          </button>
          {onCancel ? (
            <button type="button" onClick={onCancel}
              className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50">
              Cancel
            </button>
          ) : (
            <Link href="/founder/products" className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50">
              Cancel
            </Link>
          )}
        </div>
      </Card>
    </form>
  );
}