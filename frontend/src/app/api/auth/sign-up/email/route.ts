import { NextResponse } from "next/server";
import { createUser, findUserByEmail, createSession } from "@/lib/mock-auth-store";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, name } = body;
    if (!email || !password) {
      return NextResponse.json({ error: "email and password required" }, { status: 400 });
    }

    const existing = findUserByEmail(email);
    if (existing) {
      return NextResponse.json({ error: "User already exists" }, { status: 409 });
    }

    const user = await createUser(email, password, name);
    const token = createSession(user.id);

    const res = NextResponse.json({ ok: true, user: { id: user.id, email: user.email, name: user.name }, token });
    // set httpOnly cookie for server-side session checks
    res.cookies.set("mock_session", token, { httpOnly: true, path: "/", maxAge: 60 * 60 * 24 * 7 });
    return res;
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "server error" }, { status: 500 });
  }
}
