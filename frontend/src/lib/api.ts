// src/lib/api.ts
export const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: { ...(init?.headers ?? {}) },
    credentials: "include", // include cookie for JWT if needed
  });
  if (!res.ok) {
    let msg = "Request failed";
    try {
      const j = await res.json();
      msg = j.message || JSON.stringify(j);
    } catch {}
    throw new Error(msg);
  }
  return res.json() as Promise<T>;
}
