"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";

type User = {
  id?: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
} | null;

export default function ProfilePage() {
  const router = useRouter();
  const search = useSearchParams();
  const [user, setUser] = useState<User>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  // Load Better Auth session on mount
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/auth/session", { credentials: "include" });
        if (!res.ok) throw new Error(`Session fetch failed: ${res.status}`);
        const data = await res.json();
        const u = data?.user ?? data?.session?.user ?? data?.data?.user ?? null;
        if (!cancelled) {
          setUser(
            u
              ? {
                  id: u.id,
                  name: u.name ?? null,
                  email: u.email ?? null,
                  image: u.image ?? null,
                }
              : null
          );
        }
      } catch (e: any) {
        if (!cancelled) setErr(e?.message || "Failed to load session");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const onSignOut = async () => {
    try {
      await authClient.signOut();
    } catch (e: any) {
      setErr(e?.message || "Sign out failed");
    } finally {
      setUser(null);
      router.refresh();
    }
  };

  if (loading) {
    return <div className="p-6">Loading…</div>;
  }

  if (!user) {
    const next = search?.get("next") || "/profile";
    return (
      <div className="max-w-md mx-auto p-6">
        <h1 className="text-2xl font-semibold mb-3">Profile</h1>
        <p className="mb-6 text-gray-600">You are not logged in.</p>
        <div className="flex gap-3">
          <Link href={`/login?next=${encodeURIComponent(next)}`} className="px-4 py-2 rounded-lg border hover:shadow">
            Login
          </Link>
          <Link href={`/register?next=${encodeURIComponent(next)}`} className="px-4 py-2 rounded-lg border hover:shadow">
            Register
          </Link>
        </div>
        {err && <p className="text-sm text-red-600 mt-4">{err}</p>}
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-6">Your Profile</h1>

      <div className="rounded-lg border bg-white p-4 flex items-center gap-4">
        <Image
          src={user.image || "/avatar.png"}
          alt="Avatar"
          width={64}
          height={64}
          className="rounded-full"
        />
        <div>
          <p className="text-lg font-medium">{user.name || "No name"}</p>
          <p className="text-gray-600">{user.email}</p>
          {user.id && <p className="text-gray-400 text-sm mt-2">User ID: {user.id}</p>}
        </div>
      </div>

      <div className="mt-6 flex gap-3">
        <Link href="/buy" className="px-4 py-2 rounded-lg border hover:shadow">
          Buy
        </Link>
        <Link href="/sell" className="px-4 py-2 rounded-lg border hover:shadow">
          Sell
        </Link>
        <button onClick={onSignOut} className="px-4 py-2 rounded-lg border text-red-600 hover:shadow">
          Log out
        </button>
      </div>

      {err && <p className="text-sm text-red-600 mt-4">{err}</p>}
    </div>
  );
}
