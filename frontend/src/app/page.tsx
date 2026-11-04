import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";

const SIGNALS = [
  ["Views", "How many people saw it"],
  ["Likes", "First sign of interest"],
  ["Waitlist signups", "Stronger purchase intent"],
  ["Reservations", "People willing to commit"],
];

export default function LandingPage() {
  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-20">
        <div className="max-w-2xl">
          <h1 className="text-5xl font-bold leading-[1.05] sm:text-6xl">
            Find out if anyone will buy it before you manufacture it.
          </h1>
          <p className="mt-6 max-w-xl text-lg text-ink-soft">
            Publish a product idea, let real consumers vote, join waitlists and reserve, then get a report that tells you
            whether to proceed, change it, retest or stop.
          </p>
          <div className="mt-8 flex gap-3">
            <Link href="/register" className="rounded-md bg-brand px-5 py-3 font-medium text-white hover:bg-brand-dark">
              Test your idea
            </Link>
            <Link href="/login" className="rounded-md border border-line bg-surface px-5 py-3 font-medium hover:bg-canvas">
              Log in
            </Link>
          </div>
        </div>

        <section className="mt-24">
          <h2 className="text-2xl font-semibold">Likes aren't demand. Validly keeps each signal separate.</h2>
          <dl className="mt-6 grid gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
            {SIGNALS.map(([name, desc]) => (
              <div key={name} className="bg-surface p-5">
                <dt className="font-semibold">{name}</dt>
                <dd className="mt-1 text-sm text-ink-soft">{desc}</dd>
              </div>
            ))}
          </dl>
        </section>
      </main>
    </>
  );
}