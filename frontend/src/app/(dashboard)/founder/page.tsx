"use client";
import { cn } from "@/lib/utils";
import Link from "next/link";
import type { ReactNode } from "react";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { useAuth } from "@/hooks/useAuth";

/* ------------------------------------------------------------------ */
/* Shared styles                                                       */
/* ------------------------------------------------------------------ */

const primaryLink =
  "inline-flex h-10 items-center justify-center gap-2 rounded-md bg-brand px-4 text-sm font-medium text-black transition-colors hover:bg-brand-dark";
const secondaryLink =
  "inline-flex h-10 items-center justify-center gap-2 rounded-md border border-line bg-surface px-4 text-sm font-medium text-ink transition-colors hover:bg-canvas";
const panel = "rounded-2xl border border-line bg-surface shadow-[0_1px_2px_rgba(18,23,31,0.04)]";

/* ------------------------------------------------------------------ */
/* Icons                                                               */
/* ------------------------------------------------------------------ */

const iconProps = {
  width: 20,
  height: 20,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
} as const;

const Icon = ({ children, size = 20 }: { children: ReactNode; size?: number }) => (
  <svg {...iconProps} width={size} height={size}>
    {children}
  </svg>
);

const BuildingIcon = () => (
  <Icon>
    <path d="M4 20V6l8-3 8 3v14" />
    <path d="M9 20v-5h6v5M9 9h.01M12 9h.01M15 9h.01M9 12h.01M12 12h.01M15 12h.01" />
  </Icon>
);
const BoxIcon = () => (
  <Icon>
    <path d="M21 8 12 3 3 8v8l9 5 9-5V8Z" />
    <path d="m3 8 9 5 9-5M12 13v8" />
  </Icon>
);
const MegaphoneIcon = () => (
  <Icon>
    <path d="M3 11v2a1 1 0 0 0 1 1h3l8 4V6L7 10H4a1 1 0 0 0-1 1Z" />
    <path d="M19 9a4 4 0 0 1 0 6M7 14l1.5 5" />
  </Icon>
);
const EyeIcon = () => (
  <Icon>
    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
    <circle cx="12" cy="12" r="3" />
  </Icon>
);
const VoteIcon = () => (
  <Icon>
    <rect x="4" y="4" width="16" height="16" rx="3" />
    <path d="m8.5 12.5 2.5 2.5 4.5-5" />
  </Icon>
);
const ListIcon = () => (
  <Icon>
    <path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01" />
  </Icon>
);
const BookmarkIcon = () => (
  <Icon>
    <path d="M6 4h12v17l-6-4-6 4V4Z" />
  </Icon>
);
const ShieldIcon = () => (
  <Icon>
    <path d="M12 3 5 6v5c0 4.5 3 8 7 10 4-2 7-5.5 7-10V6l-7-3Z" />
    <path d="M12 8v4M12 15.5v.01" />
  </Icon>
);
const ArrowIcon = () => (
  <Icon size={16}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </Icon>
);

/* ------------------------------------------------------------------ */
/* Data                                                                */
/* ------------------------------------------------------------------ */

const SIGNALS = [
  { name: "Views", note: "People who saw your campaign", icon: <EyeIcon /> },
  { name: "Votes", note: "Early interest", icon: <VoteIcon /> },
  { name: "Waitlist signups", note: "Stronger purchase interest", icon: <ListIcon /> },
  { name: "Reservations", note: "Higher-intent commitment", icon: <BookmarkIcon /> },
];

const OUTCOMES = [
  { label: "Strong demand", note: "Proceed to launch evaluation", dot: "bg-brand" },
  { label: "Moderate demand", note: "Modify and retest", dot: "bg-signal" },
  { label: "Weak demand", note: "Stop or rethink the idea", dot: "bg-danger" },
  { label: "Inconclusive", note: "Extend or rerun the test", dot: "bg-ink-soft" },
];

/* ------------------------------------------------------------------ */
/* Pieces                                                              */
/* ------------------------------------------------------------------ */

