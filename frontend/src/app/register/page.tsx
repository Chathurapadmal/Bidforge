"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "", name: "" });
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      router.push("/login");
    } else {
      const data = await res.json().catch(() => ({}));
      setErr(data?.message || "Registration failed");
    }

    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50">
      <div className="w-[360px] rounded-3xl border-2 border-orange-500/90 bg-white p-8">
        <h1 className="text-center text-3xl font-semibold text-orange-600 mb-6">
          REGISTER
        </h1>
        <form onSubmit={onSubmit} className="space-y-6">
          <div>
            <label className="block text-sm text-orange-500 mb-1">
              Full Name
            </label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full border-b-2 border-orange-200 focus:border-orange-500 outline-none py-2"
              placeholder="Your name"
            />
          </div>

          <div>
            <label className="block text-sm text-orange-500 mb-1">Email</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full border-b-2 border-orange-200 focus:border-orange-500 outline-none py-2"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm text-orange-500 mb-1">
              Password
            </label>
            <input
              type="password"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full border-b-2 border-orange-200 focus:border-orange-500 outline-none py-2"
              placeholder="••••••••"
            />
          </div>

          {err && <p className="text-red-600 text-sm">{err}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-500 text-white rounded-xl py-3 font-semibold disabled:opacity-60"
          >
            {loading ? "Registering..." : "Sign Up"}
          </button>
        </form>
      </div>
    </div>
  );
}
