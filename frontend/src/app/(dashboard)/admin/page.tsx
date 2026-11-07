"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BadgeCheck, ChevronRight, Users } from "lucide-react";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { PageHeader } from "@/components/ui/PageHeader";
import { adminApi } from "@/features/admin/admin.api";

const cards = [
  {
    href: "/admin/verification",
    icon: BadgeCheck,
    title: "Business verification",
    body: "Review new business profiles and approve or reject them.",
  },
  {
    href: "/admin/users",
    icon: Users,
    title: "Users",
    body: "Search accounts and suspend anyone who breaks the rules.",
  },
];

// Rendered inside RoleGuard so non-admins never trigger the request
function PendingNotice() {
  const [pending, setPending] = useState(0);

  useEffect(() => {
    adminApi
      .listAllFounders()
      .then((f) => setPending(f.filter((x) => x.founderProfile?.verificationStatus === "PENDING").length))
      .catch(() => setPending(0)); // the notice is optional, so stay quiet on errors
  }, []);

  if (pending === 0) return null;

  return (
    <Link
      href="/admin/verification"
      className="mb-6 flex items-center justify-between rounded-lg border border-signal/30 bg-signal-tint px-4 py-3 text-sm hover:border-signal/60"
    >
      <span>
        <strong className="font-medium">
          {pending} {pending === 1 ? "business is" : "businesses are"} waiting for review
        </strong>
      </span>
      <span className="flex items-center gap-1 font-medium text-signal">
        Review now <ChevronRight className="size-4" />
      </span>
    </Link>
  );
}

export default function AdminHome() {
  return (
    <RoleGuard roles={["ADMIN"]}>
      <PageHeader title="Admin" description="Verify founders and manage accounts." />
      <PendingNotice />

      <div className="grid gap-4 sm:grid-cols-2">
        {cards.map(({ href, icon: Icon, title, body }) => (
          <Link
            key={href}
            href={href}
            className="group flex items-start gap-4 rounded-lg border border-line bg-surface p-5 transition-colors hover:border-ink-soft/40"
          >
            <span className="grid size-9 shrink-0 place-items-center rounded-md bg-brand-tint text-brand-dark">
              <Icon className="size-[18px]" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-medium">{title}</span>
              <span className="mt-0.5 block text-sm text-ink-soft">{body}</span>
            </span>
            <ChevronRight className="mt-1 size-4 text-ink-soft transition-transform group-hover:translate-x-0.5" />
          </Link>
        ))}
      </div>
    </RoleGuard>
  );
}