import { cookies } from "next/headers";
import { API_BASE } from "./config";

export async function apiFetch(path: string, init?: RequestInit) {
  const token = (await cookies()).get("auth")?.value;

  return fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      ...(init?.headers || {}),
      Authorization: token ? `Bearer ${token}` : "",
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });
}
