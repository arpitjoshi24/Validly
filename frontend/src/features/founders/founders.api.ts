import { api } from "@/lib/api";
import type { FounderProfile } from "@/types";

export const foundersApi = {
  getMine: () => api.get<FounderProfile>("/founders/me"),
  updateMine: (values: Omit<FounderProfile, "verificationStatus">) =>
    api.put<FounderProfile>("/founders/me", values),
};