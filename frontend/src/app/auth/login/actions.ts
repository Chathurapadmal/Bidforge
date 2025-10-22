"use server";

import { cookies } from "next/headers";
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "";

export async function loginAction(username: string, password: string) {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userName: username, password }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data?.token) {
    throw new Error(data?.error || "Login failed");
  }

  // Store JWT so your existing apiFetch() can forward it
  cookies().set("auth", data.token, {
    httpOnly: false, // you read it in server code; leave false unless you rework fetch
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24, // 1 day
  });

  return { ok: true };
}
