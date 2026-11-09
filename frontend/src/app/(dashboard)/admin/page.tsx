"use client";

import { useCallback, useEffect, useState, type ComponentType } from "react";
import Link from "next/link";
import { AlertCircle, BadgeCheck, ChevronRight, Clock, ShieldCheck, UserX, Users } from "lucide-react";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { adminApi, type AdminUser } from "@/features/admin/admin.api";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

type Overview = {
  pending: number;
  verified: number;
  users: number;
  suspended: number;
  queue: AdminUser[]; // pending businesses, longest wait first
};

const panel = "rounded-2xl border border-line bg-surface shadow-[0_1px_2px_rgba(0,0,0,0.3)]";

function waiting(iso?: string) {
  if (!iso) return "Waiting for review";
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (days <= 0) return "Joined today";
  return `Waiting ${days} ${days === 1 ? "day" : "days"}`;
}

/* ------------------------------------------------------------------ */
/* Stat tile                                                           */
/* ------------------------------------------------------------------ */

function Stat({
  label,
  value,
  icon: Icon,
  tone,
  href,
  highlight,
  loading,
}: {
  label: string;
  value: number;
  icon: ComponentType<{ className?: string }>;
  tone: string;
  href: string;
  highlight?: boolean;
  loading: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group flex items-center gap-4 rounded-2xl border p-5 transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand/20",
        highlight
          ? "border-signal/30 bg-signal-tint hover:border-signal/60"
          : "border-line bg-surface hover:border-brand/50"
      )}
    >
      <span className={cn("grid size-11 shrink-0 place-items-center rounded-xl", tone)}>
        <Icon className="size-5" />
      </span>
      <span className="min-w-0">
        <span className="block text-2xl font-semibold leading-none tabular-nums">
          {loading ? <Skeleton className="h-6 w-10" /> : value.toLocaleString()}
        </span>
        <span className="mt-1.5 block text-sm text-ink-soft">{label}</span>
      </span>
    </Link>
  );
}

/* ------------------------------------------------------------------ */
/* Dashboard (rendered inside RoleGuard so non-admins never fetch)     */
/* ------------------------------------------------------------------ */

