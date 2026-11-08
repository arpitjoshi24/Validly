import Link from "next/link";
import type { ReactNode } from "react";
import {
  Activity,
  ArrowRight,
  Check,
  Compass,
  Lightbulb,
  Lock,
  Megaphone,
  Plus,
  ShieldCheck,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { PriceTest } from "@/components/landing/PriceTest";

/* ------------------------------------------------------------------ */
/* Content                                                             */
/* ------------------------------------------------------------------ */

const STEPS = [
  { icon: Lightbulb, title: "Create your concept", body: "Add images, price, target audience and the variants you want to compare." },
  { icon: Megaphone, title: "Run a campaign", body: "Publish a time-boxed test. Consumers react without paying a rupee." },
  { icon: Activity, title: "Measure real signals", body: "Views, votes, comments, polls, waitlists and reservations, all kept apart." },
  { icon: Compass, title: "Get a clear decision", body: "A report with evidence, risks and a next step: proceed, modify, retest or stop." },
];

const LADDER = [
  { name: "Views", note: "Visibility", level: 12 },
  { name: "Likes", note: "First interest", level: 22 },
  { name: "Comments", note: "Qualitative feedback", level: 36 },
  { name: "Poll votes", note: "Preference", level: 50 },
  { name: "Price acceptance", note: "Willingness to pay", level: 64 },
  { name: "Waitlist", note: "Purchase intent", level: 78 },
  { name: "Reservations", note: "Commitment", level: 92 },
  { name: "Purchases", note: "Actual demand", level: 100 },
];

const OUTCOMES = [
  { title: "Strong demand", signal: "High intent, reservations and favourable feedback.", action: "Proceed to launch evaluation", bar: "bg-brand", text: "text-brand" },
  { title: "Moderate demand", signal: "Interest exists, but the price or product needs work.", action: "Modify and retest", bar: "bg-signal", text: "text-signal" },
  { title: "Weak demand", signal: "Low purchase intent and poor feedback.", action: "Stop or rethink the idea", bar: "bg-danger", text: "text-danger" },
  { title: "Inconclusive", signal: "Not enough responses for a reliable call.", action: "Extend or rerun the test", bar: "bg-ink-soft", text: "text-ink-soft" },
];

const TRUST = [
  {
    icon: Sparkles,
    title: "AI that separates evidence from assumptions",
    body: "The assistant reads your collected feedback and explains it. It never invents demand and never promises that a product will succeed.",
  },
  {
    icon: Activity,
    title: "Scores you can inspect",
    body: "Every demand score shows its confidence level and the minimum sample size behind it, so a thin result is never passed off as a win.",
  },
  {
    icon: ShieldCheck,
    title: "Fake demand stays out",
    body: "Rate limiting, anomaly detection and audit trails keep spam and manipulated votes from distorting your numbers.",
  },
];

const PLANS = [
  {
    name: "Explorer",
    price: "Free",
    note: "Try your first idea",
    features: ["One active campaign", "Basic engagement analytics", "Limited consumer feedback"],
    featured: false,
  },
  {
    name: "Founder Pro",
    price: "Rs. 999",
    note: "per month",
    features: ["Multiple campaigns", "Advanced analytics", "AI feedback analysis", "Variant comparison", "Campaign reports"],
    featured: true,
  },
  {
    name: "Business",
    price: "Rs. 2,999",
    note: "per month",
    features: ["Team members", "Advanced experiments", "Audience segmentation", "Exportable reports", "Priority support"],
    featured: false,
  },
];

const FAQ = [
  {
    q: "Is a vote the same as a customer?",
    a: "No. Interest is not a confirmed buyer, so Validly keeps views, votes, waitlist signups, reservations and purchases separate everywhere. A campaign with 5,000 likes and 20 waitlist signups is flagged as a weak commercial signal.",
  },
  {
    q: "What if my campaign doesn't get enough traffic?",
    a: "Validly tells you the result is inconclusive instead of guessing. It separates \"nobody wants this\" from \"not enough people have seen it\", and suggests extending or rerunning the test.",
  },
  {
    q: "Do consumers have to pay?",
    a: "Never to give feedback. Consumers vote, comment, pick variants and join waitlists for free.",
  },
  {
    q: "Does Validly take equity in my product?",
    a: "No. Validly earns from subscriptions, so what we earn does not depend on whether your campaign succeeds or fails.",
  },
  {
    q: "Can the AI tell me my product will succeed?",
    a: "No, and it is built not to. It summarises what your consumers actually said and did, flags risks such as price objections, and recommends a next step grounded in that evidence.",
  },
  {
    q: "Does Validly handle manufacturing?",
    a: "Not yet. Version 1 stops at validation and launch preparation, including the final demand report and your waitlist export.",
  },
];

/* ------------------------------------------------------------------ */
/* Small building blocks                                               */
/* ------------------------------------------------------------------ */

const container = "mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8";
const primaryBtn =
  "inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-brand px-6 text-[15px] font-semibold text-white shadow-[0_12px_24px_-12px] shadow-brand transition hover:bg-brand-dark active:scale-[0.99]";
const secondaryBtn =
  "inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-line bg-surface px-6 text-[15px] font-semibold text-ink transition hover:bg-canvas active:scale-[0.99]";

function SectionHeading({ label, title, body, center }: { label: string; title: ReactNode; body?: string; center?: boolean }) {
  return (
    <div className={center ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      <p className="text-sm font-semibold text-brand">{label}</p>
      <h2 className="mt-2 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">{title}</h2>
      {body && <p className="mt-4 text-lg leading-relaxed text-ink-soft">{body}</p>}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Hero product preview                                                */
/* ------------------------------------------------------------------ */

function HeroPreview() {
  const circumference = 2 * Math.PI * 42;
  const offset = circumference * (1 - 0.72);

  return (
    <div className="relative mx-auto w-full max-w-md lg:max-w-none">
      <div className="rounded-3xl border border-line bg-surface p-5 shadow-[0_40px_80px_-30px_rgba(11,107,99,0.35)] sm:p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-ink-soft">Campaign</p>
            <p className="font-display text-lg font-semibold">Spicy Chips Share</p>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full bg-brand-tint px-3 py-1 text-xs font-medium text-brand-dark">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-brand opacity-60" />
              <span className="relative inline-flex size-2 rounded-full bg-brand" />
            </span>
            Live
          </span>
        </div>

        <div className="mt-6 flex items-center gap-5">
          <div className="relative size-28 shrink-0">
            <svg viewBox="0 0 100 100" className="size-full -rotate-90" aria-hidden>
              <circle cx="50" cy="50" r="42" fill="none" strokeWidth="9" className="stroke-canvas" />
              <circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                strokeWidth="9"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                className="stroke-brand"
              />
            </svg>
            <div className="absolute inset-0 grid place-items-center text-center">
              <div>
                <p className="font-display text-3xl font-semibold leading-none tabular-nums">72</p>
                <p className="mt-1 text-[11px] text-ink-soft">Demand index</p>
              </div>
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-brand">Strong demand</p>
            <p className="mt-1 text-sm leading-snug text-ink-soft">Enough intent to move to launch evaluation.</p>
            <div className="mt-3 grid grid-cols-2 gap-2 text-center">
              <div className="rounded-xl bg-canvas px-2 py-2">
                <p className="font-semibold tabular-nums">1,200</p>
                <p className="text-[11px] text-ink-soft">Waitlist</p>
              </div>
              <div className="rounded-xl bg-canvas px-2 py-2">
                <p className="font-semibold tabular-nums">Rs. 49</p>
                <p className="text-[11px] text-ink-soft">Preferred price</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 border-t border-line pt-5">
          <p className="mb-3 text-sm font-medium">Preferred flavour</p>
          <ul className="space-y-3">
            {[
              ["Masala", 58],
              ["Cheese", 27],
              ["Peri Peri", 15],
            ].map(([name, pct]) => (
              <li key={name as string}>
                <div className="mb-1 flex justify-between text-sm">
                  <span>{name}</span>
                  <span className="font-semibold tabular-nums">{pct}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-canvas">
                  <div className={`h-full rounded-full ${pct === 58 ? "bg-brand" : "bg-line"}`} style={{ width: `${pct}%` }} />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Floating notes */}
      <div className="absolute -left-4 bottom-10 hidden items-center gap-3 rounded-2xl border border-line bg-surface px-4 py-3 shadow-[0_20px_40px_-20px_rgba(18,23,31,0.35)] sm:flex lg:-left-10">
        <span className="grid size-9 place-items-center rounded-xl bg-signal-tint text-signal">
          <Sparkles className="size-[18px]" />
        </span>
        <div>
          <p className="text-sm font-semibold">AI insight</p>
          <p className="text-xs text-ink-soft">Some voters say the price is high</p>
        </div>
      </div>
      <div className="absolute -right-3 -top-4 hidden items-center gap-2 rounded-2xl border border-line bg-surface px-4 py-2.5 shadow-[0_20px_40px_-20px_rgba(18,23,31,0.35)] sm:flex lg:-right-6">
        <span className="grid size-6 place-items-center rounded-full bg-brand text-white">
          <Check className="size-3.5" />
        </span>
        <p className="text-sm font-medium">New reservation</p>
      </div>
      <p className="mt-4 text-center text-xs text-ink-soft">Illustrative demo data, not real market results.</p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function LandingPage() {
  return (
    <>
      <Navbar />
      <main>
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div aria-hidden className="absolute -left-40 -top-32 h-[32rem] w-[32rem] rounded-full bg-brand-tint blur-3xl" />
          <div aria-hidden className="absolute -right-40 top-40 h-[28rem] w-[28rem] rounded-full bg-signal-tint/70 blur-3xl" />
          <div
            aria-hidden
            className="absolute inset-0 opacity-60"
            style={{
              backgroundImage:
                "linear-gradient(to right, rgba(18,23,31,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(18,23,31,0.05) 1px, transparent 1px)",
              backgroundSize: "56px 56px",
              maskImage: "radial-gradient(ellipse 70% 60% at 50% 30%, black, transparent)",
              WebkitMaskImage: "radial-gradient(ellipse 70% 60% at 50% 30%, black, transparent)",
            }}
          />

          <div className={`${container} relative grid items-center gap-14 pb-20 pt-16 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10 lg:pb-28 lg:pt-24`}>
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-line bg-surface/80 px-3.5 py-1.5 text-sm font-medium text-ink-soft backdrop-blur">
                <span className="size-1.5 rounded-full bg-brand" />
                Validate before you manufacture
              </span>
              <h1 className="mt-6 text-5xl font-semibold leading-[1.03] tracking-tight sm:text-6xl lg:text-[4.25rem]">
                Find out if <span className="text-brand">anyone will buy it</span> before you manufacture it.
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-soft">
                Publish a product idea, let real consumers vote, join waitlists and reserve, then get a report that tells
                you whether to proceed, change it, retest or stop.
              </p>
              <div className="mt-9 flex flex-wrap gap-3">
                <Link href="/register" className={primaryBtn}>
                  Test your idea <ArrowRight className="size-4" />
                </Link>
                <Link href="/login" className={secondaryBtn}>
                  Log in
                </Link>
              </div>
              <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-ink-soft">
                {["Free to start", "No card needed", "Consumers never pay"].map((t) => (
                  <li key={t} className="flex items-center gap-2">
                    <Check className="size-4 text-brand" /> {t}
                  </li>
                ))}
              </ul>
            </div>

            <HeroPreview />
          </div>
        </section>

        {/* Problem / solution */}
        <section className="border-y border-line bg-surface">
          <div className={`${container} py-20`}>
            <SectionHeading
              center
              label="The problem"
              title="Most early failures come from building something nobody wanted."
              body="A founder usually pays for packaging, manufacturing and marketing before learning whether anyone will buy."
            />
            <div className="mt-12 grid gap-5 md:grid-cols-2">
              <div className="rounded-3xl border border-line bg-canvas p-7">
                <p className="font-display text-xl font-semibold">The usual way</p>
                <ul className="mt-5 space-y-3.5">
                  {["Pay for packaging and manufacturing", "Spend on marketing and launch", "Finally find out if people will buy"].map((t) => (
                    <li key={t} className="flex gap-3 text-ink-soft">
                      <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-danger-tint text-danger">
                        <X className="size-3" />
                      </span>
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-3xl border border-brand/20 bg-brand-tint p-7">
                <p className="font-display text-xl font-semibold text-brand-dark">With Validly</p>
                <ul className="mt-5 space-y-3.5">
                  {["Publish the idea and let consumers react", "Read real signals, not vanity metrics", "Spend on production only when the evidence says so"].map((t) => (
                    <li key={t} className="flex gap-3 text-brand-dark">
                      <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-brand text-white">
                        <Check className="size-3" />
                      </span>
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how" className={`${container} py-24`}>
          <SectionHeading center label="How it works" title="From idea to evidence in four steps." />
          <ol className="relative mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {STEPS.map(({ icon: Icon, title, body }, i) => (
              <li key={title} className="relative rounded-3xl border border-line bg-surface p-6 shadow-[0_1px_2px_rgba(18,23,31,0.04)]">
                <div className="flex items-center justify-between">
                  <span className="grid size-12 place-items-center rounded-2xl bg-brand-tint text-brand">
                    <Icon className="size-6" />
                  </span>
                  <span className="font-display text-4xl font-semibold text-line">0{i + 1}</span>
                </div>
                <h3 className="mt-5 text-lg font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">{body}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* Signals */}
        <section className="bg-ink text-white">
          <div className={`${container} py-24`}>
            <div className="max-w-3xl">
              <p className="text-sm font-semibold text-brand-tint">Demand signals</p>
              <h2 className="mt-2 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
                Likes aren&apos;t demand. Validly keeps each signal separate.
              </h2>
              <p className="mt-4 text-lg leading-relaxed text-white/70">
                The further a signal sits from a casual tap, the more it tells you about real purchase intent. Your
                report shows each one on its own.
              </p>
            </div>

            {/* Desktop: rising columns */}
            <ul className="mt-14 hidden grid-cols-8 items-end gap-3 lg:grid">
              {LADDER.map((s, i) => (
                <li key={s.name} className="flex flex-col">
                  <div
                    className={`rounded-t-xl ${i >= 5 ? "bg-brand" : "bg-white/15"}`}
                    style={{ height: `${s.level * 2.4}px` }}
                  />
                  <div className="border-t border-white/20 pt-3">
                    <p className="text-sm font-semibold">{s.name}</p>
                    <p className="mt-0.5 text-xs text-white/60">{s.note}</p>
                  </div>
                </li>
              ))}
            </ul>

            {/* Mobile: horizontal bars */}
            <ul className="mt-10 space-y-4 lg:hidden">
              {LADDER.map((s, i) => (
                <li key={s.name}>
                  <div className="mb-1.5 flex items-baseline justify-between">
                    <p className="text-sm font-semibold">{s.name}</p>
                    <p className="text-xs text-white/60">{s.note}</p>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-white/10">
                    <div className={`h-full rounded-full ${i >= 5 ? "bg-brand" : "bg-white/40"}`} style={{ width: `${s.level}%` }} />
                  </div>
                </li>
              ))}
            </ul>

            <p className="mt-10 flex flex-wrap items-center gap-2 text-sm text-white/70">
              <span className="rounded-full bg-white/10 px-3 py-1">Casual interest</span>
              <ArrowRight className="size-4" />
              <span className="rounded-full bg-brand px-3 py-1 font-medium text-white">Real commitment</span>
            </p>
          </div>
        </section>

        {/* Price test */}
        <section className={`${container} py-24`}>
          <div className="grid items-center gap-12 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <SectionHeading
                label="Test more than the idea"
                title="Even the price gets tested."
                body="Try different prices, flavours, packaging or taglines with controlled experiments. Validly shows how purchase intent moves, so you can pick a number your audience will actually pay."
              />
              <ul className="mt-8 space-y-3">
                {["Price acceptance, measured not guessed", "Variant comparison across flavours and packaging", "Statistical uncertainty shown, not hidden"].map((t) => (
                  <li key={t} className="flex items-center gap-3 text-ink-soft">
                    <span className="grid size-5 shrink-0 place-items-center rounded-full bg-brand text-white">
                      <Check className="size-3" />
                    </span>
                    {t}
                  </li>
                ))}
              </ul>
            </div>
            <PriceTest />
          </div>
        </section>

        {/* Outcomes */}
        <section className="border-y border-line bg-surface">
          <div className={`${container} py-24`}>
            <SectionHeading
              center
              label="The decision"
              title="Four outcomes, not just pass or fail."
              body="Every campaign ends with a clear recommendation and the evidence behind it."
            />
            <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {OUTCOMES.map((o) => (
                <div key={o.title} className="overflow-hidden rounded-3xl border border-line bg-surface shadow-[0_1px_2px_rgba(18,23,31,0.04)]">
                  <div className={`h-1.5 ${o.bar}`} />
                  <div className="p-6">
                    <h3 className={`font-display text-lg font-semibold ${o.text}`}>{o.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-ink-soft">{o.signal}</p>
                    <p className="mt-5 flex items-center gap-2 border-t border-line pt-4 text-sm font-medium">
                      <ArrowRight className="size-4 text-ink-soft" /> {o.action}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Two sides */}
        <section className={`${container} py-24`}>
          <SectionHeading center label="Built for both sides" title="Founders get evidence. Consumers get a say." />
          <div className="mt-14 grid gap-5 lg:grid-cols-2">
            <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-brand to-brand-dark p-8 text-white">
              <div aria-hidden className="absolute -right-20 -top-20 size-64 rounded-full bg-white/10 blur-3xl" />
              <span className="relative grid size-12 place-items-center rounded-2xl bg-white/15">
                <Lightbulb className="size-6" />
              </span>
              <h3 className="relative mt-6 text-2xl font-semibold">For founders</h3>
              <ul className="relative mt-5 space-y-3">
                {[
                  "Publish a time-boxed campaign with variants and price",
                  "Watch views, votes, waitlists and reservations live",
                  "Get an AI-assisted report grounded in your evidence",
                ].map((t) => (
                  <li key={t} className="flex gap-3 text-white/90">
                    <Check className="mt-0.5 size-5 shrink-0" /> {t}
                  </li>
                ))}
              </ul>
              <Link
                href="/register"
                className="relative mt-8 inline-flex h-12 items-center gap-2 rounded-xl bg-white px-6 text-[15px] font-semibold text-brand-dark transition hover:bg-white/90"
              >
                Start as a founder <ArrowRight className="size-4" />
              </Link>
            </div>

            <div className="rounded-3xl border border-line bg-surface p-8 shadow-[0_1px_2px_rgba(18,23,31,0.04)]">
              <span className="grid size-12 place-items-center rounded-2xl bg-signal-tint text-signal">
                <Users className="size-6" />
              </span>
              <h3 className="mt-6 text-2xl font-semibold">For consumers</h3>
              <ul className="mt-5 space-y-3">
                {[
                  "Discover products before they exist",
                  "Vote, comment, pick variants and join waitlists",
                  "Never pay to give feedback. It's always free",
                ].map((t) => (
                  <li key={t} className="flex gap-3 text-ink-soft">
                    <Check className="mt-0.5 size-5 shrink-0 text-brand" /> {t}
                  </li>
                ))}
              </ul>
              <Link href="/register" className={`${secondaryBtn} mt-8`}>
                Join as a consumer <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* Trust */}
        <section className="border-y border-line bg-surface">
          <div className={`${container} py-24`}>
            <SectionHeading center label="Trust" title="Honest numbers or no numbers." />
            <div className="mt-14 grid gap-5 md:grid-cols-3">
              {TRUST.map(({ icon: Icon, title, body }) => (
                <div key={title} className="rounded-3xl border border-line bg-canvas p-7">
                  <span className="grid size-12 place-items-center rounded-2xl bg-surface text-brand shadow-sm">
                    <Icon className="size-6" />
                  </span>
                  <h3 className="mt-5 text-lg font-semibold leading-snug">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-soft">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className={`${container} py-24`}>
          <SectionHeading
            center
            label="Pricing"
            title="Simple plans. Your results never change the price."
            body="Founders pay a subscription. Validly earns the same whether your campaign succeeds or fails."
          />
          <div className="mt-14 grid gap-5 lg:grid-cols-3">
            {PLANS.map((p) => (
              <div
                key={p.name}
                className={`relative flex flex-col rounded-3xl p-8 ${
                  p.featured
                    ? "bg-ink text-white shadow-[0_40px_80px_-40px_rgba(18,23,31,0.7)] lg:-my-3"
                    : "border border-line bg-surface shadow-[0_1px_2px_rgba(18,23,31,0.04)]"
                }`}
              >
                {p.featured && (
                  <span className="absolute right-6 top-6 rounded-full bg-brand px-3 py-1 text-xs font-semibold text-white">
                    Most popular
                  </span>
                )}
                <h3 className="text-lg font-semibold">{p.name}</h3>
                <p className="mt-5 flex items-baseline gap-2">
                  <span className="font-display text-4xl font-semibold tracking-tight">{p.price}</span>
                  <span className={p.featured ? "text-white/60" : "text-ink-soft"}>{p.note}</span>
                </p>
                <ul className="mt-7 flex-1 space-y-3">
                  {p.features.map((f) => (
                    <li key={f} className="flex gap-3 text-sm">
                      <Check className={`mt-0.5 size-4 shrink-0 ${p.featured ? "text-brand-tint" : "text-brand"}`} /> {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/register"
                  className={`mt-8 inline-flex h-11 items-center justify-center rounded-xl text-sm font-semibold transition ${
                    p.featured ? "bg-white text-ink hover:bg-white/90" : "border border-line hover:bg-canvas"
                  }`}
                >
                  {p.price === "Free" ? "Start free" : `Choose ${p.name}`}
                </Link>
              </div>
            ))}
          </div>
          <p className="mt-6 text-center text-sm text-ink-soft">Consumers are always free.</p>
        </section>

        {/* FAQ */}
        <section id="faq" className="border-t border-line bg-surface">
          <div className={`${container} grid gap-12 py-24 lg:grid-cols-[0.8fr_1.2fr]`}>
            <SectionHeading label="Questions" title="Things founders ask before they start." />
            <div className="divide-y divide-line rounded-3xl border border-line bg-canvas px-6">
              {FAQ.map((f) => (
                <details key={f.q} className="group py-5">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold [&::-webkit-details-marker]:hidden">
                    {f.q}
                    <Plus className="size-5 shrink-0 text-ink-soft transition-transform group-open:rotate-45" />
                  </summary>
                  <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-soft">{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className={`${container} py-24`}>
          <div className="relative overflow-hidden rounded-[2rem] bg-linear-to-br from-brand to-brand-dark px-6 py-16 text-center text-white sm:px-12 sm:py-20">
            <div aria-hidden className="absolute -left-20 -top-24 size-80 rounded-full bg-white/10 blur-3xl" />
            <div aria-hidden className="absolute -bottom-32 -right-16 size-80 rounded-full bg-black/20 blur-3xl" />
            <div
              aria-hidden
              className="absolute inset-0 opacity-[0.07]"
              style={{ backgroundImage: "radial-gradient(circle at 1px 1px, #fff 1px, transparent 0)", backgroundSize: "24px 24px" }}
            />
            <div className="relative">
              <h2 className="mx-auto max-w-2xl text-3xl font-semibold leading-tight tracking-tight sm:text-5xl">
                Spend on production only when the evidence says so.
              </h2>
              <p className="mx-auto mt-5 max-w-xl text-lg text-white/80">
                Publish your first campaign for free and see what real consumers think.
              </p>
              <div className="mt-9 flex flex-wrap justify-center gap-3">
                <Link
                  href="/register"
                  className="inline-flex h-12 items-center gap-2 rounded-xl bg-white px-7 text-[15px] font-semibold text-brand-dark transition hover:bg-white/90"
                >
                  Test your idea <ArrowRight className="size-4" />
                </Link>
                <Link
                  href="/login"
                  className="inline-flex h-12 items-center rounded-xl border border-white/40 px-7 text-[15px] font-semibold text-white transition hover:bg-white/10"
                >
                  Log in
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-line bg-surface">
        <div className={`${container} flex flex-col gap-6 py-10 sm:flex-row sm:items-center sm:justify-between`}>
          <div>
            <p className="flex items-center gap-2.5 font-display text-lg font-semibold">
              <span className="grid size-8 place-items-center rounded-lg bg-brand text-white">
                <Check className="size-[18px]" />
              </span>
              Validly
            </p>
            <p className="mt-2 text-sm text-ink-soft">Validate before you manufacture.</p>
          </div>
          <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-ink-soft">
            <Link href="/register" className="hover:text-ink">Create account</Link>
            <Link href="/login" className="hover:text-ink">Log in</Link>
            <a href="#how" className="hover:text-ink">How it works</a>
            <a href="#pricing" className="hover:text-ink">Pricing</a>
            <a href="#faq" className="hover:text-ink">FAQ</a>
          </nav>
          <p className="flex items-center gap-2 text-xs text-ink-soft">
            <Lock className="size-3.5" /> &copy; {new Date().getFullYear()} Validly
          </p>
        </div>
      </footer>
    </>
  );
}