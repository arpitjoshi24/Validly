"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/campaigns/StatusBadge";
import { campaignsApi, fmtDate, inr, timeLeft } from "@/lib/campaigns";
import type { Campaign, CampaignStatus, Pagination } from "@/types/campaign";

const TABS: { label: string; value?: CampaignStatus }[] = [
  { label: "All" },
  { label: "Draft", value: "DRAFT" },
  { label: "Active", value: "ACTIVE" },
  { label: "Closed", value: "CLOSED" },
];

export default function CampaignsPage() {
  const [status, setStatus] = useState<CampaignStatus | undefined>();
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<Campaign[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await campaignsApi.list({ status, page });
      setItems(data.items);
      setPagination(data.pagination);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load campaigns.");
    } finally {
      setLoading(false);
    }
  }, [status, page]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <RoleGuard roles={["FOUNDER"]}>
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Campaigns</h1>
        <Link href="/founder/campaigns/new" className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark">
          New campaign
        </Link>
      </div>

      <div className="mt-6 flex gap-2" role="tablist">
        {TABS.map((t) => (
          <button key={t.label} role="tab" aria-selected={status === t.value}
            onClick={() => { setStatus(t.value); setPage(1); }}
            className={`rounded-md px-3 py-1.5 text-sm font-medium ${
              status === t.value ? "bg-brand text-white" : "border border-gray-300 hover:bg-gray-50"
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {error && <p role="alert" className="mt-4 text-sm text-red-600">{error}</p>}
      {loading && <p className="mt-6 text-sm text-ink-soft">Loading campaigns...</p>}

      {!loading && !error && items.length === 0 && (
        <Card className="mt-6">
          <h2 className="font-semibold">No campaigns here yet</h2>
          <p className="mt-1 text-sm text-ink-soft">Create a campaign to find out which variant of your product people want.</p>
        </Card>
      )}

      <div className="mt-6 space-y-3">
        {items.map((c) => (
          <Link key={c.id} href={`/founder/campaigns/${c.id}`} className="block">
            <Card className="hover:border-brand">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-semibold">{c.product?.name ?? "Untitled product"}</h2>
                  <p className="mt-1 text-sm text-ink-soft">{c.objective || "No objective set"}</p>
                </div>
                <StatusBadge status={c.status} />
              </div>
              <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm text-ink-soft">
                <span>{c.variants.length} variant{c.variants.length === 1 ? "" : "s"}
                  {c.variants.length > 0 && ` from ${inr(Math.min(...c.variants.map((v) => v.price)))}`}</span>
                <span>{c.durationDays} days</span>
                {c.status === "ACTIVE" && <span>{timeLeft(c.endsAt)}</span>}
                {c.status === "CLOSED" && <span>Closed {fmtDate(c.closedAt)}</span>}
                {c.status === "DRAFT" && <span>Created {fmtDate(c.createdAt)}</span>}
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between text-sm">
          <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}
            className="rounded-md border border-gray-300 px-3 py-1.5 hover:bg-gray-50 disabled:opacity-50">Previous</button>
          <span className="text-ink-soft">Page {pagination.page} of {pagination.totalPages}</span>
          <button disabled={page >= pagination.totalPages} onClick={() => setPage((p) => p + 1)}
            className="rounded-md border border-gray-300 px-3 py-1.5 hover:bg-gray-50 disabled:opacity-50">Next</button>
        </div>
      )}
    </RoleGuard>
  );
}