"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ROLE_LABEL } from "@/lib/constants";
import { Sidebar } from "./Sidebar";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const router = useRouter();

  async function handleLogout() {
    await logout();
    router.replace("/login");
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b border-line bg-surface px-6">
          <div className="flex items-center gap-3">
            <span className="font-medium">{user?.name}</span>
            {user && <Badge tone="success">{ROLE_LABEL[user.role]}</Badge>}
          </div>
          <Button variant="ghost" onClick={handleLogout}>
            <LogOut className="size-4" /> Log out
          </Button>
        </header>
        <main className="mx-auto w-full max-w-5xl flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}