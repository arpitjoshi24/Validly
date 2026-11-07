"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/campaigns/StatusBadge";
import { WaitlistPanel } from "@/components/campaigns/WaitlistPanel";
import { campaignsApi, fmtDate, inr, timeLeft } from "@/lib/campaigns";
import type { Campaign } from "@/types/campaign";
import { ResultsPanel } from "@/components/campaigns/ResultsPanel";
export default function CampaignDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<"publish" | "close" | "delete" | null>(null);

  useEffect(() => {
    campaignsApi
      .get(id)
      .then(setCampaign)
      .catch((e) => setError(e instanceof Error ? e.message : "Could not load this campaign."));
  }, [id]);

  async function run(action: "publish" | "close" | "delete") {
    if (action === "publish" && !confirm("Publish this campaign? You won't be able to edit it afterwards.")) return;
    if (action === "close" && !confirm("Close this campaign now? This can't be undone.")) return;
    if (action === "delete" && !confirm("Delete this draft? This can't be undone.")) return;

    setBusy(action);
    setError(null);
    try {
      if (action === "delete") {
        await campaignsApi.remove(id);
        router.push("/founder/campaigns");
        return;
      }
      setCampaign(action === "publish" ? await campaignsApi.publish(id) : await campaignsApi.close(id));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong. Try again.");
    } finally {
      setBusy(null);
    }
  }

  const btn = "rounded-md px-4 py-2 text-sm font-medium disabled:opacity-60";

  return (
    <RoleGuard roles={["FOUNDER"]}>
      <Link href="/founder/campaigns" className="text-sm text-ink-soft hover:underline">Back to campaigns</Link>

      {error && <p role="alert" className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      {!campaign && !error && <p className="mt-4 text-sm text-ink-soft">Loading...</p>}

      {campaign && (
        <>
          <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold">{campaign.product?.name ?? "Campaign"}</h1>
                <StatusBadge status={campaign.status} />
              </div>
              {campaign.status === "ACTIVE" && (
                <p className="mt-1 text-sm text-ink-soft">
                  {timeLeft(campaign.endsAt)}. Ends {fmtDate(campaign.endsAt)}
                </p>
              )}
              {campaign.status === "CLOSED" && <p className="mt-1 text-sm text-ink-soft">Closed on {fmtDate(campaign.closedAt)}</p>}
              {campaign.status === "DRAFT" && (
                <p className="mt-1 text-sm text-ink-soft">Runs for {campaign.durationDays} days once published.</p>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {campaign.status === "DRAFT" && (
                <>
                  <Link href={`/founder/campaigns/${id}/edit`} className={`${btn} border border-gray-300 hover:bg-gray-50`}>Edit</Link>
                  <button disabled={busy !== null} onClick={() => run("publish")} className={`${btn} bg-brand text-white hover:bg-brand-dark`}>
                    {busy === "publish" ? "Publishing..." : "Publish"}
                  </button>
                  <button disabled={busy !== null} onClick={() => run("delete")} className={`${btn} border border-red-300 text-red-600 hover:bg-red-50`}>
                    {busy === "delete" ? "Deleting..." : "Delete"}
                  </button>
                </>
              )}
              {campaign.status === "ACTIVE" && (
                <button disabled={busy !== null} onClick={() => run("close")} className={`${btn} border border-red-300 text-red-600 hover:bg-red-50`}>
                  {busy === "close" ? "Closing..." : "Close campaign"}
                </button>
              )}
            </div>
          </div>

          <Card className="mt-6">
            <h2 className="font-semibold">Details</h2>
            <dl className="mt-3 grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
              <div><dt className="text-ink-soft">Objective</dt><dd>{campaign.objective || "—"}</dd></div>
              <div><dt className="text-ink-soft">Target audience</dt><dd>{campaign.targetAudience || "—"}</dd></div>
              <div><dt className="text-ink-soft">Location</dt><dd>{campaign.location || "—"}</dd></div>
              <div><dt className="text-ink-soft">Published</dt><dd>{fmtDate(campaign.publishedAt)}</dd></div>
            </dl>
          </Card>

          <Card className="mt-6">
            <h2 className="font-semibold">Variants</h2>
            <ul className="mt-3 divide-y divide-gray-100">
              {campaign.variants.map((v) => (
                <li key={v.id} className="flex items-start justify-between gap-4 py-3">
                  <div>
                    <p className="font-medium">{v.name}</p>
                    {v.description && <p className="text-sm text-ink-soft">{v.description}</p>}
                  </div>
                  <p className="font-medium">{inr(v.price)}</p>
                </li>
              ))}
            </ul>
          </Card>{campaign.status !== "DRAFT" && (
  <>
    <ResultsPanel campaignId={id} />
    <WaitlistPanel campaignId={id} />
  </>
)}

          
        </>
      )}
    </RoleGuard>
  );
}