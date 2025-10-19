// src/app/auth/login/page.tsx
"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { API_BASE } from "../../../lib/config";
import Image from "next/image";

export default function LoginPage() {
  const [idOrEmail, setIdOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/profile"; // redirect to /profile by default

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setInfo(null);

    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // IMPORTANT: set cookie
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

      setInfo("Logged in ✅");
      setPassword("");
      router.replace(next);
    } catch (e: any) {
      setErr(e?.message ?? "Login failed");
    } finally {
      setLoading(false);
    }
  }

  
return (
  <main className="flex justify-center items-center min-h-screen bg-gray-100 px-4">
    <div className="bg-white p-6 sm:p-8 rounded-lg shadow-lg w-full max-w-md">
      <div className="flex justify-center mb-4">
        <Image src="/bidf.png" alt="Bidforge Logo" width={80} height={80} className="h-10 w-auto" />
      </div>

      <h2 className="text-xl font-bold text-center mb-6 text-gray-400">Login to Bidforge</h2>

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

      <form className="flex flex-col gap-4" onSubmit={onSubmit}>
        <input
          type="text"
          placeholder="Email or Username"
          className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={idOrEmail}
          onChange={(e) => setIdOrEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <div className="flex justify-between items-center text-sm text-gray-600 ">
          <label className="flex items-center gap-2">
            <input type="checkbox" className="accent-blue-600" />
            Remember me
          </label>
          <Link href="/forgot-password" className="text-blue-600 hover:underline">
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition disabled:opacity-60"
        >
          {loading ? "Logging in…" : "Login"}
        </button>
      </form>

      <div className="flex items-center gap-2 my-6">
        <hr className="flex-grow border-gray-300" />
        <span className="text-sm text-gray-500">or continue with</span>
        <hr className="flex-grow border-gray-300" />
      </div>

      <div className="flex gap-4">
        <button className="flex-1 border p-2 rounded hover:bg-gray-50 text-gray-600">
          <Image src="/google.png" alt="Google" width={20} height={20} className="inline mr-2" />
          Google
        </button>
        <button className="flex-1 border p-2 rounded hover:bg-gray-50 text-gray-600">
          <Image src="/facebook.png" alt="Facebook" width={20} height={20} className="inline mr-2" />
          Facebook
        </button>
      </div>

      <p className="text-sm text-center mt-6 text-gray-400">
        Don’t have an account? 
        <Link href="/auth/register" className="text-blue-600 hover:underline">
          Register
        </Link>
      </p>
    </div>
  </main>
)
;
}