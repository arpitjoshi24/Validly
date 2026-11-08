"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BadgeCheck, LayoutDashboard, LogOut, Users } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { authApi } from "@/features/auth/auth.api";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/verification", label: "Verification", icon: BadgeCheck },
  { href: "/admin/users", label: "Users", icon: Users },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user } = useAuth();

  async function logout() {
    try {
      await authApi.logout();
    } finally {
      // Full navigation so all client state is cleared
      window.location.href = "/login";
    }
  }

  const nav = (
    <>
      {NAV.map(({ href, label, icon: Icon }) => {
        const active = href === "/admin" ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              active ? "bg-brand-tint text-brand-dark" : "text-ink-soft hover:bg-canvas hover:text-ink"
            )}
          >
            <Icon className="size-4" />
            {label}
          </Link>
        );
      })}
    </>
  );

  return (
    <div className="min-h-screen bg-canvas">
      <header className="sticky top-0 z-30 border-b border-line bg-surface/90 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-8">
            <Link href="/admin" className="flex items-center gap-2.5">
              <span className="grid size-9 place-items-center rounded-xl bg-brand text-white">
                <BadgeCheck className="size-5" />
              </span>
              <span className="font-display text-lg font-semibold tracking-tight">Validly</span>
              <span className="rounded-full bg-brand-tint px-2 py-0.5 text-xs font-medium text-brand-dark">Admin</span>
            </Link>
            <nav aria-label="Admin" className="hidden items-center gap-1 md:flex">
              {nav}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            {user && (
              <div className="hidden items-center gap-2.5 sm:flex">
                <Avatar name={user.name} size="sm" />
                <div className="leading-tight">
                  <p className="text-sm font-medium">{user.name}</p>
                  <p className="text-xs text-ink-soft">{user.email}</p>
                </div>
              </div>
            )}
            <Button variant="secondary" className="h-9" onClick={logout}>
              <LogOut className="size-4" />
              <span className="hidden sm:inline">Log out</span>
            </Button>
          </div>
        </div>

        {/* Mobile nav */}
        <nav aria-label="Admin" className="flex gap-1 overflow-x-auto border-t border-line px-4 py-2 md:hidden">
          {nav}
        </nav>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}