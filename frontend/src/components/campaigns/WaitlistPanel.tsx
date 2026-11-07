"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { campaignsApi, fmtDate, type WaitlistResponse } from "@/lib/campaigns";

export function WaitlistPanel({ campaignId }: { campaignId: string }) {
  const [page, setPage] = useState(1);
  const [data, setData] = useState<WaitlistResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setError(null);
    campaignsApi
      .waitlist(campaignId, page)
      .then(setData)
      .catch((e) => setError(e instanceof Error ? e.message : "Could not load the waitlist."));
  }, [campaignId, page]);

  return (
    <Card className="mt-6">
      <h2 className="font-semibold">Waitlist{data ? ` (${data.total})` : ""}</h2>
      {data && (
        <p className="mt-1 text-sm text-ink-soft">
          {data.consented} of {data.total} chose to share their email with you.
        </p>
      )}

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      {!error && !data && <p className="mt-2 text-sm text-ink-soft">Loading...</p>}
      {data && data.total === 0 && <p className="mt-2 text-sm text-ink-soft">No one has joined the waitlist yet.</p>}
      {data && data.total > 0 && data.entries.length === 0 && (
        <p className="mt-2 text-sm text-ink-soft">No one has shared their email yet.</p>
      )}

      {data && data.entries.length > 0 && (
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-ink-soft">
              <tr>
                <th className="py-2 pr-4 font-medium">Name</th>
                <th className="py-2 pr-4 font-medium">Email</th>
                <th className="py-2 font-medium">Joined</th>
              </tr>
            </thead>
            <tbody>
              {data.entries.map((e, i) => (
                <tr key={`${e.email}-${i}`} className="border-t border-gray-100">
                  <td className="py-2 pr-4">{e.name}</td>
                  <td className="py-2 pr-4">{e.email}</td>
                  <td className="py-2">{fmtDate(e.joinedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {data && data.pagination.totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm">
          <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}
            className="rounded-md border border-gray-300 px-3 py-1.5 hover:bg-gray-50 disabled:opacity-50">Previous</button>
          <span className="text-ink-soft">Page {data.pagination.page} of {data.pagination.totalPages}</span>
          <button disabled={page >= data.pagination.totalPages} onClick={() => setPage((p) => p + 1)}
            className="rounded-md border border-gray-300 px-3 py-1.5 hover:bg-gray-50 disabled:opacity-50">Next</button>
        </div>
      )}
    </Card>
  );
}