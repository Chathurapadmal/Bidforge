// src/app/auth/register/page.tsx
"use client";

import { useState } from "react";
import { API_BASE } from "../../../lib/config";

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
      form.append("selfie", selfie);
      form.append("nicImage", nicImage);

      const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: "POST",
        body: form,
      });

      const json = await res.json().catch(() => null);

      if (!res.ok) {
        const msg =
          json?.message || `Register failed: ${res.status} ${res.statusText}`;
        setErr(msg);
        return;
      }

      setInfo(
        "Registered successfully. Check your email and click the verification link. After admin approves, you can log in."
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
    <main className="min-h-screen bg-white text-gray-900">
      <div className="max-w-xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold mb-6">
          Create your Bidforge account
        </h1>

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

        <form
          onSubmit={onSubmit}
          className="space-y-4 rounded-xl border border-gray-200 p-4"
        >
          <label className="block">
            <span className="text-sm font-medium">Username</span>
            <input
              className="mt-1 w-full rounded border border-gray-300 p-2"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              required
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium">Email</span>
            <input
              type="email"
              className="mt-1 w-full rounded border border-gray-300 p-2"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium">Mobile Number</span>
            <input
              className="mt-1 w-full rounded border border-gray-300 p-2"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              required
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium">NIC Number</span>
            <input
              className="mt-1 w-full rounded border border-gray-300 p-2"
              value={nic}
              onChange={(e) => setNic(e.target.value)}
              required
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium">Password</span>
            <input
              type="password"
              className="mt-1 w-full rounded border border-gray-300 p-2"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-medium">Selfie (face photo)</span>
              <input
                type="file"
                accept="image/*"
                className="mt-1 block w-full"
                onChange={onFile(setSelfie, setSelfiePreview)}
                required
              />
              {selfiePreview && (
                <img
                  src={selfiePreview}
                  alt="selfie preview"
                  className="mt-2 h-28 w-28 object-cover rounded border"
                />
              )}
            </label>

            <label className="block">
              <span className="text-sm font-medium">NIC image</span>
              <input
                type="file"
                accept="image/*"
                className="mt-1 block w-full"
                onChange={onFile(setNicImage, setNicPreview)}
                required
              />
              {nicPreview && (
                <img
                  src={nicPreview}
                  alt="nic preview"
                  className="mt-2 h-28 w-28 object-cover rounded border"
                />
              )}
            </label>
          </div>

          <label className="flex gap-2 items-start">
            <input
              type="checkbox"
              className="mt-1"
              checked={agree}
              onChange={(e) => setAgree(e.target.checked)}
            />
            <span className="text-sm">
              I agree to the{" "}
              <a href="#" className="text-blue-600 underline">
                Terms &amp; Conditions
              </a>
              .
            </span>
          </label>

          <button
            disabled={submitting}
            className="px-4 py-2 rounded bg-blue-600 text-white hover:opacity-90 disabled:opacity-60"
          >
            {submitting ? "Submitting…" : "Create Account"}
          </button>
        </form>
      </div>
    </main>
  );
}
