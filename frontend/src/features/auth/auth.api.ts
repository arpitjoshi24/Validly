import { api } from "@/lib/api";
import type { User } from "@/types";
import type { LoginValues, RegisterValues } from "./auth.schema";

export const authApi = {
  login: (values: LoginValues) => api.post<User>("/auth/login", values),
  register: (values: RegisterValues) => api.post<User>("/auth/register", values),
  me: () => api.get<User>("/auth/me"),
  logout: () => api.post<void>("/auth/logout"),
};