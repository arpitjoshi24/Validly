"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  BadgeCheck,
  Clock,
  ExternalLink,
  Inbox,
  Mail,
  Search,
  SearchX,
  User as UserIcon,
  X,
  XCircle,
} from "lucide-react";
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

const STATS = [
  { value: "PENDING", label: "Awaiting review", icon: Clock, tone: "bg-signal-tint text-signal" },
  { value: "VERIFIED", label: "Verified", icon: BadgeCheck, tone: "bg-brand-tint text-brand" },
  { value: "REJECTED", label: "Rejected", icon: XCircle, tone: "bg-danger-tint text-danger" },
] as const;

const EMPTY: Record<Tab, { title: string; description: string }> = {
  PENDING: { title: "You're all caught up", description: "No businesses are waiting for review." },
  VERIFIED: { title: "No verified businesses yet", description: "Approved businesses will appear here." },
  REJECTED: { title: "No rejected businesses", description: "Businesses you reject will appear here." },
  ALL: { title: "No business profiles yet", description: "Founders appear here once they create a business profile." },
};

const formatDate = (iso?: string) =>
  iso ? new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" }) : null;

function waiting(iso?: string) {
  if (!iso) return null;
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (days <= 0) return "Joined today";
  return `Waiting ${days} ${days === 1 ? "day" : "days"}`;
}

