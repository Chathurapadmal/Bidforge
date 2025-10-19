// src/app/api/auth/sign-out/route.ts
import { NextResponse } from "next/server";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "https://localhost:7163";

export async function POST(request: Request) {
  const cookie = request.headers.get("cookie") ?? "";

  const res = await fetch(`${API_BASE}/api/auth/logout`, {
    method: "POST",
    headers: {
      cookie,
      Accept: "application/json",
    },
  });

  // Even if the backend returns 200/204, just say ok
  if (!res.ok && res.status !== 204) {
    const text = await res.text().catch(() => "");
    return NextResponse.json(
      { ok: false, error: text || res.statusText },
      { status: res.status }
    );
  }

  // Can't clear the backend's cookie from the frontend domain (different host),
  // but backend already deleted it. Return ok.
  return NextResponse.json({ ok: true }, { status: 200 });
}
