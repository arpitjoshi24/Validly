import { api } from "@/lib/api";
import type { Role, User, UserStatus, VerificationStatus } from "@/types";

export interface AdminUser extends User {
  founderProfile?: {
    businessName: string;
    verificationStatus: VerificationStatus;
    description?: string | null; // returned once the backend adds them to its select
    website?: string | null;
  } | null;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface UsersPage {
  items: AdminUser[];
  pagination: Pagination;
}

export interface UserFilters {
  role?: Role;
  status?: UserStatus;
  search?: string;
  page?: number;
  limit?: number;
}

function toQuery(filters: UserFilters) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== "") params.set(key, String(value));
  });
  const query = params.toString();
  return query ? `?${query}` : "";
}

function listUsers(filters: UserFilters = {}) {
  return api.get<UsersPage>(`/admin/users${toQuery(filters)}`);
}

/** The backend can't filter by verification status yet, so fetch every founder and filter on the client. */
async function listAllFounders() {
  const all: AdminUser[] = [];
  let page = 1;
  let totalPages = 1;
  do {
    const data = await listUsers({ role: "FOUNDER", page, limit: 100 });
    all.push(...data.items);
    totalPages = data.pagination.totalPages;
    page += 1;
  } while (page <= totalPages && page <= 20);
  return all;
}

export const adminApi = {
  listUsers,
  listAllFounders,

  setVerification: (userId: string, status: "VERIFIED" | "REJECTED") =>
    api.patch<unknown>(`/admin/founders/${userId}/verify`, { status }),

  setStatus: (userId: string, status: UserStatus) =>
    api.patch<unknown>(`/admin/users/${userId}/status`, { status }),
};