// File: src/lib/api.ts
import { API_BASE } from "./Config";

// ---- Token storage (browser-only) ----
export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

export function setToken(token: string | null) {
  if (typeof window === "undefined") return;
  if (token) localStorage.setItem("token", token);
  else localStorage.removeItem("token");
}

// ---- JWT helpers ----
export type DecodedJwt = {
  sub?: string;
  email?: string;
  name?: string;
  roles?: string[]; // normalized "role" claims
  exp?: number;
  [k: string]: any;
};

export function decodeJwt(token: string | null): DecodedJwt | null {
  try {
    if (!token) return null;
    const [, payload] = token.split(".");
    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    const obj = JSON.parse(json);
    const roles = Array.isArray(obj.role)
      ? obj.role
      : obj.role
        ? [obj.role]
        : obj["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"]
          ? ([] as string[]).concat(
              obj[
                "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
              ]
            )
          : undefined;
    return { ...obj, roles };
  } catch {
    return null;
  }
}

export function hasRole(token: string | null, role: string): boolean {
  const d = decodeJwt(token);
  return !!d?.roles?.some((r) => r?.toLowerCase() === role.toLowerCase());
}

// ---- Internal helpers ----
function buildHeaders(init: RequestInit, body?: BodyInit | null) {
  const headers = new Headers(init.headers || {});
  const token = getToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (!headers.has("Accept")) headers.set("Accept", "application/json");

  const isFormData =
    typeof FormData !== "undefined" && body instanceof FormData;

  // Only set JSON when we have a non-FormData body and no explicit Content-Type
  if (body && !isFormData && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  return headers;
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (res.ok) {
    if (res.status === 204) return undefined as unknown as T;
    const contentType = res.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      return (await res.json()) as T;
    }
    const txt = await res.text().catch(() => "");
    return txt as unknown as T;
  }

  let serverMessage = "";
  const ct = res.headers.get("content-type") || "";
  try {
    if (ct.includes("application/json")) {
      const j = await res.json();
      serverMessage = j?.message || j?.error || j?.title || JSON.stringify(j);
    } else {
      serverMessage = await res.text();
    }
  } catch {
    /* ignore parse errors */
  }
  const msg = serverMessage || `HTTP ${res.status} ${res.statusText}`;

  if (res.status === 401 || res.status === 403) {
    setToken(null);
    if (typeof window !== "undefined") {
      const here = window.location.pathname + window.location.search;
      const target = `/auth/login?next=${encodeURIComponent(here)}`;
      console.warn("Auth error:", msg);
      window.location.href = target;
    }
  }

  throw new Error(msg);
}

async function safeFetch(input: RequestInfo | URL, init: RequestInit) {
  try {
    return await fetch(input, init);
  } catch (e: any) {
    throw new Error(e?.message ?? "Network error");
  }
}

// ---- Public JSON/API helper ----
export async function apiFetch<T = any>(
  path: string,
  init: RequestInit = {}
): Promise<T> {
  const headers = buildHeaders(init, init.body ?? null);
  const res = await safeFetch(`${API_BASE}${path}`, {
    cache: "no-store",
    ...init,
    headers,
  });
  return handleResponse<T>(res);
}

// ---- Multipart/FormData helper ----
export async function apiFetchForm<T = any>(
  path: string,
  form: FormData,
  init: RequestInit = {}
): Promise<T> {
  const headers = buildHeaders(init, form); // pass actual FormData so we don't set JSON
  const res = await safeFetch(`${API_BASE}${path}`, {
    cache: "no-store",
    ...init,
    method: init.method ?? "POST",
    body: form,
    headers, // DO NOT set Content-Type; browser sets boundary
  });
  return handleResponse<T>(res);
}

// ---- Convenience helpers for KYC ----
export async function uploadKycNic(file: File) {
  const fd = new FormData();
  // Your server now accepts either "Nic" OR "file"; we'll use "Nic".
  fd.append("Nic", file);
  return apiFetchForm("/api/kyc/nic", fd);
}

export async function uploadKycSelfie(file: File) {
  const fd = new FormData();
  fd.append("Selfie", file);
  return apiFetchForm("/api/kyc/selfie", fd);
}

// Require admin on client before calling an admin endpoint
export function assertAdminOrThrow() {
  if (typeof window === "undefined") return;
  const t = getToken();
  if (!t || !hasRole(t, "Admin")) {
    const next = window.location.pathname + window.location.search;
    window.location.href = `/auth/login?next=${encodeURIComponent(next)}`;
    throw new Error("Admin privileges required.");
  }
}
