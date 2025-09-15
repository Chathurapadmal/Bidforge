"use client";
import Image from "next/image";
import Link from "next/link";

export default function LoginPage() {
  return (
    <main className="flex justify-center items-center min-h-screen bg-gray-100 px-4">
      <div className="bg-white p-6 sm:p-8 rounded-lg shadow-lg w-full max-w-md">
        
        {/* Logo */}
        <div className="flex justify-center mb-4">
          <Image src="/bidf.png" alt="Bidforge Logo" width={80} height={80} className="h-10 w-auto" />
        </div>

        <h2 className="text-xl font-bold text-center mb-6 text-gray-400">Login to Bidforge</h2>

        {/* Login form */}
        <form className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Email"
            className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
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
            className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition"
          >
            Login
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-2 my-6">
          <hr className="flex-grow border-gray-300" />
          <span className="text-sm text-gray-500">or continue with</span>
          <hr className="flex-grow border-gray-300" />
        </div>

        {/* Social logins */}
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

        {/* Register link */}
        <p className="text-sm text-center mt-6 text-gray-400">
          Don’t have an account?{" "}
          <Link href="/register" className="text-blue-600 hover:underline">
            Register
          </Link>
        </p>
      </div>
    </main>
  );
}
 