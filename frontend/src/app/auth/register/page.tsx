// src/app/auth/register/page.tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import { API_BASE } from "../../../lib/Config";

export default function RegisterPage() {
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [nic, setNic] = useState("");
  const [password, setPassword] = useState("");
  const [agree, setAgree] = useState(false);

  const [selfie, setSelfie] = useState<File | null>(null);
  const [nicImage, setNicImage] = useState<File | null>(null);
  const [selfiePreview, setSelfiePreview] = useState<string | null>(null);
  const [nicPreview, setNicPreview] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  function onFile(
    setter: (f: File | null) => void,
    setPrev: (u: string | null) => void
  ) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      const f = e.target.files?.[0] ?? null;
      setter(f);
      if (f) setPrev(URL.createObjectURL(f));
      else setPrev(null);
    };
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setInfo(null);

    if (!agree) {
      setErr("You must agree to the Terms & Conditions.");
      return;
    }
    if (!selfie) {
      setErr("Please upload a selfie.");
      return;
    }
    if (!nicImage) {
      setErr("Please upload a NIC image.");
      return;
    }

    try {
      setSubmitting(true);
      const form = new FormData();
      form.append("UserName", userName);
      form.append("Email", email);
      form.append("Password", password);
      form.append("MobileNumber", mobile);
      form.append("NicNumber", nic);
      form.append("AgreeTerms", String(agree));
      if (selfie) form.append("selfie", selfie);
      if (nicImage) form.append("nicImage", nicImage);

      const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: "POST",
        body: form,
      });

      const json = await res.json().catch(() => null);

      if (!res.ok) {
        const msg = json?.message || `Register failed: ${res.status} ${res.statusText}`;
        setErr(msg);
        return;
      }

      setInfo(
        "Registered successfully. Check your email and click the verification link. After admin approval, you can log in."
      );
      setUserName("");
      setEmail("");
      setMobile("");
      setNic("");
      setPassword("");
      setAgree(false);
      setSelfie(null);
      setNicImage(null);
      setSelfiePreview(null);
      setNicPreview(null);
    } catch (e: any) {
      setErr(e?.message ?? "Register failed.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      {/* Card wrapper */}
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl p-6 sm:p-8">
        <div className="flex justify-center mb-4">
          <Image
            src="/bidf.png"
            alt="Bidforge Logo"
            width={80}
            height={80}
            className="h-8 w-auto "
          />
        </div>

        <h2 className="text-xl font-bold text-center mb-6 text-gray-600">
          Create an Account
        </h2>

        {err && (
          <div className="mb-4 rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-800">
            {err}
          </div>
        )}
        {info && (
          <div className="mb-4 rounded-lg border border-green-300 bg-green-50 p-3 text-sm text-green-800">
            {info}
          </div>
        )}

        <form className="flex flex-col gap-4" onSubmit={onSubmit}>
          <input
            type="text"
            placeholder="Full Name"
            className="border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            required
          />

          <input
            type="email"
            placeholder="Email"
            className="border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <input
              type="tel"
              placeholder="Mobile Number"
              className="border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="NIC Number"
              className="border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
              value={nic}
              onChange={(e) => setNic(e.target.value)}
              required
            />
          </div>

          <input
            type="password"
            placeholder="Password"
            className="border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-medium">Selfie</span>
              <input
                type="file"
                accept="image/*"
                className="mt-1 block w-full border p-2 rounded-lg"
                onChange={onFile(setSelfie, setSelfiePreview)}
                required
              />
              {selfiePreview && (
                <img
                  src={selfiePreview}
                  alt="selfie preview"
                  className="mt-2 h-28 w-28 object-cover rounded-lg border"
                />
              )}
            </label>

            <label className="block">
              <span className="text-sm font-medium">NIC Image</span>
              <input
                type="file"
                accept="image/*"
                className="mt-1 block w-full border p-2 rounded-lg"
                onChange={onFile(setNicImage, setNicPreview)}
                required
              />
              {nicPreview && (
                <img
                  src={nicPreview}
                  alt="nic preview"
                  className="mt-2 h-28 w-28 object-cover border rounded-m border"
                />
              )}
            </label>
          </div>

          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input
              type="checkbox"
              className="accent-green-600"
              checked={agree}
              onChange={(e) => setAgree(e.target.checked)}
              required
            />
            I agree to the{" "}
            <a href="/terms" className="text-green-600 hover:underline">
              Terms & Conditions
            </a>
          </label>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-green-600 text-white p-3 rounded-full hover:bg-green-700 transition disabled:opacity-60"
          >
            {submitting ? "Submitting…" : "Create Account"}
          </button>
        </form>
      </div>
    </main>
  );
}
