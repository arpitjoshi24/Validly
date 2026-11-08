import Link from "next/link";
import { ArrowRight, BadgeCheck, Clock, ImageOff, Layers } from "lucide-react";
import { categoryLabel, priceRange, timeLeft } from "@/lib/format";
import type { Campaign } from "./discovery.types";

export function CampaignCard({ campaign }: { campaign: Campaign }) {
  const { product, business, variants } = campaign;
  const image = product.images[0]?.url;

  return (
    <Link
      href={`/consumer/discover/${campaign.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-[0_1px_2px_rgba(18,23,31,0.04)] transition duration-300 hover:-translate-y-0.5 hover:border-ink-soft/30 hover:shadow-[0_20px_40px_-24px_rgba(18,23,31,0.35)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand/15"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-canvas">
        {image ? (
          // Plain <img> because product images can come from any host
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt={product.name}
            loading="lazy"
            className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="grid size-full place-items-center text-ink-soft">
            <ImageOff className="size-7" aria-label="No image" />
          </div>
        )}

        <span className="absolute left-3 top-3 rounded-full bg-surface/90 px-3 py-1 text-xs font-medium text-ink shadow-sm backdrop-blur">
          {categoryLabel(product.category)}
        </span>
        <span className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-ink/75 px-3 py-1 text-xs font-medium text-white backdrop-blur">
          <Clock className="size-3.5" /> {timeLeft(campaign.endsAt)}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h2 className="line-clamp-1 font-display text-lg font-semibold">{product.name}</h2>

        {business && (
          <p className="mt-1 flex items-center gap-1.5 text-sm text-ink-soft">
            <span className="truncate">{business.name}</span>
            {business.verified && <BadgeCheck aria-label="Verified business" className="size-4 shrink-0 text-brand" />}
          </p>
        )}

        <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-ink-soft">{product.description}</p>

        <div className="mt-auto flex items-center justify-between gap-3 border-t border-line pt-4">
          <div>
            <p className="text-base font-semibold tabular-nums">{priceRange(variants)}</p>
            {variants.length > 1 && (
              <p className="mt-0.5 flex items-center gap-1 text-xs text-ink-soft">
                <Layers className="size-3.5" /> {variants.length} options to vote on
              </p>
            )}
          </div>
          <span className="inline-flex items-center gap-1.5 text-sm font-medium text-brand">
            View and vote
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}