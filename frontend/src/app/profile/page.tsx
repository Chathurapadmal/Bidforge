
// src/app/profile/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AuthApi, User } from "../services/api/AuthApi";

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      setLoading(false);
      return;
    }
    AuthApi.me(token)
      .then(setUser)
      .catch((e) => setError(e?.message ?? "Failed to load user"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-6">Loading...</div>;

  if (!user) {
    return (
      <div className="max-w-md mx-auto p-6">
        <h1 className="text-2xl font-semibold mb-3">Profile</h1>
        <p className="mb-6 text-gray-600">You are not logged in.</p>
        <div className="flex gap-3">
          <Link href="/login" className="px-4 py-2 rounded-lg border hover:shadow">
            Login
          </Link>
          <Link href="/register" className="px-4 py-2 rounded-lg border hover:shadow">
            Register
          </Link>
        </div>
        {error && <p className="text-sm text-red-600 mt-4">{error}</p>}
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-6">Your Profile</h1>
      <div className="space-y-2">
        <div>
          <span className="font-medium">Name:</span> {user.name}
        </div>
        <div>
          <span className="font-medium">Email:</span> {user.email}
        </div>
        <div>
          <span className="font-medium">ID:</span> {user.id}
        </div>
      </div>

      <button
        className="mt-6 text-sm underline"
        onClick={() => {
          localStorage.removeItem("auth_token");
          setUser(null);
        }}
      >
        Log out
      </button>
    </div>
  );
}
