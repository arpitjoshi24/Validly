"use client";

import Link from "next/link";
import { ChevronRight, Compass, UserCircle } from "lucide-react";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { PageHeader } from "@/components/ui/PageHeader";
import { useAuth } from "@/hooks/useAuth";

const cards = [
  { href: "/consumer/discover", icon: Compass, title: "Discover products", body: "Browse campaigns that are live right now." },
  { href: "/consumer/profile", icon: UserCircle, title: "Your interests", body: "Choose the categories you want to see first." },
];

export default function ConsumerHome() {
  const { user } = useAuth();
  return (
    <RoleGuard roles={["CONSUMER"]}>
      <PageHeader title={`Welcome, ${user?.name.split(" ")[0] ?? ""}`} description="Help founders find out what's worth making." />
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