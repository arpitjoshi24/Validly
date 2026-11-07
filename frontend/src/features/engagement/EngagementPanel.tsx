"use client";

import { useCallback, useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { ApiError } from "@/lib/api";
import { engagementApi } from "./engagement.api";
import { CommentSection } from "./CommentSection";
import { VoteSection } from "./VoteSection";
import type { EngagementVariant, IntentLevel, MyEngagement } from "./engagement.types";

type Props = { campaignId: string; variants: EngagementVariant[] };

// Includes the HTTP status so it is obvious what went wrong (404, 401, 403, 429...).
const msg = (e: unknown, fallback: string) =>
  e instanceof ApiError ? `${e.message} (status ${e.status})` : e instanceof Error ? e.message : fallback;

export function EngagementPanel({ campaignId, variants }: Props) {
  const [me, setMe] = useState<MyEngagement | null>(null);
  const [meError, setMeError] = useState<string | null>(null);
  const [loadingMe, setLoadingMe] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [consent, setConsent] = useState(false);

  const loadMe = useCallback(async () => {
    setLoadingMe(true);
    setMeError(null);
    try {
      const data = await engagementApi.me(campaignId);
      setMe(data);
      setConsent(data.waitlistConsent);
    } catch (e) {
      setMeError(msg(e, "Could not load your activity on this campaign."));
    } finally {
      setLoadingMe(false);
    }
  }, [campaignId]);

  useEffect(() => {
    loadMe();
  }, [loadMe]);

  // Runs an API call with the shared busy flag and error banner.
  async function act(fn: () => Promise<void>) {
    setBusy(true);
    setError(null);
    try {
      await fn();
    } catch (e) {
      setError(msg(e, "Something went wrong. Try again."));
    } finally {
      setBusy(false);
    }
  }

  const vote = (variantId: string) =>
    act(async () => {
      await engagementApi.vote(campaignId, variantId);
      setMe((m) => (m ? { ...m, votedVariantId: variantId } : m));
    });

  const removeVote = () =>
    act(async () => {
      await engagementApi.removeVote(campaignId);
      setMe((m) => (m ? { ...m, votedVariantId: null } : m));
    });

  const setIntent = (variantId: string, level: IntentLevel) =>
    act(async () => {
      await engagementApi.setIntent(campaignId, variantId, level);
      setMe((m) =>
        m ? { ...m, intents: [...m.intents.filter((i) => i.variantId !== variantId), { variantId, level }] } : m
      );
    });

  async function toggleLike() {
    if (!me) return;
    const next = !me.liked;
    setError(null);
    setMe({ ...me, liked: next }); // update right away, undo if the request fails
    try {
      await (next ? engagementApi.like(campaignId) : engagementApi.unlike(campaignId));
    } catch (e) {
      setMe((m) => (m ? { ...m, liked: !next } : m));
      setError(msg(e, "Could not update your like. Try again."));
    }
  }

  const joinOrUpdateWaitlist = () =>
    act(async () => {
      const res = await engagementApi.joinWaitlist(campaignId, consent);
      setMe((m) => (m ? { ...m, onWaitlist: true, waitlistConsent: res.waitlistConsent } : m));
    });

  const leaveWaitlist = () =>
    act(async () => {
      await engagementApi.leaveWaitlist(campaignId);
      setMe((m) => (m ? { ...m, onWaitlist: false, waitlistConsent: false } : m));
      setConsent(false);
    });

  return (
    <div className="space-y-6">
      {error && (
        <p role="alert" className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      {loadingMe && <p className="text-sm text-ink-soft">Loading voting options...</p>}

      {meError && (
        <Card>
          <h2 className="font-semibold">Voting isn't available right now</h2>
          <p role="alert" className="mt-1 text-sm text-red-600">{meError}</p>
          <button type="button" onClick={loadMe}
            className="mt-3 rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium hover:bg-gray-50">
            Try again
          </button>
        </Card>
      )}

      {me && (
        <>
          <Card>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-semibold">Which version should the founder make?</h2>
                <p className="text-sm text-ink-soft">Vote for one variant. You can change your vote while the campaign is live.</p>
              </div>
              <button type="button" onClick={toggleLike} aria-pressed={me.liked}
                className={`shrink-0 rounded-md border px-3 py-1.5 text-sm font-medium ${
                  me.liked ? "border-brand bg-brand text-white" : "border-gray-300 hover:bg-gray-50"
                }`}>
                {me.liked ? "Liked" : "Like"}
              </button>
            </div>

            <VoteSection variants={variants} me={me} disabled={busy}
              onVote={vote} onRemoveVote={removeVote} onIntent={setIntent} />
          </Card>

          <Card>
            <h2 className="font-semibold">Get notified when it launches</h2>
            <p className="mt-1 text-sm text-ink-soft">
              {me.onWaitlist ? "You're on the waitlist." : "Join the waitlist to hear from the founder first."}
            </p>
            <label className="mt-3 flex items-center gap-2 text-sm">
              <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
              Share my email with the founder
            </label>
            <div className="mt-3 flex flex-wrap gap-3">
              <button type="button" disabled={busy} onClick={joinOrUpdateWaitlist}
                className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark disabled:opacity-60">
                {me.onWaitlist ? "Update preference" : "Join waitlist"}
              </button>
              {me.onWaitlist && (
                <button type="button" disabled={busy} onClick={leaveWaitlist}
                  className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50 disabled:opacity-60">
                  Leave waitlist
                </button>
              )}
            </div>
          </Card>
        </>
      )}

      {/* Comments load on their own, so they show even if the vote section fails */}
      <Card>
        <CommentSection campaignId={campaignId} canPost={!!me} />
      </Card>
    </div>
  );
}