"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "../../../lib/session";

export default function RegisterPage() {
  const { register } = useSession();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setInfo(null);
    setBusy(true);
    try {
      await register(email, password, name || undefined);
      setInfo("Account created! Check your email for a verification link.");
    } catch (e: any) {
      setErr(e?.message ?? "Register failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold">Register</h1>
      {err && <p className="mt-4 text-red-600">{err}</p>}
      {info && <p className="mt-4 text-green-700">{info}</p>}
      <form onSubmit={onSubmit} className="mt-6 grid gap-4">
        <input
          className="border p-2 rounded"
          type="text"
          placeholder="Name (optional)"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          className="border p-2 rounded"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          className="border p-2 rounded"
          type="password"
          placeholder="Password (min 6)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button
          disabled={busy}
          className="px-4 py-2 rounded bg-indigo-600 text-white disabled:opacity-60"
        >
          {busy ? "Creating account…" : "Register"}
        </button>
      </form>
    </main>
  );
}
