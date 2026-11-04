import { api } from "@/lib/api";
import type { ConsumerProfile } from "@/types";

export const consumersApi = {
  getMine: () => api.get<ConsumerProfile>("/consumers/me"),
  updateMine: (interests: string[]) => api.put<ConsumerProfile>("/consumers/me", { interests }),
};