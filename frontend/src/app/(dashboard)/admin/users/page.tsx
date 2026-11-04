"use client";

import { RoleGuard } from "@/components/auth/RoleGuard";
import { UsersTable } from "@/features/admin/UsersTable";

export default function AdminUsersPage() {
  return (
    <RoleGuard roles={["ADMIN"]}>
      <h1 className="mb-6 text-3xl font-bold">Users</h1>
      <UsersTable />
    </RoleGuard>
  );
}