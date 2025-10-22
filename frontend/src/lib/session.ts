// src/lib/session.ts
"use client";

import { useCallback, useEffect, useState } from "react";
import { apiFetch, setToken, getToken } from "./api";

export type SessionUser = {
  id: string;
  email?: string | null;
  name?: string | null;
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

  const register = useCallback(
    async (email: string, password: string, name?: string) => {
      const resp = await apiFetch<{ token: string; user: SessionUser }>(
        "/api/auth/register",
        {
          method: "POST",
          body: JSON.stringify({ email, password, name }),
        }
      );
      setToken(resp.token!);
      setUser(resp.user);
    },
    []
  );

  const logout = useCallback(async () => {
    setToken(null);
    setUser(null);
  }, []);

  return { user, loading, login, register, logout, refresh: load };
}
