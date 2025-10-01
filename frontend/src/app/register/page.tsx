"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { authClient } from "@/app/lib/auth-client";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string   | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErr(null);
    setLoading(true);

    const form = e.currentTarget as HTMLFormElement;
    const fullName = (form.elements.namedItem("fullName") as HTMLInputElement).value;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    const password = (form.elements.namedItem("password") as HTMLInputElement).value;
    const confirm = (form.elements.namedItem("confirm") as HTMLInputElement).value;

    if (password !== confirm) {
      setErr("Passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      const res = await authClient.signUp.email({
        email,
        password,
        name: fullName, 
      });

      if (res.error) throw new Error(res.error.message);
      router.push("/");
    } catch (e: any) {
      setErr(e.message ?? "Failed to register.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex justify-center items-center min-h-screen bg-gray-100 px-4">
      <div className="bg-white p-6 sm:p-8 rounded-lg shadow-lg w-full max-w-md">
        <div className="flex justify-center mb-4">
          <Image src="/bidf.png" alt="Bidforge Logo" width={80} height={80} className="h-10 w-auto" />
        </div>

        <h2 className="text-xl font-bold text-center mb-6 text-gray-400">Create an Account</h2>

        <form className="flex flex-col gap-4" onSubmit={onSubmit}>
          <input name="fullName" type="text" placeholder="Full Name" className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-green-400" required />
          <input name="email" type="email" placeholder="Email" className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-green-400" required />
          <input name="password" type="password" placeholder="Password" className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-green-400" required />
          <input name="confirm" type="password" placeholder="Confirm Password" className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-green-400" required />

          <label className="flex items-center gap-2 text-sm text-gray-400">
            <input type="checkbox" className="accent-green-600" required />
            I agree to the{" "}
            <Link href="/terms" className="text-green-600 hover:underline">Terms & Conditions</Link>
          </label>

          <button type="submit" disabled={loading} className="bg-green-600 text-white p-2 rounded hover:bg-green-700 transition disabled:opacity-60">
            {loading ? "Registering..." : "Register"}
          </button>

          {err && <p className="text-sm text-red-600">{err}</p>}
        </form>

        <div className="flex items-center gap-2 my-6">
          <hr className="flex-grow border-gray-300" />
          <span className="text-sm text-gray-500">or sign up with</span>
          <hr className="flex-grow border-gray-300" />
        </div>

        <div className="flex gap-4">
          <button
            onClick={() => authClient.signIn.social({ provider: "google" })}
            className="flex-1 border p-2 rounded hover:bg-gray-50 text-gray-600"
            type="button"
          >
            <Image src="/google.png" alt="Google" width={20} height={20} className="inline mr-2" />
            Google
          </button>
          <button
            onClick={() => authClient.signIn.social({ provider: "facebook" })}
            className="flex-1 border p-2 rounded hover:bg-gray-50 text-gray-600"
            type="button"
          >
            <Image src="/facebook.png" alt="Facebook" width={20} height={20} className="inline mr-2" />
            Facebook
          </button>
        </div>

        <p className="text-sm text-center mt-6 text-gray-400">
          Already have an account?{" "}
          <Link href="/login" className="text-green-600 hover:underline">Login</Link>
        </p>
      </div>
    </main>
  );
}
