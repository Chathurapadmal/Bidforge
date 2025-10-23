// File: src/lib/session.ts
"use client";

import { useCallback, useEffect, useState } from "react";
import { apiFetch, setToken, getToken } from "./api";

export type SessionUser = {
  id: string;
  email?: string | null;
  name?: string | null;
  emailConfirmed?: boolean;
  roles?: string[]; // optional if you return roles in /auth/me
} | null;

export function useSession() {
  const [user, setUser] = useState<SessionUser>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const token = getToken();
      if (!token) {
        setUser(null);
      } else {
        const me = await apiFetch<SessionUser>("/api/auth/me");
        setUser(me);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const login = useCallback(async (email: string, password: string) => {
    const resp = await apiFetch<{ token: string; user: SessionUser }>(
      "/api/auth/login",
      {
        method: "POST",
        body: JSON.stringify({ email, password }),
      }
    );
    setToken(resp.token!);
    setUser(resp.user);
  }, []);

  // NOTE: role is optional. If "Admin" is sent, your backend must allow it.
  const register = useCallback(
    async (
      email: string,
      password: string,
      name?: string,
      role?: "User" | "Admin"
    ) => {
      // Default path: normal user registration
      let path = "/api/auth/register";
      let body: any = { email, password, name };

      // If you want to create admin via public form (not recommended for prod),
      // make sure your backend supports this. Otherwise this will 403.
      if (role === "Admin") {
        // If your backend accepts role on the same endpoint, keep /auth/register and include role.
        // If you use a dedicated admin endpoint, set:
        // path = "/api/admin/users/create-admin";
        body.role = "Admin";
      }

      const resp = await apiFetch<{
        token?: string;
        user?: SessionUser;
        ok?: boolean;
      }>(path, { method: "POST", body: JSON.stringify(body) });

      // Some backends return only { ok: true } for register-with-email-verify.
      if (resp?.token && resp?.user) {
        setToken(resp.token);
        setUser(resp.user);
      } else {
        // No token → probably email verification flow; keep user signed-out
        // and let UI show “check email” message.
      }
    },
    []
  );

  const logout = useCallback(async () => {
    setToken(null);
    setUser(null);
  }, []);

  return { user, loading, login, register, logout, refresh: load };
}
