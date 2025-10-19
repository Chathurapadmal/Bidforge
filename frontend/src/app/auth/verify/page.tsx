// src/app/auth/verify/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { API_BASE } from "../../../lib/config";

type VerifyResp = { message?: string };

export default function VerifyEmailPage() {
  const sp = useSearchParams();
  const userId = sp.get("userId");
  const token = sp.get("token");

  const [msg, setMsg] = useState<string>("Verifying…");
  const [ok, setOk] = useState<boolean | null>(null);

  useEffect(() => {
    (async () => {
      if (!userId || !token) {
        setOk(false);
        setMsg("Missing userId or token.");
        return;
      }
      try {
        const url = `${API_BASE}/api/auth/verify?userId=${encodeURIComponent(
          userId
        )}&token=${encodeURIComponent(token)}`;

        const res = await fetch(url, { credentials: "include" });
        const ct = res.headers.get("content-type") ?? "";
        const isJson = ct.includes("application/json");

        if (!res.ok) {
          // Try to read server message if present
          let serverMsg = "Verification failed.";
          if (isJson) {
            const j = (await res.json()) as VerifyResp;
            if (j?.message) serverMsg = j.message;
          } else {
            const t = await res.text();
            if (t) serverMsg = t.slice(0, 300);
          }
          setOk(false);
          setMsg(serverMsg);
          return;
        }

        // 2xx → success
        let serverMsg = "Email verified!";
        if (isJson) {
          const j = (await res.json()) as VerifyResp;
          if (j?.message) serverMsg = j.message;
        }
        setOk(true);
        setMsg(serverMsg);
      } catch (e: any) {
        setOk(false);
        setMsg(e?.message ?? "Verification failed.");
        console.error(e);
      }
    })();
  }, [userId, token]);

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-xl font-semibold mb-3">Email Verification</h1>
      <p className={ok ? "text-green-700" : "text-red-700"}>{msg}</p>
      <div className="mt-4 flex gap-3">
        <Link className="underline" href="/auth/login">Go to Login</Link>
        <Link className="underline" href="/auth/resend">Resend Email</Link>
      </div>
    </div>
  );
}