function SetupRow({
  icon,
  title,
  description,
  badge,
  children,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  badge?: string;
  children: ReactNode;
}) {
  return (
    <li className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 gap-4">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-tint text-brand">{icon}</span>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold">{title}</h3>
            {badge && (
              <span className="rounded-full bg-signal-tint px-2.5 py-0.5 text-xs font-medium text-signal">{badge}</span>
            )}
          </div>
          <p className="mt-0.5 text-sm leading-relaxed text-ink-soft">{description}</p>
        </div>
      </div>
      <div className="flex shrink-0 flex-wrap gap-2.5 sm:justify-end">{children}</div>
    </li>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function FounderHome() {
  const { user } = useAuth();
  const firstName = user?.name?.split(" ")[0];

  return (
    <RoleGuard roles={["FOUNDER"]}>
      <div className="mx-auto w-full max-w-6xl space-y-6">
        {/* Header */}
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold sm:text-3xl">Welcome{firstName ? `, ${firstName}` : ""}</h1>
            <p className="mt-1.5 max-w-xl text-ink-soft">
              Validate your product idea with real consumers before you spend on production.
            </p>
          </div>
          <div className="flex flex-wrap gap-2.5">
            <Link href="/founder/products/new" className={secondaryLink}>
              New product
            </Link>
            <Link href="/founder/campaigns/new" className={primaryLink} >
              New campaign
            </Link>
          </div>
        </header>

        {/* Verification notice */}
        <section
          role="status"
          className="flex flex-col gap-4 rounded-2xl border border-signal/30 bg-signal-tint p-5 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex gap-4">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-surface text-signal">
              <ShieldIcon />
            </span>
            <div>
              <h2 className="font-semibold">Get verified to publish campaigns</h2>
              <p className="mt-0.5 text-sm leading-relaxed text-ink-soft">
                Finish your business profile so an admin can verify you. Verified founders can publish validation
                campaigns.
              </p>
            </div>
          </div>
          <Link href="/founder/profile" className={primaryLink}>
            Complete business profile
          </Link>
        </section>

        {/* Demand signals overview */}
        <section aria-labelledby="signals-heading">
          <div className="mb-3 flex items-center justify-between">
            <h2 id="signals-heading" className="text-base font-semibold">
              Demand signals
            </h2>
            <Link href="/founder/campaigns" className="inline-flex items-center gap-1.5 text-sm font-medium text-brand hover:underline">
              View campaigns <ArrowIcon />
            </Link>
          </div>
          <dl className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {SIGNALS.map((s) => (
              <div key={s.name} className={`${panel} p-5`}>
                <div className="flex items-center justify-between text-ink-soft">
                  <dt className="text-sm font-medium">{s.name}</dt>
                  {s.icon}
                </div>
                <dd className="mt-3 text-3xl font-semibold tabular-nums">&mdash;</dd>
                <p className="mt-1 text-xs text-ink-soft">{s.note}</p>
              </div>
            ))}
          </dl>
          <p className="mt-3 text-sm text-ink-soft">
            Numbers appear after your first campaign goes live. Each signal is tracked separately, because likes alone
            are not demand.
          </p>
        </section>

        {/* Setup + guide */}
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <section className={panel} aria-labelledby="setup-heading">
            <div className="border-b border-line px-5 py-4">
              <h2 id="setup-heading" className="text-base font-semibold">
                Get started
              </h2>
              <p className="mt-0.5 text-sm text-ink-soft">Three steps from idea to evidence.</p>
            </div>
            <ul className="divide-y divide-line">
              <SetupRow
                icon={<BuildingIcon />}
                title="Set up your business profile"
                description="Business name, category and website, so an admin can verify you."
                badge="Required to publish"
              >
                <Link href="/founder/profile" className={primaryLink}>
                  Open profile
                </Link>
              </SetupRow>
              <SetupRow
                icon={<BoxIcon />}
                title="Add a product"
                description="Add the product you want to test, with images, price and variants."
              >
                <Link href="/founder/products" className={secondaryLink}>
                  View all
                </Link>
                <Link href="/founder/products/new" className={primaryLink}>
                  New product
                </Link>
              </SetupRow>
              <SetupRow
                icon={<MegaphoneIcon />}
                title="Launch a validation campaign"
                description="Let consumers vote on your variants and see which one wins before you launch."
              >
                <Link href="/founder/campaigns" className={secondaryLink}>
                  View all
                </Link>
                <Link href="/founder/campaigns/new" className={primaryLink}>
                  New campaign
                </Link>
              </SetupRow>
            </ul>
          </section>

          <aside className={`${panel} h-fit p-5`} aria-labelledby="outcomes-heading">
            <h2 id="outcomes-heading" className="text-base font-semibold">
              What your report will say
            </h2>
            <p className="mt-0.5 text-sm text-ink-soft">Every campaign ends with one of four outcomes.</p>
            <ul className="mt-4 space-y-3.5">
              {OUTCOMES.map((o) => (
                <li key={o.label} className="flex gap-3">
                  <span className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${o.dot}`} aria-hidden />
                  <div>
                    <p className="text-sm font-medium">{o.label}</p>
                    <p className="text-sm text-ink-soft">{o.note}</p>
                  </div>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </div>
    </RoleGuard>
  );
}