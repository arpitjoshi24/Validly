"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { ROLE_HOME } from "@/lib/constants";
import { Spinner } from "@/components/ui/Spinner";

export default function DashboardRedirect() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) router.replace(ROLE_HOME[user.role]);
  }, [user, router]);

  return <Spinner className="mx-auto mt-16 size-6 text-brand" />;
}