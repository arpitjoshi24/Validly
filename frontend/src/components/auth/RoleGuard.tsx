"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { ROLE_HOME } from "@/lib/constants";
import { Spinner } from "@/components/ui/Spinner";
import type { Role } from "@/types";

/** Wrap a page so only the listed roles can see it; everyone else is sent to their own home. */
export function RoleGuard({ roles, children }: { roles: Role[]; children: React.ReactNode }) {
  const { user } = useAuth();
  const router = useRouter();
  const allowed = !!user && roles.includes(user.role);

  useEffect(() => {
    if (user && !allowed) router.replace(ROLE_HOME[user.role]);
  }, [user, allowed, router]);

  if (!allowed) return <div className="flex justify-center py-20"><Spinner className="size-6 text-brand" /></div>;
  return <>{children}</>;
}