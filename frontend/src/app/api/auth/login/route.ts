import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://localhost:7168";

type LoginResponse = {
  token: string; // JWT from ASP.NET
  user?: { id: string; email: string; name?: string };
  // ... any extras you return
};

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  // Forward to ASP.NET login (adjust path to your controller route)
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
    // If your API uses a self-signed dev cert, you may need to trust it locally
  });

  if (!res.ok) {
    let msg = "Login failed";
    try {
      const data = await res.json();
      msg = data?.message || msg;
    } catch {}
    return NextResponse.json({ message: msg }, { status: 401 });
  }

  const data = (await res.json()) as LoginResponse;

  // Store token in HttpOnly cookie (safer than localStorage)
  const oneDay = 60 * 60 * 24;
  const cookieStore = await cookies();
  cookieStore.set({
    name: "auth_token",
    value: data.token,
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    path: "/",
    maxAge: oneDay, // align with your JWT expiry
  });

  return NextResponse.json({ ok: true, user: data.user ?? null });
}
