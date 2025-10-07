import { NextResponse } from "next/server";
import { findUserByEmail, createUser, createSession } from "@/lib/mock-auth-store";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { provider, email, name } = body;
    if (!provider || !email) return NextResponse.json({ error: "provider and email required" }, { status: 400 });

    let user = findUserByEmail(email);
    if (!user) {
      user = await createUser(email, undefined, name, provider);
    }
    const token = createSession(user.id);
    const res = NextResponse.json({ ok: true, user: { id: user.id, email: user.email, name: user.name }, token });
    res.cookies.set("mock_session", token, { httpOnly: true, path: "/", maxAge: 60 * 60 * 24 * 7 });
    return res;
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "server error" }, { status: 500 });
  }
}
