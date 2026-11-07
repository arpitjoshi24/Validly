
import { api } from "@/lib/api";
import type { User } from "@/types";
import type { LoginValues, RegisterValues } from "./auth.schema";

type AuthData = {
  user: User;
};

export const authApi = {
  login: async (values: LoginValues): Promise<User> => {
    const response = await api.post<AuthData>("/auth/login", values);
    return response.user;
  },

  register: async (values: RegisterValues): Promise<User> => {
    const response = await api.post<AuthData>("/auth/register", values);
    return response.user;
  },

  me: async (): Promise<User> => {
    const response = await api.get<AuthData>("/auth/me");
    return response.user;
  },

  logout: () => api.post<void>("/auth/logout"),
};
