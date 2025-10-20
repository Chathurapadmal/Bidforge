"use client";

import { useState } from "react";
import { api } from "../../../lib/api";
import { useRouter } from "next/navigation";

type LoginResponse = {
  token: string;
  user: {
    id: string;
    fullName: string | null;
    userName: string | null;
    email: string | null;
    phoneNumber: string | null;
    isApproved: boolean;
    nicImagePath?: string | null;
    selfiePath?: string | null;
  };
};

export default function LoginPage() {
  const [emailOrUserName, setEou] = useState("");
  const [password, setPw] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErr(null);
    try {
      const data = await api<LoginResponse>("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailOrUserName, password }),
      });
      localStorage.setItem("auth_token", data.token);
      localStorage.setItem("auth_user", JSON.stringify(data.user));
      router.push("/");
    } catch (e: any) {
      setErr(e.message ?? "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-white to-blue-200 px-4">
      <div className="w-full max-w-md bg-white/80 backdrop-blur-lg border border-gray-200 shadow-2xl rounded-2xl p-8 space-y-6">
        <div className="text-center">
          <img src="/bidf.png" alt="BidForge Logo" className="h-14 mx-auto mb-3" />
          <h1 className="text-l text-gray-500 mt-1">Welcome Back </h1>
          <p className="text-3xl font-bold text-gray-800">Login to BidForge</p>
        </div>

        {err && (
          <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-md p-2 text-center">
            {err}
          </p>
        )}

        <form onSubmit={onSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email or Username
            </label>
            <input
              type="text"
              value={emailOrUserName}
              onChange={(e) => setEou(e.target.value)}
              required
              className="mt-1 w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Enter your email or username"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPw(e.target.value)}
              required
              className="mt-1 w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold hover:opacity-90 transition disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>

        <div className="text-sm flex justify-between items-center mt-4">
          <a href="/auth/register" className="text-blue-600 hover:underline">
            Create account
          </a>
          <a href="/auth/forgot-password" className="text-blue-600 hover:underline">
            Forgot password?
          </a>
        </div>
      </div>
    </main>
  );
}
