"use client";

import Link from "next/link";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { Card } from "@/components/ui/Card";
import { useAuth } from "@/hooks/useAuth";

export default function FounderHome() {
  const { user } = useAuth();
  return (
    <RoleGuard roles={["FOUNDER"]}>
      <h1 className="text-3xl font-bold">Welcome, {user?.name.split(" ")[0]}</h1>
      <p className="mt-2 text-ink-soft">Finish your business profile so an admin can verify you.</p>
      <Card className="mt-6">
        <h2 className="font-semibold">Complete your business profile</h2>
        <p className="mt-1 text-sm text-ink-soft">Verified founders can publish validation campaigns.</p>
        <Link href="/founder/profile" className="mt-4 inline-block rounded-md bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark">
          Open business profile
        </Link>
      </Card>
    </RoleGuard>
  );
}