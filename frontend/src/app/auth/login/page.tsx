// src/app/auth/login/page.tsx
"use client";

import { useState } from "react";
import { API_BASE } from "../../../lib/config";
import Link from "next/link";

export default function LoginPage() {
  const [idOrEmail, setIdOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setInfo(null);

    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          UserNameOrEmail: idOrEmail,
          Password: password,
        }),
      });
      const json = await res.json().catch(() => null);

      if (!res.ok) {
        const message =
          res.status === 403
            ? "Awaiting admin approval after email verification."
            : json?.message || `Login failed: ${res.status} ${res.statusText}`;
        setErr(message);
        return;
      }

      // store JWT
      localStorage.setItem("token", json.token);
      setInfo("Logged in ✅");
      setPassword("");
    } catch (e: any) {
      setErr(e?.message ?? "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-white text-gray-900">
      <div className="max-w-md mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold mb-6">Log in</h1>

        {err && (
          <div className="mb-4 rounded border border-red-300 bg-red-50 p-3 text-sm text-red-800">
            {err}
          </div>
        )}
        {info && (
          <div className="mb-4 rounded border border-green-300 bg-green-50 p-3 text-sm text-green-800">
            {info}
          </div>
        )}

        <form
          onSubmit={onSubmit}
          className="space-y-4 rounded-xl border border-gray-200 p-4"
        >
          <label className="block">
            <span className="text-sm font-medium">Username or Email</span>
            <input
              className="mt-1 w-full rounded border border-gray-300 p-2"
              value={idOrEmail}
              onChange={(e) => setIdOrEmail(e.target.value)}
              required
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium">Password</span>
            <input
              type="password"
              className="mt-1 w-full rounded border border-gray-300 p-2"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>

          <button
            disabled={loading}
            className="px-4 py-2 rounded bg-blue-600 text-white hover:opacity-90 disabled:opacity-60"
          >
            {loading ? "Logging in…" : "Log in"}
          </button>
        </form>

        <div className="mt-4 text-sm text-gray-600">
          Don’t have an account?{" "}
          <Link className="text-blue-600 underline" href="/auth/register">
            Register
          </Link>
        </div>
      </div>
    </main>
  );
}
