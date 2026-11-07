import Link from "next/link";
import { BadgeCheck, Clock, ImageOff } from "lucide-react";
import { categoryLabel, priceRange, timeLeft } from "@/lib/format";
import type { Campaign } from "./discovery.types";

export function CampaignCard({ campaign }: { campaign: Campaign }) {
  const { product, business, variants } = campaign;
  const image = product.images[0]?.url;

  return (
    <Link
      href={`/consumer/discover/${campaign.id}`}
      className="flex flex-col overflow-hidden rounded-lg border border-line bg-surface transition-colors hover:border-ink-soft/40"
    >
      <div className="aspect-[4/3] bg-canvas">
        {image ? (
          // Plain <img> because product images can come from any host
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt={product.name} loading="lazy" className="size-full object-cover" />
        ) : (
          <div className="grid size-full place-items-center text-ink-soft">
            <ImageOff className="size-6" aria-label="No image" />
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <span className="text-xs text-ink-soft">{categoryLabel(product.category)}</span>
        <h2 className="mt-1 line-clamp-1 font-medium">{product.name}</h2>

        {business && (
          <p className="mt-1 flex items-center gap-1 text-sm text-ink-soft">
            <span className="truncate">{business.name}</span>
            {business.verified && <BadgeCheck aria-label="Verified business" className="size-4 shrink-0 text-brand" />}
          </p>
        )}

        <p className="mt-3 line-clamp-2 text-sm text-ink-soft">{product.description}</p>

        <div className="mt-auto flex items-center justify-between gap-2 pt-4 text-sm">
          <span className="font-medium">{priceRange(variants)}</span>
          <span className="flex shrink-0 items-center gap-1 text-ink-soft">
            <Clock className="size-3.5" /> {timeLeft(campaign.endsAt)}
          </span>
        </div>
      </div>
    </Link>
  );
}