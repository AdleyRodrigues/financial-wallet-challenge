import { api } from "@/lib/api";
import type {
  AuthResponse,
  LoginPayload,
  RegisterPayload,
} from "@/types/auth";

export const authService = {
  register(payload: RegisterPayload) {
    return api<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  login(payload: LoginPayload) {
    return api<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  logout() {
    return api<{ message: string }>("/auth/logout", {
      method: "POST",
    });
  },

  me() {
    return api<AuthResponse>("/auth/me");
  },
};
