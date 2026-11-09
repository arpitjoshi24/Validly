"use client";

import Link from "next/link";
import { Heart, SlidersHorizontal } from "lucide-react";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { DiscoverFeed } from "@/features/discovery/DiscoverFeed";

export default function DiscoverPage() {
  return (
    <RoleGuard roles={["CONSUMER"]}>
      <div className="space-y-6">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="inline-flex items-center gap-2 text-sm font-medium text-brand">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-brand opacity-60" />
                <span className="relative inline-flex size-2 rounded-full bg-brand" />
              </span>
              Live campaigns
            </p>
            <h1 className="mt-1.5 text-2xl font-semibold sm:text-3xl">Discover</h1>
            <p className="mt-1.5 max-w-xl text-ink-soft">
              Products founders are testing right now. Your feedback decides what gets made.
            </p>
          </div>
          <Link
            href="/consumer/profile"
            className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-lg border border-line bg-surface px-4 text-sm font-medium text-ink transition-colors hover:border-brand/60 hover:bg-brand-tint focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand/20"
          >
            <SlidersHorizontal className="size-4 text-brand" /> Tune your interests
          </Link>
        </header>

        <p className="flex items-center gap-2.5 rounded-xl border border-brand/20 bg-brand-tint px-4 py-3 text-sm text-ink/80">
          <Heart className="size-4 shrink-0 text-brand" />
          Giving feedback is always free. Votes, comments and waitlist signups help founders decide what to build.
        </p>

        <DiscoverFeed />
      </div>
    </RoleGuard>
  );
}