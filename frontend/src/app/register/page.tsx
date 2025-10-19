"use client";
import Image from "next/image";
import Link from "next/link";

export default function RegisterPage() {
  return (
    <main className="flex justify-center items-center min-h-screen bg-gray-100 px-4">
      <div className="bg-white p-6 sm:p-8 rounded-lg shadow-lg w-full max-w-md">
        
        {/* Logo */}
        <div className="flex justify-center mb-4">
          <Image src="/bidf.png" alt="Bidforge Logo" width={80} height={80} className="h-10 w-auto" />
        </div>

        <h2 className="text-xl font-bold text-center mb-6 text-gray-400"  >Create an Account</h2>

        {/* Register form */}
        <form className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Full Name"
            className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-green-400"
            required
          />
          <input
            type="email"
            placeholder="Email"
            className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-green-400"
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-green-400"
            required
          />
          <input
            type="password"
            placeholder="Confirm Password"
            className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-green-400"
            required
          />

          <label className="flex items-center gap-2 text-sm text-gray-400">
            <input type="checkbox" className="accent-green-600" required />
            I agree to the{" "}
            <Link href="/terms" className="text-green-600 hover:underline">
              Terms & Conditions
            </Link>
          </label>

          <button
            type="submit"
            className="bg-green-600 text-white p-2 rounded hover:bg-green-700 transition"
          >
            Register
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-2 my-6">
          <hr className="flex-grow border-gray-300" />
          <span className="text-sm text-gray-500">or sign up with</span>
          <hr className="flex-grow border-gray-300" />
        </div>

        {/* Social sign up */}
        <div className="flex gap-4">
          <button className="flex-1 border p-2 rounded hover:bg-gray-50 text-gray-600">
            <Image src="/google.png" alt="Google" width={20} height={20} className="inline mr-2" />
            Google
          </button>
          <button className="flex-1 border p-2 rounded hover:bg-gray-50 text-gray-600 ">
            <Image src="/facebook.png" alt="Facebook" width={20} height={20} className="inline mr-2" />
            Facebook
          </button>
        </div>

        {/* Already have account */}
        <p className="text-sm text-center mt-6 text-gray-400">
          Already have an account?{" "}
          <Link href="/login" className="text-green-600 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </main>
  );
}
