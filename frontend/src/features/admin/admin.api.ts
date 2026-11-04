import { api } from "@/lib/api";
import type { User, VerificationStatus } from "@/types";

export interface AdminUser extends User {
  verificationStatus?: VerificationStatus; // only present for founders
  createdAt: string;
}

export const adminApi = {
  listUsers: () => api.get<AdminUser[]>("/admin/users"),
  setVerification: (id: string, status: Exclude<VerificationStatus, "PENDING">) =>
    api.patch<AdminUser>(`/admin/users/${id}/verification`, { status }),
  setActive: (id: string, isActive: boolean) =>
    api.patch<AdminUser>(`/admin/users/${id}/status`, { isActive }),
};