function Dashboard() {
  const [data, setData] = useState<Overview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const [founders, all, suspended] = await Promise.all([
        adminApi.listAllFounders(),
        adminApi.listUsers({ limit: 1 }),
        adminApi.listUsers({ status: "SUSPENDED", limit: 1 }),
      ]);

      const status = (f: AdminUser) => f.founderProfile?.verificationStatus;
      const pendingList = founders
        .filter((f) => status(f) === "PENDING")
        .sort((a, b) => (a.createdAt ?? "").localeCompare(b.createdAt ?? ""));

      setData({
        pending: pendingList.length,
        verified: founders.filter((f) => status(f) === "VERIFIED").length,
        users: all.pagination.total,
        suspended: suspended.pagination.total,
        queue: pendingList.slice(0, 4),
      });
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const { user } = useAuth();
  const firstName = user?.name?.split(" ")[0];
  const pending = data?.pending ?? 0;

  return (
    <div className="space-y-8">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl border border-line bg-linear-to-br from-line via-surface to-canvas p-6 text-ink shadow-[0_30px_60px_-30px_rgba(0,0,0,0.8)] sm:p-8">
        <div aria-hidden className="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-brand/25 blur-3xl" />
        <div aria-hidden className="absolute -bottom-24 left-1/3 h-56 w-56 rounded-full bg-black/40 blur-3xl" />
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, var(--color-brand) 1px, transparent 0)",
            backgroundSize: "24px 24px",
          }}
        />
        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-ink sm:text-3xl">
              Welcome back
              {firstName && (
                <>
                  , <span className="text-brand">{firstName}</span>
                </>
              )}
            </h1>
            <p className="mt-1.5 max-w-md text-ink/70">
              {loading
                ? "Checking the review queue..."
                : pending > 0
                  ? `${pending} ${pending === 1 ? "business is" : "businesses are"} waiting for your review.`
                  : "You're all caught up. No businesses are waiting for review."}
            </p>
          </div>
          <Link
            href="/admin/verification"
            className="inline-flex h-11 shrink-0 items-center justify-center gap-1.5 rounded-lg bg-brand px-5 text-sm font-semibold text-black! shadow-[0_10px_24px_-10px] shadow-brand/60 transition hover:bg-brand hover:brightness-110 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand/30"
          >
            {pending > 0 ? "Review now" : "Open verification"} <ChevronRight className="size-4" />
          </Link>
        </div>
      </section>

      {error && (
        <div
          role="alert"
          className="flex flex-col gap-3 rounded-2xl border border-danger/30 bg-danger-tint p-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <p className="flex items-center gap-2 text-sm text-danger">
            <AlertCircle className="size-4 shrink-0" /> Couldn&apos;t load the overview numbers.
          </p>
          <Button variant="secondary" className="h-9" onClick={load}>
            Try again
          </Button>
        </div>
      )}

      {/* Overview */}
      <section aria-label="Overview">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <Stat
            label="Awaiting review"
            value={pending}
            icon={Clock}
            tone="bg-signal-tint text-signal"
            href="/admin/verification"
            highlight={!loading && pending > 0}
            loading={loading}
          />
          <Stat
            label="Verified businesses"
            value={data?.verified ?? 0}
            icon={BadgeCheck}
            tone="bg-brand-tint text-brand"
            href="/admin/verification"
            loading={loading}
          />
          <Stat
            label="Total users"
            value={data?.users ?? 0}
            icon={Users}
            tone="bg-canvas text-ink-soft"
            href="/admin/users"
            loading={loading}
          />
          <Stat
            label="Suspended accounts"
            value={data?.suspended ?? 0}
            icon={UserX}
            tone="bg-danger-tint text-danger"
            href="/admin/users"
            loading={loading}
          />
        </div>
      </section>

      {/* Review queue */}
      {(loading || pending > 0) && (
        <section className={panel} aria-labelledby="queue-heading">
          <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
            <div>
              <h2 id="queue-heading" className="text-base font-semibold">
                Waiting longest
              </h2>
              <p className="mt-0.5 text-sm text-ink-soft">Businesses that have been in the queue the longest.</p>
            </div>
            <Link
              href="/admin/verification"
              className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-brand hover:underline"
            >
              {pending > 4 ? `View all ${pending}` : "Open queue"} <ChevronRight className="size-4" />
            </Link>
          </div>

          <ul className="divide-y divide-line">
            {loading
              ? Array.from({ length: 3 }).map((_, i) => (
                  <li key={i} className="flex items-center gap-4 px-5 py-4">
                    <Skeleton className="size-9 rounded-full" />
                    <div className="space-y-1.5">
                      <Skeleton className="h-3.5 w-40" />
                      <Skeleton className="h-3 w-56" />
                    </div>
                  </li>
                ))
              : data!.queue.map((f) => (
                  <li key={f.id}>
                    <Link
                      href="/admin/verification"
                      className="group flex items-center gap-4 px-5 py-4 transition-colors hover:bg-brand-tint"
                    >
                      <Avatar name={f.founderProfile!.businessName} size="sm" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-medium">{f.founderProfile!.businessName}</span>
                        <span className="block truncate text-sm text-ink-soft">
                          {f.name} · {f.email}
                        </span>
                      </span>
                      <span className="hidden shrink-0 text-sm font-medium text-signal sm:block">
                        {waiting(f.createdAt)}
                      </span>
                      <ChevronRight className="size-4 shrink-0 text-ink-soft transition-transform group-hover:translate-x-0.5" />
                    </Link>
                  </li>
                ))}
          </ul>
        </section>
      )}

      {/* Manage */}
      <section aria-labelledby="manage-heading">
        <h2 id="manage-heading" className="mb-3 text-base font-semibold">
          Manage
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Link
            href="/admin/verification"
            className={cn(panel, "group flex items-start gap-4 p-5 transition hover:border-brand/50")}
          >
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-brand-tint text-brand">
              <ShieldCheck className="size-5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-2 font-semibold">
                Business verification
                {!loading && pending > 0 && (
                  <span className="rounded-full bg-signal-tint px-2 py-0.5 text-xs font-medium text-signal">
                    {pending} pending
                  </span>
                )}
              </span>
              <span className="mt-1 block text-sm leading-relaxed text-ink-soft">
                Review new business profiles and approve or reject them.
              </span>
            </span>
            <ChevronRight className="mt-1 size-4 text-ink-soft transition-transform group-hover:translate-x-0.5" />
          </Link>

          <Link
            href="/admin/users"
            className={cn(panel, "group flex items-start gap-4 p-5 transition hover:border-brand/50")}
          >
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-canvas text-ink-soft">
              <Users className="size-5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-semibold">Users</span>
              <span className="mt-1 block text-sm leading-relaxed text-ink-soft">
                Search accounts and suspend anyone who breaks the rules.
              </span>
            </span>
            <ChevronRight className="mt-1 size-4 text-ink-soft transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </section>
    </div>
  );
}

export default function AdminHome() {
  return (
    <RoleGuard roles={["ADMIN"]}>
      <Dashboard />
    </RoleGuard>
  );
}