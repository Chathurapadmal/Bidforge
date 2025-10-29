// src/app/auth/login/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
      // Full page refresh to ensure navbar and all components update
      window.location.href = "/profile";
    } catch (e: any) {
      setErr(e?.message ?? "Login failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold">Login</h1>
      {err && <p className="mt-4 text-red-600">{err}</p>}
      <form onSubmit={onSubmit} className="mt-6 grid gap-4">
        <input
          className="border p-2 rounded text-black"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          className="border p-2 rounded text-black"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button
          disabled={busy}
          className="px-4 py-2 rounded bg-indigo-600 text-white disabled:opacity-60"
        >
          {busy ? "Signing in…" : "Login"}
        </button>
      </form>
    </main>
  );
}
  