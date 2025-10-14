// src/app/auth/verify/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { API_BASE } from "../../../lib/config";
import { readJsonSafe } from "../../../lib/http";
import Link from "next/link";

export default function VerifyEmailPage() {
  const sp = useSearchParams();
  const router = useRouter();
  const userId = sp.get("userId") || "";
  const token = sp.get("token") || "";

  const [status, setStatus] = useState<"loading" | "ok" | "error">("loading");
  const [message, setMessage] = useState<string>("Verifying email...");
  const [countdown, setCountdown] = useState<number>(5); // optional auto-redirect after success

  useEffect(() => {
    let cancelled = false;

    async function run() {
      if (!userId || !token) {
        setStatus("error");
        setMessage("Invalid verification link.");
        return;
      }

      try {
        const url = `${API_BASE}/api/auth/confirm-email?userId=${encodeURIComponent(
          userId
        )}&token=${encodeURIComponent(token)}`;

        const res = await fetch(url, { method: "GET" });
        const json = await readJsonSafe(res);

        if (cancelled) return;

        if (!res.ok) {
          setStatus("error");
          setMessage(
            json?.message ||
              (res.status === 400
                ? "Invalid or expired verification token."
                : `Verification failed: ${res.status} ${res.statusText}`)
          );
        } else {
          setStatus("ok");
          setMessage(
            "Email verified successfully. Please wait for admin approval, then log in."
          );
        }
      } catch (e: any) {
        if (cancelled) return;
        setStatus("error");
        setMessage(e?.message ?? "Verification failed.");
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [userId, token]);

  // Optional: auto-redirect to login after success
  useEffect(() => {
    if (status !== "ok") return;
    const t = setInterval(() => setCountdown((n) => n - 1), 1000);
    const r = setTimeout(() => router.push("/auth/login"), 5000);
    return () => {
      clearInterval(t);
      clearTimeout(r);
    };
  }, [status, router]);

  return (
    <main className="min-h-screen grid place-items-center bg-white text-gray-900">
      <div className="text-center max-w-md px-6">
        <h1 className="text-2xl font-bold mb-3">Email Verification</h1>
        <p className={status === "error" ? "text-red-600" : "text-gray-700"}>
          {message}
        </p>

        {status === "ok" ? (
          <p className="mt-2 text-sm text-gray-500">
            Redirecting to login in {countdown}s...
          </p>
        ) : null}

        <div className="mt-4">
          <Link href="/auth/login" className="text-blue-600 underline">
            Go to Login
          </Link>
        </div>
      </div>
    </main>
  );
}
