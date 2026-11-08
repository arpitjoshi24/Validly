"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { AlertCircle, BadgeCheck, Ban, ChevronDown, ChevronLeft, ChevronRight, RotateCcw, Search, Users, X } from "lucide-react";
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
const smallBtn = "h-8 gap-1.5 px-3";

const ROLE_STYLE: Record<Role, string> = {
  FOUNDER: "bg-brand-tint text-brand-dark",
  CONSUMER: "bg-canvas text-ink-soft",
  ADMIN: "bg-signal-tint text-signal",
};

function FilterSelect({
  label,
  value,
  onChange,
  children,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  children: ReactNode;
}) {
  return (
    <div className="relative">
      <select
        aria-label={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 appearance-none rounded-lg border border-line bg-surface pl-3 pr-9 text-sm outline-none transition hover:border-ink-soft/40 focus:border-brand focus:ring-4 focus:ring-brand/10"
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-ink-soft" />
    </div>
  );
}

export function UsersTable() {
  const { user: me } = useAuth();

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [firstLoad, setFirstLoad] = useState(true);
  const [fetching, setFetching] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [role, setRole] = useState<Role | "">("");
  const [status, setStatus] = useState<UserStatus | "">("");
  const [page, setPage] = useState(1);

  const requestId = useRef(0);
  const filtered = Boolean(searchInput || role || status);

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
      setConfirmId(null);
    }
  }

  function clearFilters() {
    setSearchInput("");
    setSearch("");
    setRole("");
    setStatus("");
    setPage(1);
  }

  const from = pagination ? (pagination.page - 1) * pagination.limit + 1 : 0;
  const to = pagination ? Math.min(pagination.page * pagination.limit, pagination.total) : 0;

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2.5">
        <div className="relative w-full sm:w-80">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-soft" />
          <input
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by name or email"
            aria-label="Search users"
            className="h-10 w-full rounded-lg border border-line bg-surface pl-9 pr-3 text-sm outline-none transition hover:border-ink-soft/40 focus:border-brand focus:ring-4 focus:ring-brand/10"
          />
        </div>

        <FilterSelect
          label="Filter by role"
          value={role}
          onChange={(v) => {
            setRole(v as Role | "");
            setPage(1);
          }}
        >
          <option value="">All roles</option>
          <option value="FOUNDER">Founders</option>
          <option value="CONSUMER">Consumers</option>
          <option value="ADMIN">Admins</option>
        </FilterSelect>

        <FilterSelect
          label="Filter by status"
          value={status}
          onChange={(v) => {
            setStatus(v as UserStatus | "");
            setPage(1);
          }}
        >
          <option value="">All statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="SUSPENDED">Suspended</option>
        </FilterSelect>

        {filtered && (
          <button
            type="button"
            onClick={clearFilters}
            className="inline-flex h-10 items-center gap-1.5 rounded-lg px-2 text-sm font-medium text-brand hover:underline"
          >
            <X className="size-4" /> Clear filters
          </button>
        )}

        {pagination && !loadError && (
          <span className="ml-auto text-sm text-ink-soft tabular-nums">
            {pagination.total} {pagination.total === 1 ? "user" : "users"}
          </span>
        )}
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-line bg-surface shadow-[0_1px_2px_rgba(18,23,31,0.04)]">
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
            action={filtered ? <Button variant="secondary" onClick={clearFilters}>Clear filters</Button> : undefined}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-left text-sm">
              <thead className="border-b border-line bg-canvas/70 text-xs text-ink-soft">
                <tr>
                  <th className="px-5 py-3 font-medium">User</th>
                  <th className="px-4 py-3 font-medium">Role</th>
                  <th className="px-4 py-3 font-medium">Business</th>
                  <th className="px-4 py-3 font-medium">Account</th>
                  <th className="px-5 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className={cn("divide-y divide-line transition-opacity", fetching && !firstLoad && "opacity-60")}>
                {firstLoad
                  ? Array.from({ length: 6 }).map((_, i) => (
                      <tr key={i}>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <Skeleton className="size-9 rounded-full" />
                            <div className="space-y-1.5">
                              <Skeleton className="h-3.5 w-32" />
                              <Skeleton className="h-3 w-44" />
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4"><Skeleton className="h-5 w-16 rounded-full" /></td>
                        <td className="px-4 py-4"><Skeleton className="h-3.5 w-28" /></td>
                        <td className="px-4 py-4"><Skeleton className="h-5 w-16 rounded-full" /></td>
                        <td className="px-5 py-4"><Skeleton className="ml-auto h-8 w-24" /></td>
                      </tr>
                    ))
                  : users.map((u) => {
                      const isMe = u.id === me?.id;
                      const active = u.status === "ACTIVE";
                      const profile = u.founderProfile;
                      const busy = busyId === u.id;
                      const confirming = confirmId === u.id;

                      return (
                        <tr key={u.id} className="align-middle transition-colors hover:bg-canvas/50">
                          <td className="px-5 py-3.5">
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

                          <td className="px-4 py-3.5">
                            <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-medium", ROLE_STYLE[u.role])}>
                              {ROLE_LABEL[u.role]}
                            </span>
                          </td>

                          <td className="px-4 py-3.5">
                            {u.role !== "FOUNDER" ? (
                              <span className="text-ink-soft">&mdash;</span>
                            ) : profile ? (
                              <div className="space-y-1">
                                <div className="font-medium">{profile.businessName}</div>
                                <VerificationBadge status={profile.verificationStatus} />
                              </div>
                            ) : (
                              <span className="text-ink-soft">No profile yet</span>
                            )}
                          </td>

                          <td className="px-4 py-3.5">
                            <Badge tone={active ? "success" : "danger"} dot>
                              {active ? "Active" : "Suspended"}
                            </Badge>
                          </td>

                          <td className="px-5 py-3.5">
                            <div className="flex items-center justify-end gap-1.5">
                              {confirming ? (
                                <>
                                  <span className="mr-1 text-ink-soft">Suspend {u.name.split(" ")[0]}?</span>
                                  <Button
                                    variant="danger"
                                    className={smallBtn}
                                    loading={busy}
                                    onClick={() => run(u.id, () => adminApi.setStatus(u.id, "SUSPENDED"), "User suspended")}
                                  >
                                    Suspend
                                  </Button>
                                  <Button variant="secondary" className={smallBtn} disabled={busy} onClick={() => setConfirmId(null)}>
                                    Cancel
                                  </Button>
                                </>
                              ) : (
                                <>
                                  {profile && profile.verificationStatus !== "VERIFIED" && (
                                    <Button
                                      className={smallBtn}
                                      disabled={busy}
                                      onClick={() => run(u.id, () => adminApi.setVerification(u.id, "VERIFIED"), "Business verified")}
                                    >
                                      <BadgeCheck className="size-3.5" /> Verify
                                    </Button>
                                  )}
                                  {profile && profile.verificationStatus !== "REJECTED" && (
                                    <Button
                                      variant="secondary"
                                      className={smallBtn}
                                      disabled={busy}
                                      onClick={() => run(u.id, () => adminApi.setVerification(u.id, "REJECTED"), "Business rejected")}
                                    >
                                      <X className="size-3.5" /> Reject
                                    </Button>
                                  )}
                                  {!isMe &&
                                    (active ? (
                                      <Button
                                        variant="ghost"
                                        className={cn(smallBtn, "text-danger hover:bg-danger-tint")}
                                        disabled={busy}
                                        onClick={() => setConfirmId(u.id)}
                                      >
                                        <Ban className="size-3.5" /> Suspend
                                      </Button>
                                    ) : (
                                      <Button
                                        variant="secondary"
                                        className={smallBtn}
                                        disabled={busy}
                                        onClick={() => run(u.id, () => adminApi.setStatus(u.id, "ACTIVE"), "User reactivated")}
                                      >
                                        <RotateCcw className="size-3.5" /> Reactivate
                                      </Button>
                                    ))}
                                </>
                              )}
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
          <div className="flex flex-col gap-3 border-t border-line px-5 py-3 text-sm text-ink-soft sm:flex-row sm:items-center sm:justify-between">
            <span className="tabular-nums">
              Showing {from}–{to} of {pagination.total}
            </span>
            <div className="flex items-center gap-3">
              <span className="tabular-nums">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <div className="flex gap-2">
                <Button variant="secondary" className={smallBtn} disabled={page <= 1 || fetching} onClick={() => setPage((p) => p - 1)}>
                  <ChevronLeft className="size-4" /> Previous
                </Button>
                <Button
                  variant="secondary"
                  className={smallBtn}
                  disabled={page >= pagination.totalPages || fetching}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next <ChevronRight className="size-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}