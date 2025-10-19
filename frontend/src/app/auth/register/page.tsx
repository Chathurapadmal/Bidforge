<<<<<<< HEAD
﻿"use client";

import { useState } from "react";
import { API_BASE } from "../../../lib/api";
import { useRouter } from "next/navigation";
=======
"use client";

import { useState } from "react";
import Image from "next/image";
import { API_BASE } from "../../../lib/config";
>>>>>>> 6e42ab1118c1ef492e5f13e9c6c4dd078e5e1767

export default function RegisterPage() {
  const [form, setForm] = useState({
    fullName:"", userName:"", email:"", phoneNumber:"", nicNumber:"",
    password:"", confirmPassword:""
  });
  const [showPw, setShowPw] = useState(false);
  const [showCpw, setShowCpw] = useState(false);
  const [nicPic, setNicPic] = useState<File|null>(null);
  const [selfyPic, setSelfyPic] = useState<File|null>(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string|null>(null);
  const [err, setErr] = useState<string|null>(null);
  const router = useRouter();

<<<<<<< HEAD
  function set<K extends keyof typeof form>(k: K, v: string) { setForm(s=>({...s, [k]:v})); }
=======
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
>>>>>>> 6e42ab1118c1ef492e5f13e9c6c4dd078e5e1767

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault(); setLoading(true); setErr(null); setMsg(null);
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
      const res = await fetch(`${API_BASE}/api/auth/register`, { method:"POST", body: fd, credentials:"include" });
      if (!res.ok) {
<<<<<<< HEAD
        const j = await res.json().catch(()=>({message:"Registration failed"}));
        throw new Error(j.message || JSON.stringify(j));
      }
      setMsg("Registered! Check your email to confirm before login.");
      setTimeout(()=>router.push("/auth/login"), 1500);
    } catch (e:any) { setErr(e.message ?? "Registration failed"); }
    finally { setLoading(false); }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <form onSubmit={onSubmit} className="w-full max-w-lg space-y-4 border p-6 rounded-2xl shadow">
        <h1 className="text-2xl font-semibold">Create account</h1>
        {msg && <p className="text-green-600 text-sm">{msg}</p>}
        {err && <p className="text-red-600 text-sm">{err}</p>}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="block">
            <span className="text-sm">Fullname</span>
            <input className="mt-1 w-full border rounded p-2" value={form.fullName}
                   onChange={e=>set("fullName", e.target.value)} required />
          </label>
          <label className="block">
            <span className="text-sm">Username</span>
            <input className="mt-1 w-full border rounded p-2" value={form.userName}
                   onChange={e=>set("userName", e.target.value)} required />
          </label>
          <label className="block">
            <span className="text-sm">Email</span>
            <input className="mt-1 w-full border rounded p-2" type="email" value={form.email}
                   onChange={e=>set("email", e.target.value)} required />
          </label>
          <label className="block">
            <span className="text-sm">Phonenumber</span>
            <input className="mt-1 w-full border rounded p-2" value={form.phoneNumber}
                   onChange={e=>set("phoneNumber", e.target.value)} required />
          </label>
          <label className="block">
            <span className="text-sm">NIC Number</span>
            <input className="mt-1 w-full border rounded p-2" value={form.nicNumber}
                   onChange={e=>set("nicNumber", e.target.value)} />
          </label>
          <label className="block">
            <span className="text-sm">NIC pic</span>
            <input className="mt-1 w-full border rounded p-2" type="file" accept="image/*"
                   onChange={e=>setNicPic(e.target.files?.[0] ?? null)} />
=======
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
>>>>>>> 6e42ab1118c1ef492e5f13e9c6c4dd078e5e1767
          </label>
          <label className="block">
            <span className="text-sm">Selfy pic</span>
            <input className="mt-1 w-full border rounded p-2" type="file" accept="image/*"
                   onChange={e=>setSelfyPic(e.target.files?.[0] ?? null)} />
          </label>
        </div>

<<<<<<< HEAD
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="block">
            <span className="text-sm">Password</span>
            <div className="mt-1 flex gap-2">
              <input className="w-full border rounded p-2" type={showPw ? "text" : "password"}
                     value={form.password} onChange={e=>set("password", e.target.value)} required />
              <button type="button" onClick={()=>setShowPw(v=>!v)} className="px-3 border rounded">
                {showPw ? "Hide" : "Show"}
              </button>
            </div>
          </label>
          <label className="block">
            <span className="text-sm">Confirm password</span>
            <div className="mt-1 flex gap-2">
              <input className="w-full border rounded p-2" type={showCpw ? "text" : "password"}
                     value={form.confirmPassword} onChange={e=>set("confirmPassword", e.target.value)} required />
              <button type="button" onClick={()=>setShowCpw(v=>!v)} className="px-3 border rounded">
                {showCpw ? "Hide" : "Show"}
              </button>
            </div>
          </label>
        </div>

        <button disabled={loading} className="w-full rounded-xl py-2 border bg-black text-white disabled:opacity-60">
          {loading ? "Creating..." : "Register"}
        </button>

        <p className="text-sm">Already have an account? <a className="underline" href="/auth/login">Login</a></p>
      </form>
    </div>
=======
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
>>>>>>> 6e42ab1118c1ef492e5f13e9c6c4dd078e5e1767
  );
}
