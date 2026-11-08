"use client";

import Link from "next/link";
import { BellRing, ChevronRight, Compass, Heart, ThumbsUp, UserCircle } from "lucide-react";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { useAuth } from "@/hooks/useAuth";

const ACTIONS = [
  {
    href: "/consumer/discover",
    icon: Compass,
    title: "Discover products",
    body: "Browse campaigns that are live right now and tell founders what you think.",
    cta: "Start browsing",
    tone: "bg-brand-tint text-brand",
  },
  {
    href: "/consumer/profile",
    icon: UserCircle,
    title: "Your interests",
    body: "Choose the categories you want to see first, so the best matches come to you.",
    cta: "Choose interests",
    tone: "bg-signal-tint text-signal",
  },
];

const STEPS = [
  { icon: Compass, title: "Browse", body: "Find new product ideas before they exist." },
  { icon: ThumbsUp, title: "Vote and comment", body: "Pick your favourite variant and say what you'd change." },
  { icon: BellRing, title: "Join waitlists", body: "Get told when something you backed is ready to launch." },
];

export default function ConsumerHome() {
  const { user } = useAuth();
  const firstName = user?.name?.split(" ")[0];

  return (
    <RoleGuard roles={["CONSUMER"]}>
      <div className="space-y-8">
        {/* Hero */}
        <section className="relative overflow-hidden rounded-3xl bg-linear-to-br from-brand to-brand-dark p-6 text-white shadow-[0_20px_40px_-24px] shadow-brand sm:p-8">
          <div aria-hidden className="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
          <div aria-hidden className="absolute -bottom-24 left-1/3 h-56 w-56 rounded-full bg-black/20 blur-3xl" />
          <div
            aria-hidden
            className="absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage: "radial-gradient(circle at 1px 1px, #fff 1px, transparent 0)",
              backgroundSize: "24px 24px",
            }}
          />
          <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold sm:text-3xl">Welcome{firstName ? `, ${firstName}` : ""}</h1>
              <p className="mt-1.5 max-w-md text-white/80">Help founders find out what&apos;s worth making.</p>
            </div>
            <Link
              href="/consumer/discover"
              className="inline-flex h-11 shrink-0 items-center justify-center gap-1.5 rounded-lg bg-white px-5 text-sm font-semibold text-brand-dark transition hover:bg-white/90 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/30"
            >
              Discover products <ChevronRight className="size-4" />
            </Link>
          </div>
        </section>

        {/* Actions */}
        <section aria-label="Get started" className="grid gap-4 sm:grid-cols-2">
          {ACTIONS.map(({ href, icon: Icon, title, body, cta, tone }) => (
            <Link
              key={href}
              href={href}
              className="group flex flex-col rounded-2xl border border-line bg-surface p-6 shadow-[0_1px_2px_rgba(18,23,31,0.04)] transition hover:border-ink-soft/40 hover:shadow-[0_12px_30px_-18px_rgba(18,23,31,0.3)]"
            >
              <span className={`grid size-12 place-items-center rounded-xl ${tone}`}>
                <Icon className="size-6" />
              </span>
              <h2 className="mt-5 text-lg font-semibold">{title}</h2>
              <p className="mt-1.5 flex-1 text-sm leading-relaxed text-ink-soft">{body}</p>
              <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-brand">
                {cta}
                <ChevronRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          ))}
        </section>

        {/* How it works */}
        <section
          aria-labelledby="how-heading"
          className="rounded-2xl border border-line bg-surface p-6 shadow-[0_1px_2px_rgba(18,23,31,0.04)]"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 id="how-heading" className="text-base font-semibold">
              How your feedback helps
            </h2>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-tint px-3 py-1 text-xs font-medium text-brand-dark">
              <Heart className="size-3.5" /> Always free for you
            </span>
          </div>
          <ol className="mt-5 grid gap-5 sm:grid-cols-3">
            {STEPS.map(({ icon: Icon, title, body }, i) => (
              <li key={title} className="flex gap-4">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-canvas text-ink-soft">
                  <Icon className="size-5" />
                </span>
                <div>
                  <p className="text-sm font-semibold">
                    <span className="mr-1.5 text-ink-soft tabular-nums">{i + 1}.</span>
                    {title}
                  </p>
                  <p className="mt-0.5 text-sm leading-relaxed text-ink-soft">{body}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </RoleGuard>
  );
}