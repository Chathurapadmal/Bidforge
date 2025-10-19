"use client";

import { useState } from "react";
import Image from "next/image";
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

  // ✅ Fixed: proper placement of file handler
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
          json?.message ||
          `Register failed: ${res.status} ${res.statusText}`;
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
    <main className="flex justify-center items-center min-h-screen bg-gray-100 px-4">
      <div className="bg-white p-6 sm:p-8 rounded-lg shadow-lg w-full max-w-xl">
        <div className="flex justify-center mb-4">
          <Image
            src="/bidf.png"
            alt="Bidforge Logo"
            width={80}
            height={80}
            className="h-10 w-auto"
          />
        </div>

        <h2 className="text-xl font-bold text-center mb-6 text-gray-400">
          Create an Account
        </h2>

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
            placeholder="Full Name"
            className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-green-400"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            required
          />

          <input
            type="email"
            placeholder="Email"
            className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-green-400"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <input
              type="tel"
              placeholder="Mobile Number"
              className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-green-400"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="NIC Number"
              className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-green-400"
              value={nic}
              onChange={(e) => setNic(e.target.value)}
              required
            />
          </div>

          <input
            type="password"
            placeholder="Password"
            className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-green-400"
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
              <span className="text-sm font-medium">NIC Image</span>
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

          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input
              type="checkbox"
              className="accent-green-600"
              checked={agree}
              onChange={(e) => setAgree(e.target.checked)}
              required
            />
            I agree to the{" "}
            <a
              href="/terms"
              className="text-green-600 hover:underline"
            >
              Terms & Conditions
            </a>
          </label>

          <button
            type="submit"
            disabled={submitting}
            className="bg-green-600 text-white p-2 rounded hover:bg-green-700 transition disabled:opacity-60"
          >
            {submitting ? "Submitting…" : "Create Account"}
          </button>
        </form>

        <div className="flex items-center gap-2 my-6">
          <hr className="flex-grow border-gray-300" />
          <span className="text-sm text-gray-500">or sign up with</span>
          <hr className="flex-grow border-gray-300" />
        </div>

        <div className="flex gap-4">
          <button className="flex-1 border p-2 rounded hover:bg-gray-50 text-gray-600">
            <Image
              src="/google.png"
              alt="Google"
              width={20}
              height={20}
              className="inline mr-2"
            />
            Google
          </button>
          <button className="flex-1 border p-2 rounded hover:bg-gray-50 text-gray-600">
            <Image
              src="/facebook.png"
              alt="Facebook"
              width={20}
              height={20}
              className="inline mr-2"
            />
            Facebook
          </button>
        </div>

        <p className="text-sm text-center mt-6 text-gray-400">
          Already have an account?{" "}
          <a href="/auth/login" className="text-green-600 hover:underline">
            Login
          </a>
        </p>
      </div>
    </main>
  );
}