export function BusinessVerification() {
  const [founders, setFounders] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("PENDING");
  const [query, setQuery] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

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
    withProfile.forEach((f) => {
      c[f.founderProfile!.verificationStatus] += 1;
    });
    return c;
  }, [withProfile]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = withProfile.filter((f) => {
      if (tab !== "ALL" && f.founderProfile!.verificationStatus !== tab) return false;
      if (!q) return true;
      return [f.founderProfile!.businessName, f.name, f.email].some((v) => v?.toLowerCase().includes(q));
    });
    // Oldest first, so the businesses that have waited longest are reviewed first
    return [...list].sort((a, b) => (a.createdAt ?? "").localeCompare(b.createdAt ?? ""));
  }, [withProfile, tab, query]);

  async function decide(founder: AdminUser, status: "VERIFIED" | "REJECTED") {
    const name = founder.founderProfile!.businessName;
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
      setConfirmId(null);
    }
  }

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid gap-3 sm:grid-cols-3">
        {STATS.map((s) => {
          const selected = tab === s.value;
          return (
            <button
              key={s.value}
              type="button"
              onClick={() => setTab(s.value)}
              aria-pressed={selected}
              className={cn(
                "flex items-center gap-4 rounded-2xl border bg-surface p-4 text-left transition",
                selected ? "border-brand ring-4 ring-brand/10" : "border-line hover:border-ink-soft/40"
              )}
            >
              <span className={cn("grid size-11 place-items-center rounded-xl", s.tone)}>
                <s.icon className="size-5" />
              </span>
              <span>
                <span className="block text-2xl font-semibold tabular-nums leading-none">
                  {loading ? <Skeleton className="h-6 w-8" /> : counts[s.value]}
                </span>
                <span className="mt-1 block text-sm text-ink-soft">{s.label}</span>
              </span>
            </button>
          );
        })}
      </div>

      {/* Tabs + search */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div role="tablist" aria-label="Verification status" className="inline-flex w-fit rounded-xl bg-canvas p-1">
          {TABS.map((t) => {
            const selected = tab === t.value;
            return (
              <button
                key={t.value}
                role="tab"
                aria-selected={selected}
                onClick={() => setTab(t.value)}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition",
                  selected ? "bg-surface font-medium text-ink shadow-sm" : "text-ink-soft hover:text-ink"
                )}
              >
                {t.label}
                <span className={cn("text-xs tabular-nums", selected ? "text-brand" : "text-ink-soft")}>
                  {loading ? "–" : counts[t.value]}
                </span>
              </button>
            );
          })}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-soft" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search business, owner or email"
            aria-label="Search businesses"
            className="h-10 w-full rounded-lg border border-line bg-surface pl-9 pr-3 text-sm outline-none transition hover:border-ink-soft/40 focus:border-brand focus:ring-4 focus:ring-brand/10"
          />
        </div>
      </div>

      {/* List */}
      {loading ? (
        <ul className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <li key={i} className="flex gap-4 rounded-2xl border border-line bg-surface p-5">
              <Skeleton className="size-12 rounded-full" />
              <div className="flex-1 space-y-2.5">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-72" />
                <Skeleton className="h-3 w-full max-w-md" />
              </div>
            </li>
          ))}
        </ul>
      ) : loadError ? (
        <div className="rounded-2xl border border-line bg-surface">
          <EmptyState
            icon={AlertCircle}
            title="Couldn't load businesses"
            description={loadError}
            action={<Button variant="secondary" onClick={load}>Try again</Button>}
          />
        </div>
      ) : visible.length === 0 ? (
        <div className="rounded-2xl border border-line bg-surface">
          {query ? (
            <EmptyState icon={SearchX} title="No matches" description={`Nothing matches "${query}" in this view.`} />
          ) : (
            <EmptyState icon={Inbox} title={EMPTY[tab].title} description={EMPTY[tab].description} />
          )}
        </div>
      ) : (
        <ul className="space-y-3">
          {visible.map((f) => {
            const p = f.founderProfile!;
            const busy = busyId === f.id;
            const confirming = confirmId === f.id;
            const wait = p.verificationStatus === "PENDING" ? waiting(f.createdAt) : null;

            return (
              <li
                key={f.id}
                className="rounded-2xl border border-line bg-surface p-5 shadow-[0_1px_2px_rgba(18,23,31,0.04)]"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="flex min-w-0 gap-4">
                    <Avatar name={p.businessName} />
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-base font-semibold">{p.businessName}</h2>
                        <VerificationBadge status={p.verificationStatus} />
                        {wait && <span className="text-xs font-medium text-signal">{wait}</span>}
                      </div>
                      {p.description && (
                        <p className="mt-1.5 line-clamp-2 max-w-2xl text-sm leading-relaxed text-ink-soft">
                          {p.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex shrink-0 flex-wrap items-center gap-2 lg:justify-end">
                    {confirming ? (
                      <>
                        <span className="mr-1 text-sm text-ink-soft">Reject this business?</span>
                        <Button variant="danger" className="h-9" loading={busy} onClick={() => decide(f, "REJECTED")}>
                          Yes, reject
                        </Button>
                        <Button variant="secondary" className="h-9" disabled={busy} onClick={() => setConfirmId(null)}>
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <>
                        {p.verificationStatus !== "VERIFIED" && (
                          <Button className="h-9" loading={busy} onClick={() => decide(f, "VERIFIED")}>
                            <BadgeCheck className="size-4" /> Verify
                          </Button>
                        )}
                        {p.verificationStatus !== "REJECTED" && (
                          <Button variant="secondary" className="h-9" disabled={busy} onClick={() => setConfirmId(f.id)}>
                            <X className="size-4" /> Reject
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                </div>

                <dl className="mt-4 grid gap-x-6 gap-y-3 border-t border-line pt-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
                  <div className="flex items-center gap-2 text-ink-soft">
                    <UserIcon className="size-4 shrink-0" />
                    <dt className="sr-only">Owner</dt>
                    <dd className="truncate text-ink">{f.name}</dd>
                  </div>
                  <div className="flex items-center gap-2 text-ink-soft">
                    <Mail className="size-4 shrink-0" />
                    <dt className="sr-only">Email</dt>
                    <dd className="truncate text-ink">{f.email}</dd>
                  </div>
                  <div className="flex items-center gap-2 text-ink-soft">
                    <Clock className="size-4 shrink-0" />
                    <dt className="sr-only">Joined</dt>
                    <dd className="text-ink">{formatDate(f.createdAt) ? `Joined ${formatDate(f.createdAt)}` : "Join date unknown"}</dd>
                  </div>
                  <div className="flex items-center gap-2 text-ink-soft">
                    <ExternalLink className="size-4 shrink-0" />
                    <dt className="sr-only">Website</dt>
                    <dd className="truncate">
                      {p.website ? (
                        <a
                          href={p.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-brand hover:underline"
                        >
                          {p.website.replace(/^https?:\/\//, "")}
                        </a>
                      ) : (
                        "No website"
                      )}
                    </dd>
                  </div>
                </dl>
              </li>
            );
          })}
        </ul>
      )}

      {!loading && !loadError && withoutProfile > 0 && (
        <p className="text-sm text-ink-soft">
          {withoutProfile} {withoutProfile === 1 ? "founder hasn't" : "founders haven't"} created a business profile yet.
        </p>
      )}
    </div>
  );
}