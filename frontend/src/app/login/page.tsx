"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        router.replace("/dashboard"); // change to wherever you land after login
      } else {
        const data = await res.json().catch(() => ({}));
        setErr(data?.message || "Invalid credentials");
      }
    } catch {
      setErr("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50">
      <div className="w-[360px] rounded-3xl border-2 border-orange-500/90 shadow-[0_0_0_6px_rgba(249,115,22,0.25)] bg-white p-8">
        <h1 className="text-center text-4xl font-semibold text-orange-600 drop-shadow-sm tracking-wide">
          LOGIN
        </h1>

        <form onSubmit={onSubmit} className="mt-10 space-y-6">
          <div>
            <label className="block text-sm text-orange-500 mb-1">Email:</label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full border-b-2 border-orange-200 focus:border-orange-500 outline-none py-2 pr-10"
                placeholder="you@example.com"
                autoComplete="email"
              />
              <span className="absolute right-0 top-2.5 pointer-events-none">
                📧
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm text-orange-500 mb-1">
              Password:
            </label>
            <div className="relative">
              <input
                type={showPwd ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full border-b-2 border-orange-200 focus:border-orange-500 outline-none py-2 pr-10"
                placeholder="••••••••"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPwd((s) => !s)}
                className="absolute right-0 top-2 text-sm"
                aria-label="Toggle password visibility"
              >
                {showPwd ? "🙈" : "🔒"}
              </button>
            </div>
          </div>

          {err && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-2">
              {err}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-orange-500 text-white font-semibold py-3 active:scale-[0.99] disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Submit"}
          </button>
        </form>
      </div>
    </div>
  );
}
