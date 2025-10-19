// src/app/api/auth/session/route.ts
import { NextResponse } from "next/server";

// Keep this in sync with your client code (or read from process.env.NEXT_PUBLIC_API_BASE)
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "https://localhost:7163";

export async function GET(request: Request) {
  // forward cookies from browser to backend
  const cookie = request.headers.get("cookie") ?? "";

  const res = await fetch(`${API_BASE}/api/profile`, {
    method: "GET",
    headers: {
      // Forward cookie so backend sees access_token
      cookie,
      Accept: "application/json",
    },
    // Server-to-server call; no need for credentials: 'include'
  });

  if (res.status === 401) {
    return NextResponse.json({ user: null }, { status: 401 });
  }
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    return NextResponse.json(
      { error: text || res.statusText },
      { status: res.status }
    );
  }

  const user = await res.json();
  // Normalize shape to what your navbar expects
  return NextResponse.json({ user }, { status: 200 });
}
