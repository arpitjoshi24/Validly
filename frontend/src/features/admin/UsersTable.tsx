"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { ROLE_LABEL } from "@/lib/constants";
import { VerificationBadge } from "@/features/founders/VerificationBadge";
import { adminApi, type AdminUser } from "./admin.api";

export function UsersTable() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    adminApi
      .listUsers()
      .then(setUsers)
      .catch((e) => toast.error(e instanceof Error ? e.message : "Could not load users"))
      .finally(() => setLoading(false));
  }, []);

  const replace = (updated: AdminUser) =>
    setUsers((prev) => prev.map((u) => (u.id === updated.id ? { ...u, ...updated } : u)));

  async function run(id: string, action: () => Promise<AdminUser>, success: string) {
    setBusyId(id);
    try {
      replace(await action());
      toast.success(success);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Action failed");
    } finally {
      setBusyId(null);
    }
  }

  if (loading) return <Spinner className="mx-auto mt-16 size-6 text-brand" />;
  if (users.length === 0) return <Card>No users yet. They'll appear here after sign-up.</Card>;

  return (
    <Card className="overflow-x-auto p-0">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-line text-ink-soft">
          <tr>
            <th className="px-4 py-3 font-medium">Name</th>
            <th className="px-4 py-3 font-medium">Role</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 text-right font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} className="border-b border-line last:border-0">
              <td className="px-4 py-3">
                <div className="font-medium">{u.name}</div>
                <div className="text-ink-soft">{u.email}</div>
              </td>
              <td className="px-4 py-3">{ROLE_LABEL[u.role]}</td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap gap-1.5">
                  <Badge tone={u.isActive ? "success" : "danger"}>{u.isActive ? "Active" : "Suspended"}</Badge>
                  {u.role === "FOUNDER" && u.verificationStatus && <VerificationBadge status={u.verificationStatus} />}
                </div>
              </td>
              <td className="px-4 py-3">
                <div className="flex justify-end gap-2">
                  {u.role === "FOUNDER" && u.verificationStatus !== "VERIFIED" && (
                    <Button
                      variant="secondary"
                      className="h-8"
                      disabled={busyId === u.id}
                      onClick={() => run(u.id, () => adminApi.setVerification(u.id, "VERIFIED"), "Founder verified")}
                    >
                      Verify
                    </Button>
                  )}
                  {u.role !== "ADMIN" && (
                    <Button
                      variant={u.isActive ? "danger" : "secondary"}
                      className="h-8"
                      disabled={busyId === u.id}
                      onClick={() => run(u.id, () => adminApi.setActive(u.id, !u.isActive), u.isActive ? "User suspended" : "User reactivated")}
                    >
                      {u.isActive ? "Suspend" : "Reactivate"}
                    </Button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}