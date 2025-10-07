import { NextResponse } from "next/server";
import { verifyUser, createSession, findUserByEmail } from "@/lib/mock-auth-store";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;
    if (!email || !password) {
      return NextResponse.json({ error: "email and password required" }, { status: 400 });
    }

    const user = await verifyUser(email, password);
    if (!user) {
      // if user exists but password mismatch => 401, else 404
      const u = findUserByEmail(email);
      return NextResponse.json({ error: u ? "Invalid password" : "User not found" }, { status: u ? 401 : 404 });
    }

    const token = createSession(user.id);
    const res = NextResponse.json({ ok: true, user: { id: user.id, email: user.email, name: user.name }, token });
    res.cookies.set("mock_session", token, { httpOnly: true, path: "/", maxAge: 60 * 60 * 24 * 7 });
    return res;
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "server error" }, { status: 500 });
  }
}
