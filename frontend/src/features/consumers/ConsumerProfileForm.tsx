"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { INTEREST_SUGGESTIONS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { consumersApi } from "./consumers.api";

export function ConsumerProfileForm() {
  const [interests, setInterests] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    consumersApi
      .getMine()
      .then((p) => setInterests(p.interests ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const toggle = (item: string) =>
    setInterests((prev) => (prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]));

  async function save() {
    setSaving(true);
    try {
      await consumersApi.updateMine(interests);
      toast.success("Interests saved");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save your interests");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <Spinner className="mx-auto mt-16 size-6 text-brand" />;

  return (
    <Card>
      <h2 className="text-lg font-semibold">What do you like to try?</h2>
      <p className="mb-5 mt-1 text-sm text-ink-soft">We'll show you new products in these categories first.</p>
      <div className="mb-6 flex flex-wrap gap-2">
        {INTEREST_SUGGESTIONS.map((item) => {
          const on = interests.includes(item);
          return (
            <button
              key={item}
              type="button"
              aria-pressed={on}
              onClick={() => toggle(item)}
              className={cn(
                "rounded-full border px-4 py-1.5 text-sm transition-colors",
                on ? "border-brand bg-brand-tint text-brand-dark" : "border-line bg-surface text-ink-soft hover:bg-canvas"
              )}
            >
              {item}
            </button>
          );
        })}
      </div>
      <Button onClick={save} loading={saving}>Save interests</Button>
    </Card>
  );
}