"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type User = {
  id: string;
  email: string | null;
  userName: string | null;
};

export default function DashboardPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5062";

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      router.replace("/login");
      return;
    }

    (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/users`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.status === 401) {
          router.replace("/login");
          return;
        }
        if (!res.ok) {
          let msg = `HTTP ${res.status}`;
          try {
            const body = await res.json();
            msg = body?.message || body?.detail || msg;
          } catch {}
          throw new Error(msg);
        }

        const data = (await res.json()) as User[];
        setUsers(data);
      } catch (e: any) {
        setErr(e?.message ?? "Failed to load users");
      } finally {
        setLoading(false);
      }
    })();
  }, [API_BASE, router]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-orange-600 mb-4">Registered Users</h1>

      {loading && <p>Loading...</p>}
      {err && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-2">
          {err}
        </p>
      )}

      {!loading && !err && (
        <table className="w-full border-collapse border border-orange-300">
          <thead className="bg-orange-100">
            <tr>
              <th className="border border-orange-300 p-2 text-left">ID</th>
              <th className="border border-orange-300 p-2 text-left">Email</th>
              <th className="border border-orange-300 p-2 text-left">Username</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="text-sm">
                <td className="border border-orange-200 p-2">{u.id}</td>
                <td className="border border-orange-200 p-2">{u.email ?? "-"}</td>
                <td className="border border-orange-200 p-2">{u.userName ?? "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
