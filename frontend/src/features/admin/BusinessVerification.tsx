"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertCircle, ExternalLink, Inbox } from "lucide-react";
import { toast } from "sonner";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { VerificationBadge } from "@/features/founders/VerificationBadge";
import { cn } from "@/lib/utils";
import type { VerificationStatus } from "@/types";
import { adminApi, type AdminUser } from "./admin.api";

type Tab = VerificationStatus | "ALL";

const TABS: { value: Tab; label: string }[] = [
  { value: "PENDING", label: "Pending" },
  { value: "VERIFIED", label: "Verified" },
  { value: "REJECTED", label: "Rejected" },
  { value: "ALL", label: "All" },
];

const EMPTY: Record<Tab, { title: string; description: string }> = {
  PENDING: { title: "You're all caught up", description: "No businesses are waiting for review." },
  VERIFIED: { title: "No verified businesses yet", description: "Approved businesses will appear here." },
  REJECTED: { title: "No rejected businesses", description: "Businesses you reject will appear here." },
  ALL: { title: "No business profiles yet", description: "Founders appear here once they create a business profile." },
};

export function BusinessVerification() {
  const [founders, setFounders] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("PENDING");
  const [busyId, setBusyId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setLoadError(null);
    try {
      setFounders(await adminApi.listAllFounders());
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : "Could not load businesses");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  // Only founders who have created a business profile can be reviewed
  const withProfile = useMemo(() => founders.filter((f) => f.founderProfile), [founders]);
  const withoutProfile = founders.length - withProfile.length;

  const counts = useMemo(() => {
    const c: Record<Tab, number> = { PENDING: 0, VERIFIED: 0, REJECTED: 0, ALL: withProfile.length };
    withProfile.forEach((f) => { c[f.founderProfile!.verificationStatus] += 1; });
    return c;
  }, [withProfile]);

  const visible = withProfile.filter((f) => tab === "ALL" || f.founderProfile!.verificationStatus === tab);

  async function decide(founder: AdminUser, status: "VERIFIED" | "REJECTED") {
    const name = founder.founderProfile!.businessName;
    if (status === "REJECTED" && !window.confirm(`Reject ${name}? You can verify it again later.`)) return;

    setBusyId(founder.id);
    try {
      await adminApi.setVerification(founder.id, status);
      setFounders((prev) =>
        prev.map((f) =>
          f.id === founder.id ? { ...f, founderProfile: { ...f.founderProfile!, verificationStatus: status } } : f
        )
      );
      toast.success(status === "VERIFIED" ? `${name} verified` : `${name} rejected`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not update the business");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      {/* Tabs */}
      <div role="tablist" aria-label="Verification status" className="flex gap-6 border-b border-line">
        {TABS.map((t) => {
          const selected = tab === t.value;
          return (
            <button
              key={t.value}
              role="tab"
              aria-selected={selected}
              onClick={() => setTab(t.value)}
              className={cn(
                "-mb-px flex items-center gap-2 border-b-2 pb-3 text-sm transition-colors",
                selected ? "border-brand font-medium text-ink" : "border-transparent text-ink-soft hover:text-ink"
              )}
            >
              {t.label}
              <span
                className={cn(
                  "rounded-full px-1.5 text-xs tabular-nums",
                  selected ? "bg-brand-tint text-brand-dark" : "bg-canvas text-ink-soft"
                )}
              >
                {loading ? "–" : counts[t.value]}
              </span>
            </button>
          );
        })}
      </div>

      {/* List */}
      <div className="mt-5 overflow-hidden rounded-lg border border-line bg-surface">
        {loading ? (
          <ul className="divide-y divide-line">
            {Array.from({ length: 3 }).map((_, i) => (
              <li key={i} className="flex gap-4 p-5">
                <Skeleton className="size-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-64" />
                  <Skeleton className="h-3 w-full max-w-md" />
                </div>
              </li>
            ))}
          </ul>
        ) : loadError ? (
          <EmptyState
            icon={AlertCircle}
            title="Couldn't load businesses"
            description={loadError}
            action={<Button variant="secondary" onClick={load}>Try again</Button>}
          />
        ) : visible.length === 0 ? (
          <EmptyState icon={Inbox} title={EMPTY[tab].title} description={EMPTY[tab].description} />
        ) : (
          <ul className="divide-y divide-line">
            {visible.map((f) => {
              const p = f.founderProfile!;
              const busy = busyId === f.id;
              return (
                <li key={f.id} className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex min-w-0 gap-4">
                    <Avatar name={p.businessName} />
                    <div className="min-w-0 space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="font-medium">{p.businessName}</h2>
                        <VerificationBadge status={p.verificationStatus} />
                      </div>
                      <p className="text-sm text-ink-soft">
                        {f.name} · {f.email}
                        {f.createdAt && <> · Joined {new Date(f.createdAt).toLocaleDateString()}</>}
                      </p>
                      {p.description && <p className="line-clamp-2 max-w-2xl text-sm">{p.description}</p>}
                      {p.website && (
                        <a
                          href={p.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-sm text-brand hover:underline"
                        >
                          {p.website.replace(/^https?:\/\//, "")} <ExternalLink className="size-3.5" />
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="flex shrink-0 gap-2 sm:pl-4">
                    {p.verificationStatus !== "VERIFIED" && (
                      <Button className="h-9" loading={busy} onClick={() => decide(f, "VERIFIED")}>
                        Verify
                      </Button>
                    )}
                    {p.verificationStatus !== "REJECTED" && (
                      <Button variant="secondary" className="h-9" disabled={busy} onClick={() => decide(f, "REJECTED")}>
                        Reject
                      </Button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {!loading && !loadError && withoutProfile > 0 && (
        <p className="mt-3 text-sm text-ink-soft">
          {withoutProfile} {withoutProfile === 1 ? "founder hasn't" : "founders haven't"} created a business profile yet.
        </p>
      )}
    </div>
  );
}