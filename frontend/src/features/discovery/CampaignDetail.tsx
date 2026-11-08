"use client";

import { useCallback, useEffect, useState, type ComponentType } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  BadgeCheck,
  Clock,
  Compass,
  Heart,
  ImageOff,
  Lightbulb,
  MapPin,
  Target,
} from "lucide-react";
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

const backLink =
  "mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-ink-soft transition-colors hover:text-ink";
const panel = "rounded-2xl border border-line bg-surface shadow-[0_1px_2px_rgba(18,23,31,0.04)]";

type Fact = { label: string; value: string | null; icon: ComponentType<{ className?: string }>; wide?: boolean };

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
      <div>
        <Skeleton className="mb-6 h-4 w-32" />
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <Skeleton className="aspect-[4/3] w-full rounded-2xl" />
          <div className="space-y-4">
            <Skeleton className="h-6 w-24 rounded-full" />
            <Skeleton className="h-9 w-72" />
            <Skeleton className="h-4 w-44" />
            <Skeleton className="h-24 w-full" />
            <div className="grid grid-cols-2 gap-3">
              <Skeleton className="h-16 rounded-xl" />
              <Skeleton className="h-16 rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (state === "notfound") {
    return (
      <div>
        <Link href="/consumer/discover" className={backLink}>
          <ArrowLeft className="size-4" /> All campaigns
        </Link>
        <div className={panel}>
          <EmptyState
            icon={Compass}
            title="This campaign isn't available"
            description="It may have ended, or the link is wrong."
            action={
              <Link
                href="/consumer/discover"
                className="inline-flex h-10 items-center rounded-lg bg-brand px-4 text-sm font-medium text-white hover:bg-brand-dark"
              >
                Browse live campaigns
              </Link>
            }
          />
        </div>
      </div>
    );
  }

  if (state === "error" || !campaign) {
    return (
      <div>
        <Link href="/consumer/discover" className={backLink}>
          <ArrowLeft className="size-4" /> All campaigns
        </Link>
        <div className={panel}>
          <EmptyState
            icon={AlertCircle}
            title="Couldn't load this campaign"
            description={errorText}
            action={<Button variant="secondary" onClick={load}>Try again</Button>}
          />
        </div>
      </div>
    );
  }

  const { product, business, variants } = campaign;
  const images = product.images;
  const main = images[selected]?.url;

  const facts: Fact[] = [
    { label: "Closes", value: `${formatDate(campaign.endsAt)}`, icon: Clock },
    { label: "Location", value: campaign.location, icon: MapPin },
    { label: "Target audience", value: campaign.targetAudience, icon: Target },
    { label: "What the founder wants to learn", value: campaign.objective, icon: Lightbulb, wide: true },
  ];

  return (
    <div>
      <Link href="/consumer/discover" className={backLink}>
        <ArrowLeft className="size-4" /> All campaigns
      </Link>

      <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        {/* Gallery */}
        <div className="space-y-3">
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-line bg-canvas shadow-[0_1px_2px_rgba(18,23,31,0.04)]">
            {main ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={main} alt={product.name} className="size-full object-cover" />
            ) : (
              <div className="grid size-full place-items-center text-ink-soft">
                <ImageOff className="size-8" aria-label="No image" />
              </div>
            )}
            <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-ink/75 px-3.5 py-1.5 text-sm font-medium text-white backdrop-blur">
              <Clock className="size-4" /> {timeLeft(campaign.endsAt)}
            </span>
          </div>

          {images.length > 1 && (
            <div className="flex gap-2.5 overflow-x-auto pb-1">
              {images.map((img, i) => (
                <button
                  key={img.id}
                  type="button"
                  onClick={() => setSelected(i)}
                  aria-label={`Show image ${i + 1}`}
                  aria-pressed={i === selected}
                  className={cn(
                    "size-[72px] shrink-0 overflow-hidden rounded-xl border-2 bg-canvas transition",
                    i === selected ? "border-brand" : "border-transparent opacity-70 hover:opacity-100"
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
          <span className="inline-flex rounded-full bg-brand-tint px-3 py-1 text-xs font-medium text-brand-dark">
            {categoryLabel(product.category)}
          </span>
          <h1 className="mt-3 text-3xl font-semibold leading-tight sm:text-4xl">{product.name}</h1>

          {business && (
            <p className="mt-3 flex flex-wrap items-center gap-2 text-sm text-ink-soft">
              By <span className="font-medium text-ink">{business.name}</span>
              {business.verified && (
                <span className="inline-flex items-center gap-1 rounded-full bg-brand-tint px-2.5 py-0.5 text-xs font-medium text-brand-dark">
                  <BadgeCheck className="size-3.5" /> Verified
                </span>
              )}
            </p>
          )}

          <p className="mt-5 whitespace-pre-line leading-relaxed text-ink-soft">{product.description}</p>

          <dl className="mt-7 grid gap-3 sm:grid-cols-2">
            {facts
              .filter((f) => f.value)
              .map(({ label, value, icon: Icon, wide }) => (
                <div
                  key={label}
                  className={cn("flex gap-3 rounded-xl border border-line bg-surface p-4", wide && "sm:col-span-2")}
                >
                  <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-canvas text-ink-soft">
                    <Icon className="size-[18px]" />
                  </span>
                  <div className="min-w-0">
                    <dt className="text-xs text-ink-soft">{label}</dt>
                    <dd className="mt-0.5 text-sm font-medium leading-snug">{value}</dd>
                  </div>
                </div>
              ))}
          </dl>
        </div>
      </div>

      {/* Voting, likes, waitlist and comments */}
      <section aria-labelledby="feedback-heading" className="mt-14">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 id="feedback-heading" className="text-xl font-semibold">
              Share your feedback
            </h2>
            <p className="mt-1 text-sm text-ink-soft">
              Vote for an option, tell the founder how likely you are to buy, and join the waitlist.
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-tint px-3 py-1 text-xs font-medium text-brand-dark">
            <Heart className="size-3.5" /> Always free
          </span>
        </div>

        {variants.length === 0 ? (
          <p className={cn(panel, "p-6 text-sm text-ink-soft")}>The founder hasn&apos;t added options yet.</p>
        ) : (
          <EngagementPanel campaignId={campaign.id} variants={variants} />
        )}
      </section>
    </div>
  );
}