"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { AlertCircle, ArrowLeft, BadgeCheck, Compass, ImageOff } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { ApiError } from "@/lib/api";
import { categoryLabel, formatDate, timeLeft } from "@/lib/format";
import { cn } from "@/lib/utils";
import { EngagementPanel } from "@/features/engagement/EngagementPanel";
import { discoveryApi } from "./discovery.api";
import type { Campaign } from "./discovery.types";

type State = "loading" | "ready" | "notfound" | "error";

const backLink = "mb-5 inline-flex items-center gap-1 text-sm text-ink-soft hover:text-ink";

export function CampaignDetail({ campaignId }: { campaignId: string }) {
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [state, setState] = useState<State>("loading");
  const [errorText, setErrorText] = useState("");
  const [selected, setSelected] = useState(0);

  const load = useCallback(async () => {
    setState("loading");
    try {
      setCampaign(await discoveryApi.getOne(campaignId));
      setSelected(0);
      setState("ready");
    } catch (e) {
      if (e instanceof ApiError && (e.status === 404 || e.status === 400)) {
        setState("notfound");
      } else {
        setErrorText(e instanceof Error ? e.message : "Could not load this campaign");
        setState("error");
      }
    }
  }, [campaignId]);

  useEffect(() => {
    load();
  }, [load]);

  if (state === "loading") {
    return (
      <div className="grid gap-8 lg:grid-cols-2">
        <Skeleton className="aspect-[4/3] w-full" />
        <div className="space-y-3">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-7 w-64" />
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-20 w-full" />
        </div>
      </div>
    );
  }

  if (state === "notfound") {
    return (
      <div className="rounded-lg border border-line bg-surface">
        <EmptyState
          icon={Compass}
          title="This campaign isn't available"
          description="It may have ended, or the link is wrong."
          action={
            <Link href="/consumer/discover" className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark">
              Browse live campaigns
            </Link>
          }
        />
      </div>
    );
  }

  if (state === "error" || !campaign) {
    return (
      <div className="rounded-lg border border-line bg-surface">
        <EmptyState
          icon={AlertCircle}
          title="Couldn't load this campaign"
          description={errorText}
          action={<Button variant="secondary" onClick={load}>Try again</Button>}
        />
      </div>
    );
  }

  const { product, business, variants } = campaign;
  const images = product.images;
  const main = images[selected]?.url;

  const details: [string, string | null][] = [
    ["Closes", `${formatDate(campaign.endsAt)} (${timeLeft(campaign.endsAt)})`],
    ["Location", campaign.location],
    ["Target audience", campaign.targetAudience],
    ["What the founder wants to learn", campaign.objective],
  ];

  return (
    <div>
      <Link href="/consumer/discover" className={backLink}>
        <ArrowLeft className="size-4" /> All campaigns
      </Link>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Gallery */}
        <div className="space-y-3">
          <div className="aspect-[4/3] overflow-hidden rounded-lg border border-line bg-canvas">
            {main ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={main} alt={product.name} className="size-full object-cover" />
            ) : (
              <div className="grid size-full place-items-center text-ink-soft">
                <ImageOff className="size-8" aria-label="No image" />
              </div>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {images.map((img, i) => (
                <button
                  key={img.id}
                  type="button"
                  onClick={() => setSelected(i)}
                  aria-label={`Show image ${i + 1}`}
                  aria-pressed={i === selected}
                  className={cn(
                    "size-16 shrink-0 overflow-hidden rounded-md border bg-canvas",
                    i === selected ? "border-brand ring-1 ring-brand" : "border-line hover:border-ink-soft/40"
                  )}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.url} alt="" className="size-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <span className="text-sm text-ink-soft">{categoryLabel(product.category)}</span>
          <h1 className="mt-1 text-2xl font-semibold">{product.name}</h1>

          {business && (
            <p className="mt-2 flex items-center gap-1.5 text-sm text-ink-soft">
              By {business.name}
              {business.verified && (
                <span className="inline-flex items-center gap-1 text-brand">
                  <BadgeCheck className="size-4" /> Verified
                </span>
              )}
            </p>
          )}

          <p className="mt-5 whitespace-pre-line text-sm leading-relaxed">{product.description}</p>

          <dl className="mt-6 divide-y divide-line rounded-lg border border-line bg-surface text-sm">
            {details
              .filter(([, value]) => value)
              .map(([label, value]) => (
                <div key={label} className="flex justify-between gap-4 px-4 py-2.5">
                  <dt className="text-ink-soft">{label}</dt>
                  <dd className="text-right">{value}</dd>
                </div>
              ))}
          </dl>
        </div>
      </div>

      {/* Voting, likes, waitlist and comments sit below the two columns, full width */}
      <div className="mt-10 max-w-3xl">
        {variants.length === 0 ? (
          <p className="text-sm text-ink-soft">The founder hasn't added options yet.</p>
        ) : (
          <EngagementPanel campaignId={campaign.id} variants={variants} />
        )}
      </div>
    </div>
  );
}