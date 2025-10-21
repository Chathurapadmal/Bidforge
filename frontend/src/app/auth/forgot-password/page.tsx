"use client";

import { useState } from "react";
import { api } from "../../../lib/api";

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<1|2|3>(1);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [resetToken, setResetToken] = useState<string|null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [msg, setMsg] = useState<string|null>(null);
  const [err, setErr] = useState<string|null>(null);
  const [loading, setLoading] = useState(false);

  async function sendOtp(e: React.FormEvent) {
    e.preventDefault(); setLoading(true); setErr(null); setMsg(null);
    try {
      await api("/api/auth/forgot", { method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify({ email }) });
      setMsg("If the email exists, an OTP has been sent.");
      setStep(2);
    } catch (e:any) { setErr(e.message); } finally { setLoading(false); }
  }

  async function verify(e: React.FormEvent) {
    e.preventDefault(); setLoading(true); setErr(null); setMsg(null);
    try {
      const res = await api<{resetToken:string}>("/api/auth/verify-otp", { method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify({ email, code }) });
      setResetToken(res.resetToken);
      setMsg("Code verified. Set your new password.");
      setStep(3);
    } catch (e:any) { setErr(e.message); } finally { setLoading(false); }
  }

  async function reset(e: React.FormEvent) {
    e.preventDefault(); setLoading(true); setErr(null); setMsg(null);
    try {
      await api("/api/auth/reset-password", { method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify({ resetToken, newPassword, confirmPassword: confirm }) });
      setMsg("Password reset. You can now login.");
    } catch (e:any) { setErr(e.message); } finally { setLoading(false); }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md border p-6 rounded-2xl shadow bg-gray-800 space-y-4">
        <h1 className="text-2xl font-semibold">Forgot Password</h1>
        <p className="text-sm text-gray-400">Step {step} of 3</p>
        {msg && <p className="text-green-600 text-sm">{msg}</p>}
        {err && <p className="text-red-600 text-sm">{err}</p>}

        {step===1 && (
          <form onSubmit={sendOtp} className="space-y-3 ">
            <label className="block">
              <span className="text-sm">Email</span>
              <input className="mt-1 w-full border rounded p-2" type="email" value={email}
                     onChange={e=>setEmail(e.target.value)} required />
            </label>
            <button disabled={loading} className="w-full rounded-xl py-2 border bg-black text-white disabled:opacity-60">
              {loading ? "Sending..." : "Send OTP"}
            </button>
          </form>
        )}

        {step===2 && (
          <form onSubmit={verify} className="space-y-3">
            <label className="block">
              <span className="text-sm">6-digit code</span>
              <input className="mt-1 w-full border rounded p-2" value={code}
                     onChange={e=>setCode(e.target.value)} required inputMode="numeric" />
            </label>
            <button disabled={loading} className="w-full rounded-xl py-2 border bg-black text-white disabled:opacity-60">
              {loading ? "Verifying..." : "Verify Code"}
            </button>
          </form>
        )}

        {step===3 && (
          <form onSubmit={reset} className="space-y-3">
            <label className="block">
              <span className="text-sm">New password</span>
              <input className="mt-1 w-full border rounded p-2" type="password"
                     value={newPassword} onChange={e=>setNewPassword(e.target.value)} required />
            </label>
            <label className="block">
              <span className="text-sm">Confirm password</span>
              <input className="mt-1 w-full border rounded p-2" type="password"
                     value={confirm} onChange={e=>setConfirm(e.target.value)} required />
            </label>
            <button disabled={loading} className="w-full rounded-xl py-2 border bg-black text-white disabled:opacity-60">
              {loading ? "Updating..." : "Reset Password"}
            </button>
          </form>
        )}

        <div className="text-sm">
          Remembered it? <a className="underline" href="/auth/login">Back to login</a>
        </div>
      </div>
    </div>
  );
}
