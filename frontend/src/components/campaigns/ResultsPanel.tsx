"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { campaignsApi, fmtDate, inr, type CampaignResults } from "@/lib/campaigns";

const LEVELS = [
  ["DEFINITELY", "Definitely"],
  ["PROBABLY", "Probably"],
  ["MAYBE", "Maybe"],
  ["NO", "No"],
] as const;

export function ResultsPanel({ campaignId }: { campaignId: string }) {
  const [data, setData] = useState<CampaignResults | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    setError(null);
    campaignsApi
      .results(campaignId)
      .then(setData)
      .catch((e) => setError(e instanceof Error ? e.message : "Could not load results."));
  }, [campaignId, tick]);

  if (error) {
    return (
      <Card className="mt-6">
        <h2 className="font-semibold">Results</h2>
        <p role="alert" className="mt-2 text-sm text-red-600">{error}</p>
      </Card>
    );
  }
  if (!data) return <p className="mt-6 text-sm text-ink-soft">Loading results...</p>;

  const topVotes = Math.max(0, ...data.variants.map((v) => v.votes));
  const stats = [
    ["Views", data.totals.views],
    ["Votes", data.totals.votes],
    ["Likes", data.totals.likes],
    ["Comments", data.totals.comments],
    ["Waitlist", data.totals.waitlist],
  ] as const;

  return (
    <>
      <Card className="mt-6">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Results</h2>
          <button type="button" onClick={() => setTick((t) => t + 1)}
            className="rounded-md border border-gray-300 px-3 py-1 text-sm hover:bg-gray-50">
            Refresh
          </button>
        </div>

        <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
          {stats.map(([label, value]) => (
            <div key={label} className="rounded-md border border-gray-200 p-3">
              <dt className="text-xs text-ink-soft">{label}</dt>
              <dd className="mt-1 text-2xl font-semibold tabular-nums">{value}</dd>
            </div>
          ))}
        </dl>

        <h3 className="mt-6 text-sm font-semibold">Votes by variant</h3>
        {data.totals.votes === 0 && <p className="mt-1 text-sm text-ink-soft">No votes yet.</p>}
        <ul className="mt-3 space-y-5">
          {data.variants.map((v) => (
            <li key={v.id}>
              <div className="flex items-baseline justify-between gap-3">
                <p className="font-medium">
                  {v.name} <span className="font-normal text-ink-soft">at {inr(v.price)}</span>
                  {v.votes > 0 && v.votes === topVotes && (
                    <span className="ml-2 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">Leading</span>
                  )}
                </p>
                <p className="text-sm tabular-nums">{v.votes} vote{v.votes === 1 ? "" : "s"} ({v.votePercent}%)</p>
              </div>
              <div className="mt-1.5 h-2 rounded bg-gray-100">
                <div className="h-2 rounded bg-brand" style={{ width: `${v.votePercent}%` }} />
              </div>
              <p className="mt-1.5 text-xs text-ink-soft">
                Would they buy it?{" "}
                {LEVELS.map(([key, label], i) => (
                  <span key={key}>
                    {i > 0 && ", "}
                    {label} {v.intents[key]}
                  </span>
                ))}
              </p>
            </li>
          ))}
        </ul>
      </Card>

      <Card className="mt-6">
        <h2 className="font-semibold">Comments ({data.totals.comments})</h2>
        {data.comments.length === 0 && <p className="mt-2 text-sm text-ink-soft">No comments yet.</p>}
        <ul className="mt-3 max-h-96 space-y-3 overflow-y-auto">
          {data.comments.map((c) => (
            <li key={c.id} className="rounded-md border border-gray-100 p-3">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium">{c.userName}</p>
                <p className="text-xs text-ink-soft">{fmtDate(c.createdAt)}</p>
              </div>
              <p className="mt-1 whitespace-pre-line text-sm">{c.content}</p>
            </li>
          ))}
        </ul>
      </Card>
    </>
  );
}