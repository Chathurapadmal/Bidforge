"use client";

import { useState } from "react";
import { API_BASE } from "../../../lib/api";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const [form, setForm] = useState({
    fullName: "",
    userName: "",
    email: "",
    phoneNumber: "",
    nicNumber: "",
    password: "",
    confirmPassword: "",
  });
  const [showPw, setShowPw] = useState(false);
  const [showCpw, setShowCpw] = useState(false);
  const [nicPic, setNicPic] = useState<File | null>(null);
  const [selfyPic, setSelfyPic] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const router = useRouter();

  function set<K extends keyof typeof form>(k: K, v: string) {
    setForm((s) => ({ ...s, [k]: v }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErr(null);
    setMsg(null);
    const fd = new FormData();
    fd.append("FullName", form.fullName);
    fd.append("UserName", form.userName);
    fd.append("Email", form.email);
    fd.append("PhoneNumber", form.phoneNumber);
    fd.append("NicNumber", form.nicNumber);
    fd.append("Password", form.password);
    fd.append("ConfirmPassword", form.confirmPassword);
    if (nicPic) fd.append("NicPic", nicPic);
    if (selfyPic) fd.append("SelfyPic", selfyPic);

    try {
      const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: "POST",
        body: fd,
        credentials: "include",
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({ message: "Registration failed" }));
        throw new Error(j.message || JSON.stringify(j));
      }
      setMsg("Registered! Check your email to confirm before login.");
      setTimeout(() => router.push("/auth/login"), 1500);
    } catch (e: any) {
      setErr(e.message ?? "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-white to-blue-200 px-4 py-10">
      <div className="w-full max-w-2xl bg-white/80 backdrop-blur-lg border border-gray-200 shadow-2xl rounded-2xl p-8 space-y-6">
        <div className="text-center">
          <img src="/bidf.png" alt="BidForge Logo" className="h-14 mx-auto mb-3" />
          <h1 className="text-3xl font-bold text-gray-800">Create Your Account ✨</h1>
          <p className="text-sm text-gray-500 mt-1">
            Join BidForge and start buying & selling with confidence
          </p>
        </div>

        {msg && (
          <p className="text-green-600 text-sm bg-green-50 border border-green-200 rounded-md p-2 text-center">
            {msg}
          </p>
        )}
        {err && (
          <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-md p-2 text-center">
            {err}
          </p>
        )}

        <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Full Name"
            value={form.fullName}
            onChange={(e) => set("fullName", e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            required
          />
          <input
            type="text"
            placeholder="Username"
            value={form.userName}
            onChange={(e) => set("userName", e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            required
          />
          <input
            type="text"
            placeholder="Phone Number"
            value={form.phoneNumber}
            onChange={(e) => set("phoneNumber", e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <input
            type="text"
            placeholder="NIC Number"
            value={form.nicNumber}
            onChange={(e) => set("nicNumber", e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
          />

          <input
            type={showPw ? "text" : "password"}
            placeholder="Password"
            value={form.password}
            onChange={(e) => set("password", e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            required
          />
          <input
            type={showCpw ? "text" : "password"}
            placeholder="Confirm Password"
            value={form.confirmPassword}
            onChange={(e) => set("confirmPassword", e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            required
          />

          <div className="md:col-span-2 flex flex-col gap-3 mt-2">
            <label className="text-sm text-gray-700 font-medium">Upload NIC</label>
            <input
              type="file"
              className="border border-gray-300 rounded-lg px-3 py-2"
              onChange={(e) => setNicPic(e.target.files?.[0] || null)}
            />
            <label className="text-sm text-gray-700 font-medium">Upload Selfie</label>
            <input
              type="file"
              className="border border-gray-300 rounded-lg px-3 py-2"
              onChange={(e) => setSelfyPic(e.target.files?.[0] || null)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="md:col-span-2 w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-2.5 rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-60"
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-3">
          Already have an account?{" "}
          <a href="/auth/login" className="text-blue-600 hover:underline">
            Login
          </a>
        </p>
      </div>
    </main>
  );
}
