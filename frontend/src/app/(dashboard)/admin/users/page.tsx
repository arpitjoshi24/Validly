"use client";

import { RoleGuard } from "@/components/auth/RoleGuard";
import { PageHeader } from "@/components/ui/PageHeader";
import { UsersTable } from "@/features/admin/UsersTable";

export default function AdminUsersPage() {
  return (
    <RoleGuard roles={["ADMIN"]}>
      <PageHeader title="Users" description="Search accounts, review business profiles and suspend anyone who breaks the rules." />
      <UsersTable />
    </RoleGuard>
  );
}