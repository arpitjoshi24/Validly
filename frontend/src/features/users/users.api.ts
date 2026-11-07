import { api, pick } from "@/lib/api";
import type { User } from "@/types";

interface UpdateMeInput {
  name?: string;
  currentPassword?: string;
  newPassword?: string;
}

// One endpoint handles both name and password changes
async function updateMe(values: UpdateMeInput) {
  return pick<User>(await api.patch<unknown>("/users/me", values), "user");
}

export const usersApi = {
  updateName: (name: string) => updateMe({ name }),
  changePassword: (currentPassword: string, newPassword: string) =>
    updateMe({ currentPassword, newPassword }),
};