// Client-side fetch that sends cookies
export async function apiFetchClient(path: string, init?: RequestInit) {
  const url = path.startsWith("http") ? path : path; // e.g. "/api/auth/login"
  return fetch(url, {
    ...init,
    credentials: "include", // send httpOnly cookie
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
    cache: "no-store",
  });
}
export async function getJsonClient<T = any>(path: string): Promise<T> {
  const res = await apiFetchClient(path);
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json() as Promise<T>;
}
export type User = {
  id: string;
  email: string | null;
  userName: string | null;
  fullName: string | null;
  phoneNumber: string | null;
  isApproved: boolean;
  createdAt: string;
};
