// src/app/auth/login/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useSession } from "../../../lib/session";

export default function LoginPage() {
  const { login } = useSession();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    try {
      await login(email, password);
      router.push("/profile");
    } catch (e: any) {
      setErr(e?.message ?? "Login failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6 sm:p-8">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <Image
            src="/bidf.png"
            alt="Bidforge Logo"
            width={100}
            height={100}
            className="h-12 w-auto"
          />
        </div>

        <h1 className="text-xl sm:text-2xl font-bold text-center text-gray-700 mb-2">
          Login to Bidforge
        </h1>

        {err && (
          <p className="mt-4 rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-800">
            {err}
          </p>
        )}

        <form onSubmit={onSubmit} className="mt-6 grid gap-4">
          <input
            className="border p-3 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-400"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            className="border p-3 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-400"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {/* Forgot password */}
          <div className="flex justify-end">
            <Link
              href="/forgot-password"
              className="text-sm text-blue-600 hover:underline"
            >
              Forgot password?
            </Link>
          </div>

          <button
            disabled={busy}
            className="w-full p-3 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {busy ? "Signing in…" : "Login"}
          </button>
        </form>

        {/* Register link */}
        <p className="text-sm text-center mt-6 text-gray-500">
          Don’t have an account?{" "}
          <Link href="/auth/register" className="text-blue-600 hover:underline">
            Register
          </Link>
        </p>
      </div>
    </main>
  );
}
