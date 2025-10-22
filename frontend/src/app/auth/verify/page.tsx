"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { API_BASE } from "../../../lib/Config";

export default function VerifyEmailPage() {
  const sp = useSearchParams();
  const router = useRouter();
  const userId = sp.get("userId") || "";
  const token = sp.get("token") || "";
  const [status, setStatus] = useState<"loading" | "ok" | "err">("loading");
  const [msg, setMsg] = useState<string>("Verifying…");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/auth/verify-email`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, token }),
        });
        const t = await res.text();
        if (!res.ok) throw new Error(t);
        setStatus("ok");
        setMsg("Email verified! You can now log in.");
        setTimeout(() => router.push("/auth/login"), 1500);
      } catch (e: any) {
        setStatus("err");
        setMsg(e?.message || "Verification failed");
      }
    })();
  }, [userId, token, router]);

  return (
    <main className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold">Email Verification</h1>
      <p
        className={`mt-4 ${status === "err" ? "text-red-600" : "text-green-700"}`}
      >
        {msg}
      </p>
    </main>
  );
}
