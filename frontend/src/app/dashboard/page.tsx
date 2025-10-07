import React from "react";
import { auth } from "@/lib/auth";
import { headers, cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function Dashboard() {
  // `headers()` is synchronous and returns a Headers instance.
  const hdrs = headers();
  let session = await auth.api.getSession({ headers: hdrs });
  if (!session) {
    // dev fallback: check mock_session cookie set by mock auth endpoints
    try {
      const c = await cookies();
      const token = c.get("mock_session")?.value;
      if (token) {
        // create a minimal session-like object so UI renders and server doesn't redirect
        session = { user: { email: token + "@local" } } as any;
      }
    } catch (e) {
      // cookies() may fail outside request scope in some contexts — ignore
    }
  }
  if (!session) return redirect("/login");

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold">Welcome</h1>
      <p className="mt-2">{`Signed in as ${session.user.email}`}</p>
    </div>
  );
}
