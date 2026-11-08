"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import { AlertCircle, BellRing, CheckCircle2, Heart, Vote } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { ApiError } from "@/lib/api";
import { cn } from "@/lib/utils";
import { engagementApi } from "./engagement.api";
import { CommentSection } from "./CommentSection";
import { VoteSection } from "./VoteSection";
import type { EngagementVariant, IntentLevel, MyEngagement } from "./engagement.types";

type Props = { campaignId: string; variants: EngagementVariant[] };

const panel = "rounded-2xl border border-line bg-surface p-6 shadow-[0_1px_2px_rgba(18,23,31,0.04)]";

// Includes the HTTP status so it is obvious what went wrong (404, 401, 403, 429...).
const msg = (e: unknown, fallback: string) =>
  e instanceof ApiError ? `${e.message} (status ${e.status})` : e instanceof Error ? e.message : fallback;

function CardHeader({ icon, title, children, action }: { icon: ReactNode; title: string; children: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex min-w-0 items-start gap-4">
        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-brand-tint text-brand">{icon}</span>
        <div>
          <h2 className="text-lg font-semibold">{title}</h2>
          <p className="mt-1 text-sm leading-relaxed text-ink-soft">{children}</p>
        </div>
      </div>
      {action}
    </div>
  );
}

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
        <p role="alert" className="flex items-start gap-2 rounded-xl border border-danger/30 bg-danger-tint px-4 py-3 text-sm text-danger">
          <AlertCircle className="mt-0.5 size-4 shrink-0" /> {error}
        </p>
      )}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] lg:items-start">
        {/* Left: voting */}
        <div className="space-y-6">
          {loadingMe && (
            <div className={panel} aria-busy="true">
              <div className="flex gap-4">
                <Skeleton className="size-11 rounded-xl" />
                <div className="space-y-2">
                  <Skeleton className="h-5 w-64 max-w-full" />
                  <Skeleton className="h-3.5 w-80 max-w-full" />
                </div>
              </div>
              <Skeleton className="mt-6 h-32 w-full rounded-2xl" />
            </div>
          )}

          {meError && (
            <div className={panel}>
              <h2 className="font-semibold">Voting isn&apos;t available right now</h2>
              <p role="alert" className="mt-1.5 text-sm text-danger">{meError}</p>
              <Button variant="secondary" className="mt-4 h-10" onClick={loadMe}>
                Try again
              </Button>
            </div>
          )}

          {me && (
            <section className={panel}>
              <CardHeader
                icon={<Vote className="size-5" />}
                title="Which version should the founder make?"
                action={
                  <button
                    type="button"
                    onClick={toggleLike}
                    aria-pressed={me.liked}
                    className={cn(
                      "inline-flex h-10 shrink-0 items-center gap-2 rounded-full border px-4 text-sm font-medium transition",
                      me.liked
                        ? "border-danger/30 bg-danger-tint text-danger"
                        : "border-line bg-surface text-ink-soft hover:bg-canvas hover:text-ink"
                    )}
                  >
                    <Heart className={cn("size-4", me.liked && "fill-current")} />
                    {me.liked ? "Liked" : "Like"}
                  </button>
                }
              >
                Vote for one variant. You can change your vote while the campaign is live.
              </CardHeader>

              <VoteSection
                variants={variants}
                me={me}
                disabled={busy}
                onVote={vote}
                onRemoveVote={removeVote}
                onIntent={setIntent}
              />
            </section>
          )}
        </div>

        {/* Right: waitlist, then comments */}
        <div className="space-y-6">
          {me && (
            <section className={panel}>
              <CardHeader
                icon={<BellRing className="size-5" />}
                title="Get notified when it launches"
                action={
                  me.onWaitlist ? (
                    <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-brand-tint px-3 py-1 text-xs font-medium text-brand-dark">
                      <CheckCircle2 className="size-3.5" /> On the waitlist
                    </span>
                  ) : undefined
                }
              >
                {me.onWaitlist ? "You'll hear from the founder first." : "Join the waitlist to hear from the founder first."}
              </CardHeader>

              <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-xl border border-line bg-canvas/60 p-4 transition hover:border-ink-soft/40">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  className="mt-0.5 size-4 shrink-0 accent-[var(--color-brand)]"
                />
                <span>
                  <span className="block text-sm font-medium">Share my email with the founder</span>
                  <span className="mt-0.5 block text-sm text-ink-soft">
                    Optional. The founder will see your name and email so they can contact you about the launch.
                  </span>
                </span>
              </label>

              <div className="mt-4 flex flex-wrap gap-3">
                <Button className="h-10" disabled={busy} onClick={joinOrUpdateWaitlist}>
                  {me.onWaitlist ? "Update preference" : "Join waitlist"}
                </Button>
                {me.onWaitlist && (
                  <Button variant="secondary" className="h-10" disabled={busy} onClick={leaveWaitlist}>
                    Leave waitlist
                  </Button>
                )}
              </div>
            </section>
          )}

          {/* Comments load on their own, so they show even if the vote section fails */}
          <section className={panel}>
            <CommentSection campaignId={campaignId} canPost={!!me} />
          </section>
        </div>
      </div>
    </div>
  );
}