"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AlertCircle, Search, Users } from "lucide-react";
import { toast } from "sonner";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { useAuth } from "@/hooks/useAuth";
import { ROLE_LABEL } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { VerificationBadge } from "@/features/founders/VerificationBadge";
import type { Role, UserStatus } from "@/types";
import { adminApi, type AdminUser, type Pagination } from "./admin.api";

const PAGE_SIZE = 20;
const control = "h-9 rounded-md border border-line bg-surface px-3 text-sm hover:border-ink-soft/40";
const smallBtn = "h-8 px-3";

export function UsersTable() {
  const { user: me } = useAuth();

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [firstLoad, setFirstLoad] = useState(true);
  const [fetching, setFetching] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [role, setRole] = useState<Role | "">("");
  const [status, setStatus] = useState<UserStatus | "">("");
  const [page, setPage] = useState(1);

  const requestId = useRef(0);

  // Wait until the admin stops typing before searching
  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 350);
    return () => clearTimeout(t);
  }, [searchInput]);

  const load = useCallback(async () => {
    const id = ++requestId.current;
    setFetching(true);
    setLoadError(null);
    try {
      const data = await adminApi.listUsers({
        search: search || undefined,
        role: role || undefined,
        status: status || undefined,
        page,
        limit: PAGE_SIZE,
      });
      if (id !== requestId.current) return; // a newer request replaced this one
      setUsers(data.items ?? []);
      setPagination(data.pagination ?? null);
    } catch (e) {
      if (id === requestId.current) setLoadError(e instanceof Error ? e.message : "Could not load users");
    } finally {
      if (id === requestId.current) {
        setFetching(false);
        setFirstLoad(false);
      }
    }
  }, [search, role, status, page]);

  useEffect(() => {
    load();
  }, [load]);

  async function run(userId: string, action: () => Promise<unknown>, success: string) {
    setBusyId(userId);
    try {
      await action();
      await load(); // refetch so the table always matches the server
      toast.success(success);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Action failed");
    } finally {
      setBusyId(null);
    }
  }

  function suspend(u: AdminUser) {
    if (!window.confirm(`Suspend ${u.name}? They won't be able to log in until you reactivate them.`)) return;
    run(u.id, () => adminApi.setStatus(u.id, "SUSPENDED"), "User suspended");
  }

  const from = pagination ? (pagination.page - 1) * pagination.limit + 1 : 0;
  const to = pagination ? Math.min(pagination.page * pagination.limit, pagination.total) : 0;

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative w-full sm:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-soft" />
          <input
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by name or email"
            aria-label="Search users"
            className={cn(control, "w-full pl-9")}
          />
        </div>
        <select
          aria-label="Filter by role"
          value={role}
          onChange={(e) => { setRole(e.target.value as Role | ""); setPage(1); }}
          className={control}
        >
          <option value="">All roles</option>
          <option value="FOUNDER">Founders</option>
          <option value="CONSUMER">Consumers</option>
          <option value="ADMIN">Admins</option>
        </select>
        <select
          aria-label="Filter by status"
          value={status}
          onChange={(e) => { setStatus(e.target.value as UserStatus | ""); setPage(1); }}
          className={control}
        >
          <option value="">All statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="SUSPENDED">Suspended</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-lg border border-line bg-surface">
        {loadError ? (
          <EmptyState
            icon={AlertCircle}
            title="Couldn't load users"
            description={loadError}
            action={<Button variant="secondary" onClick={load}>Try again</Button>}
          />
        ) : !firstLoad && users.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No users found"
            description="Try a different search or clear the filters."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="border-b border-line bg-canvas/60 text-xs text-ink-soft">
                <tr>
                  <th className="px-4 py-2.5 font-medium">User</th>
                  <th className="px-4 py-2.5 font-medium">Role</th>
                  <th className="px-4 py-2.5 font-medium">Business</th>
                  <th className="px-4 py-2.5 font-medium">Account</th>
                  <th className="px-4 py-2.5 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className={cn("divide-y divide-line transition-opacity", fetching && !firstLoad && "opacity-60")}>
                {firstLoad
                  ? Array.from({ length: 6 }).map((_, i) => (
                      <tr key={i}>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <Skeleton className="size-8 rounded-full" />
                            <div className="space-y-1.5">
                              <Skeleton className="h-3.5 w-32" />
                              <Skeleton className="h-3 w-44" />
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3"><Skeleton className="h-3.5 w-16" /></td>
                        <td className="px-4 py-3"><Skeleton className="h-3.5 w-28" /></td>
                        <td className="px-4 py-3"><Skeleton className="h-5 w-16 rounded-full" /></td>
                        <td className="px-4 py-3"><Skeleton className="ml-auto h-8 w-20" /></td>
                      </tr>
                    ))
                  : users.map((u) => {
                      const isMe = u.id === me?.id;
                      const active = u.status === "ACTIVE";
                      const profile = u.founderProfile;
                      const busy = busyId === u.id;

                      return (
                        <tr key={u.id} className="align-middle hover:bg-canvas/50">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <Avatar name={u.name} size="sm" />
                              <div className="min-w-0">
                                <div className="truncate font-medium">
                                  {u.name} {isMe && <span className="font-normal text-ink-soft">(you)</span>}
                                </div>
                                <div className="truncate text-ink-soft">{u.email}</div>
                              </div>
                            </div>
                          </td>

                          <td className="px-4 py-3 text-ink-soft">{ROLE_LABEL[u.role]}</td>

                          <td className="px-4 py-3">
                            {u.role !== "FOUNDER" ? (
                              <span className="text-ink-soft">None</span>
                            ) : profile ? (
                              <div className="space-y-1">
                                <div className="font-medium">{profile.businessName}</div>
                                <VerificationBadge status={profile.verificationStatus} />
                              </div>
                            ) : (
                              <span className="text-ink-soft">No profile yet</span>
                            )}
                          </td>

                          <td className="px-4 py-3">
                            <Badge tone={active ? "success" : "danger"} dot>
                              {active ? "Active" : "Suspended"}
                            </Badge>
                          </td>

                          <td className="px-4 py-3">
                            <div className="flex items-center justify-end gap-1.5">
                              {profile && profile.verificationStatus !== "VERIFIED" && (
                                <Button
                                  className={smallBtn}
                                  disabled={busy}
                                  onClick={() => run(u.id, () => adminApi.setVerification(u.id, "VERIFIED"), "Business verified")}
                                >
                                  Verify
                                </Button>
                              )}
                              {profile && profile.verificationStatus !== "REJECTED" && (
                                <Button
                                  variant="secondary"
                                  className={smallBtn}
                                  disabled={busy}
                                  onClick={() => run(u.id, () => adminApi.setVerification(u.id, "REJECTED"), "Business rejected")}
                                >
                                  Reject
                                </Button>
                              )}
                              {!isMe &&
                                (active ? (
                                  <Button variant="ghost" className={cn(smallBtn, "text-danger hover:bg-danger-tint")} disabled={busy} onClick={() => suspend(u)}>
                                    Suspend
                                  </Button>
                                ) : (
                                  <Button
                                    variant="secondary"
                                    className={smallBtn}
                                    disabled={busy}
                                    onClick={() => run(u.id, () => adminApi.setStatus(u.id, "ACTIVE"), "User reactivated")}
                                  >
                                    Reactivate
                                  </Button>
                                ))}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer */}
        {pagination && pagination.total > 0 && !loadError && (
          <div className="flex items-center justify-between border-t border-line px-4 py-3 text-sm text-ink-soft">
            <span>
              Showing {from}–{to} of {pagination.total}
            </span>
            <div className="flex gap-2">
              <Button variant="secondary" className={smallBtn} disabled={page <= 1 || fetching} onClick={() => setPage((p) => p - 1)}>
                Previous
              </Button>
              <Button variant="secondary" className={smallBtn} disabled={page >= pagination.totalPages || fetching} onClick={() => setPage((p) => p + 1)}>
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}