// src/app/lib/auth.ts
import { API_BASE } from "./config";

export type Session = {
  userId: string | null;
  userName: string | null;
  fullName: string | null;
  email: string | null;
};

// ---- internal in-memory cache (optional) ----
let cachedSession: Session | null | undefined; // undefined = not loaded yet

// Always send cookies with requests
export async function authFetch(
  input: RequestInfo | URL,
  init: RequestInit = {}
) {
  return fetch(input, { credentials: "include", ...init });
}

// Query the backend for the current user (cookie-based)
export async function getSession(
  forceRefresh = false
): Promise<Session | null> {
  if (cachedSession !== undefined && !forceRefresh)
    return cachedSession ?? null;

  try {
    const res = await authFetch(`${API_BASE}/api/auth/me`);
    if (!res.ok) {
      cachedSession = null;
      return null;
    }
    const j = await res.json();
    const sess: Session = {
      userId: j?.userId ?? null,
      userName: j?.userName ?? null,
      fullName: j?.name ?? null,
      email: j?.email ?? null,
    };
    cachedSession = sess;
    return sess;
  } catch {
    cachedSession = null;
    return null;
  }
}

// Boolean helper
export async function isAuthenticated(): Promise<boolean> {
  return (await getSession()) !== null;
}

// Display name convenience
export function displayNameOf(sess: Session | null): string | null {
  if (!sess) return null;
  return sess.fullName || sess.userName || sess.email || null;
}

// Log out (clears cookie server-side)
export async function logout(): Promise<boolean> {
  try {
    const res = await authFetch(`${API_BASE}/api/auth/logout`, {
      method: "POST",
    });
    cachedSession = null;
    return res.ok;
  } catch {
    cachedSession = null;
    return false;
  }
}

// ----- Backward-compat stubs (so old imports don't break) -----

// Old code might still call this; cookie-based auth doesn't need it.
export function getToken(): string | null {
  return null; // no token in localStorage anymore
}

// Old code might still spread these into headers; keep it harmless.
export function authHeaders(): Record<string, string> {
  return {}; // token now travels in HttpOnly cookie
}

// Legacy no-ops for older callers (safe to remove once migrated)
export function saveSession(_: any) {
  /* no-op */
}
export function clearSession() {
  cachedSession = null;
}
export function isLoggedIn(): boolean {
  return false;
} // use isAuthenticated()
export function getUserId(): string | null {
  return cachedSession?.userId ?? null;
}
export function getDisplayName(): string | null {
  return displayNameOf(cachedSession ?? null);
}
