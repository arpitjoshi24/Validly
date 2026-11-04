import { api } from "@/lib/api";
import type { User } from "@/types";

export const usersApi = {
  updateName: (name: string) => api.patch<User>("/users/me", { name }),
  changePassword: (currentPassword: string, newPassword: string) =>
    api.patch<void>("/users/me/password", { currentPassword, newPassword }),
};