import { NextResponse } from "next/server";
import { cookies } from "next/headers";

// Force Node runtime (Edge can be picky with self-signed / http)
export const runtime = "nodejs";

function pickApiBase() {
  // Prefer server-to-server base (HTTP)
  const fromEnv =
    process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL;
  const primary = (fromEnv || "http://localhost:5062").replace(/\/+$/, "");
  const fallback = primary.includes("localhost:5062")
    ? "https://localhost:7168"
    : "http://localhost:5062";
  return { primary, fallback };
}

async function postJson(url: string, body: any) {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      // NOTE: server-to-server fetch, no CORS/credentials needed
      signal: controller.signal,
    });
    return res;
  } finally {
    clearTimeout(t);
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { primary, fallback } = pickApiBase();

    // Try primary (HTTP:5062) then fallback (HTTPS:7168)
    let res: Response | null = null;
    let lastErr: any = null;

    for (const base of [primary, fallback]) {
      try {
        res = await postJson(`${base}/api/auth/login`, body);
        if (res.ok || res.status >= 400) break; // got a response; stop trying
      } catch (e) {
        lastErr = e;
      }
    }

    if (!res) {
      return NextResponse.json(
        {
          message: `Login failed: cannot reach backend (${lastErr?.message || "unknown"})`,
        },
        { status: 500 }
      );
    }

    // Bubble up backend errors with details so you can see what's wrong
    if (!res.ok) {
      // Try parse JSON, else text, else generic
      const msg =
        (
          await res
            .json()
            .catch(async () => ({ message: await res.text().catch(() => "") }))
        )?.message || `Auth API error: ${res.status} ${res.statusText}`;
      return NextResponse.json({ message: msg }, { status: res.status || 500 });
    }

    const data = await res.json(); // expected: { token: string, user?: {...} }
    const token: string | undefined = data?.token;
    if (!token) {
      return NextResponse.json(
        { message: "Auth API returned no token." },
        { status: 502 }
      );
    }

    // Set HttpOnly cookie
    (await cookies()).set("auth", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return NextResponse.json({ ok: true, user: data.user ?? null });
  } catch (e: any) {
    return NextResponse.json(
      { message: `Login failed: ${e?.message || "unknown error"}` },
      { status: 500 }
    );
  }
}
