import { NextResponse } from "next/server";

const API_BASE = (
  process.env.API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "http://localhost:5062"
).replace(/\/+$/, "");

export async function POST(req: Request) {
  try {
    const payload = await req.json();

    const r = await fetch(`${API_BASE}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!r.ok) {
      const data = await r
        .json()
        .catch(async () => ({ message: await r.text().catch(() => "") }));
      return NextResponse.json(
        { message: data?.message || "Registration failed" },
        { status: r.status || 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json(
      { message: e?.message || "Registration failed" },
      { status: 500 }
    );
  }
}
