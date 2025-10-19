<<<<<<< HEAD
﻿"use client";

import { useState } from "react";
import { api } from "../../../lib/api";
import { useRouter } from "next/navigation";

type LoginResponse = {
  token: string;
  user: {
    id: string; fullName: string | null; userName: string | null;
    email: string | null; phoneNumber: string | null; isApproved: boolean;
    nicImagePath?: string | null; selfiePath?: string | null;
  };
};
=======
// src/app/auth/login/page.tsx
"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { API_BASE } from "../../../lib/config";
import Image from "next/image";
>>>>>>> 6e42ab1118c1ef492e5f13e9c6c4dd078e5e1767

export default function LoginPage() {
  const [emailOrUserName, setEou] = useState("");
  const [password, setPw] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setErr(null);
    try {
      const data = await api<LoginResponse>("/api/auth/login", {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({ emailOrUserName, password })
      });
      localStorage.setItem("auth_token", data.token);
      localStorage.setItem("auth_user", JSON.stringify(data.user));
      router.push("/");
    } catch (e:any) { setErr(e.message ?? "Login failed"); }
    finally { setLoading(false); }
  }

<<<<<<< HEAD
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <form onSubmit={onSubmit} className="w-full max-w-sm space-y-4 border p-6 rounded-2xl shadow">
        <h1 className="text-2xl font-semibold">Login</h1>
        {err && <p className="text-red-600 text-sm">{err}</p>}

        <label className="block">
          <span className="text-sm">Email or Username</span>
          <input className="mt-1 w-full border rounded p-2"
                 value={emailOrUserName} onChange={e=>setEou(e.target.value)} required />
        </label>

        <label className="block">
          <span className="text-sm">Password</span>
          <input className="mt-1 w-full border rounded p-2" type="password"
                 value={password} onChange={e=>setPw(e.target.value)} required />
        </label>

        <button disabled={loading} className="w-full rounded-xl py-2 border bg-black text-white disabled:opacity-60">
          {loading ? "Signing in..." : "Login"}
        </button>

        <div className="text-sm flex justify-between">
          <a className="underline" href="/auth/register">Create account</a>
          <a className="underline" href="/auth/forgot-password">Forgot password?</a>
        </div>
      </form>
    </div>
  );
}
=======
  
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
>>>>>>> 6e42ab1118c1ef492e5f13e9c6c4dd078e5e1767
