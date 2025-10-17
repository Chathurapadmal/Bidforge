import { headers as nextHeaders } from "next/headers";
import { NextResponse } from "next/server";

// This route cannot see localStorage (server-side).
// If the client forwards Authorization header, we can infer "session".
export async function GET() {
  const hdrs = await nextHeaders();
  const auth = hdrs.get("authorization"); // e.g., "Bearer <token>"
  if (!auth) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
  return NextResponse.json({ authenticated: true });
}
