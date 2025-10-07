import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export async function POST() {
  // Ends session by clearing auth cookies
  await auth.api.signOut({ headers: await headers() });
  return Response.json({ ok: true });
}
