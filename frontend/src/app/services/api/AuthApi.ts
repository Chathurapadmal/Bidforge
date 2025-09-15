
// src/app/services/api/AuthApi.ts
import { http } from "./http";

export type User = {
  id: string;
  name: string;
  email: string;
};

export type AuthResponse = {
  token: string;
  user: User;
};

export const AuthApi = {
  me: (token: string) => http<User>("/api/auth/me", {}, token),
  login: (email: string, password: string) =>
    http<AuthResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  register: (name: string, email: string, password: string) =>
    http<AuthResponse>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    }),
};
