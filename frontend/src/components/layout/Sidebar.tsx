"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ROLE_HOME } from "@/lib/constants";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import type { Role } from "@/types";
import { BadgeCheck, Compass, LayoutDashboard, UserCircle, Settings, Users } from "lucide-react";
const NAV: Record<Role, { href: string; label: string; icon: typeof Users }[]> = {
  FOUNDER: [
    { href: "/founder", label: "Home", icon: LayoutDashboard },
    { href: "/founder/profile", label: "Business profile", icon: UserCircle },
    { href: "/settings", label: "Settings", icon: Settings },
  ],
    CONSUMER: [
    { href: "/consumer", label: "Home", icon: LayoutDashboard },
    { href: "/consumer/discover", label: "Discover", icon: Compass },
    { href: "/consumer/profile", label: "Interests", icon: UserCircle },
    { href: "/settings", label: "Settings", icon: Settings },
  ],
   ADMIN: [
    { href: "/admin", label: "Home", icon: LayoutDashboard },
    { href: "/admin/verification", label: "Business verification", icon: BadgeCheck },
    { href: "/admin/users", label: "Users", icon: Users },
    { href: "/settings", label: "Settings", icon: Settings },
  ],
};

export function Sidebar() {
  const { user } = useAuth();
  const pathname = usePathname();
  if (!user) return null;

  return (
    <aside className="hidden w-60 shrink-0 border-r border-line bg-surface md:block">
      <div className="flex h-16 items-center px-6">
        <Link href="/" className="font-display text-xl font-bold text-brand">Validly</Link>
      </div>
      <nav className="space-y-1 px-3 py-2">
        {NAV[user.role].map(({ href, label, icon: Icon }) => {
          const isHome = href === ROLE_HOME[user.role];
const active = isHome ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm",
                active ? "bg-brand-tint font-medium text-brand-dark" : "text-ink-soft hover:bg-canvas"
              )}
            >
              <Icon className="size-4" />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}