"use client";

import Link from "next/link";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { Card } from "@/components/ui/Card";

export default function AdminHome() {
  return (
    <RoleGuard roles={["ADMIN"]}>
      <h1 className="text-3xl font-bold">Admin</h1>
      <p className="mt-2 text-ink-soft">Verify founders and manage accounts.</p>
      <Card className="mt-6">
        <h2 className="font-semibold">Users</h2>
        <p className="mt-1 text-sm text-ink-soft">Review new founders and suspend accounts that break the rules.</p>
        <Link href="/admin/users" className="mt-4 inline-block rounded-md bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark">
          Manage users
        </Link>
      </Card>
    </RoleGuard>
  );
}