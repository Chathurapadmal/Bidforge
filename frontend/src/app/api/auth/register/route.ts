import { NextResponse } from "next/server";
const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://localhost:7168";

export async function POST(req: Request) {
  const body = await req.json();

  const res = await fetch(`${API_BASE}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const raw = await res.text(); // read raw in case backend sends text/json
  if (!res.ok) {
    let msg = "Registration failed";
    try {
      msg = JSON.parse(raw)?.message ?? msg;
    } catch {
      /* keep default */
    }
    console.error("Register backend error:", raw);
    return NextResponse.json({ message: msg }, { status: res.status });
  }
  return NextResponse.json({ ok: true });
}
