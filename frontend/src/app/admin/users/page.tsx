"use client";
import { useEffect, useMemo, useRef, useState } from "react";

type AdminUser = {
  id: string;
  email: string | null;
  userName: string | null;
  fullName: string | null;
  phoneNumber: string | null;
  isApproved: boolean;
  createdAt: string; // ISO
};

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://localhost:7163";

export default function AdminUsersPage() {
  const [status, setStatus] = useState<"pending" | "approved" | "all">(
    "pending"
  );
  const [search, setSearch] = useState("");
  const [items, setItems] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const fetchAbort = useRef<AbortController | null>(null);

  async function fetchUsers() {
    if (fetchAbort.current) fetchAbort.current.abort();
    fetchAbort.current = new AbortController();

    setLoading(true);
    setErr(null);
    try {
      const params = new URLSearchParams({
        status,
        limit: "200",
        ...(search.trim() ? { search: search.trim() } : {}),
      });

      const res = await fetch(
        `${API_BASE}/api/admin/users?${params.toString()}`,
        {
          credentials: "include",
          signal: fetchAbort.current.signal,
        }
      );

      if (res.status === 401 || res.status === 403) {
        throw new Error("Unauthorized. Please sign in as an Admin.");
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const ct = res.headers.get("content-type") ?? "";
      if (!ct.includes("application/json"))
        throw new Error(`Expected JSON, got ${ct}`);

      const data: AdminUser[] = await res.json();
      setItems(data);
    } catch (e: any) {
      if (e.name === "AbortError") return;
      setErr(e.message ?? String(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  async function approve(id: string) {
    if (approvingId) return;
    setApprovingId(id);
    try {
      const res = await fetch(`${API_BASE}/api/admin/users/${id}/approve`, {
        method: "PATCH",
        credentials: "include",
      });
      if (res.status === 401 || res.status === 403) {
        throw new Error("Unauthorized. Please sign in as an Admin.");
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setItems((prev) =>
        prev.map((u) => (u.id === id ? { ...u, isApproved: true } : u))
      );
    } catch (e: any) {
      alert(e.message ?? String(e));
    } finally {
      setApprovingId(null);
    }
  }

  async function removeUser(id: string) {
    if (deletingId) return;

    const user = items.find((u) => u.id === id);
    const label = user?.fullName || user?.email || "this user";
    if (!confirm(`Delete ${label}? This cannot be undone.`)) return;

    setDeletingId(id);
    const previous = items;
    // optimistic UI
    setItems((prev) => prev.filter((u) => u.id !== id));
    try {
      const res = await fetch(`${API_BASE}/api/admin/users/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.status === 401 || res.status === 403) {
        setItems(previous);
        throw new Error("Unauthorized. Please sign in as an Admin.");
      }
      if (!res.ok) {
        setItems(previous);
        const text = await res.text().catch(() => "");
        throw new Error(text || `HTTP ${res.status}`);
      }
    } catch (e: any) {
      alert(e.message ?? String(e));
    } finally {
      setDeletingId(null);
    }
  }

  const filtered = useMemo(() => {
    if (!search.trim()) return items;
    const s = search.trim().toLowerCase();
    return items.filter(
      (u) =>
        (u.email ?? "").toLowerCase().includes(s) ||
        (u.userName ?? "").toLowerCase().includes(s) ||
        (u.fullName ?? "").toLowerCase().includes(s) ||
        (u.phoneNumber ?? "").toLowerCase().includes(s)
    );
  }, [items, search]);

  const renderDate = (iso: string) => {
    if (!iso) return "-";
    const d = new Date(iso);
    return isNaN(d.getTime()) ? "-" : d.toLocaleString();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-10 bg-white border-b">
        <div className="max-w-5xl mx-auto px-4 py-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <h1 className="text-2xl font-semibold">Admin · Users</h1>
          <div className="flex gap-2">
            {(["pending", "approved", "all"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setStatus(t)}
                className={`px-3 py-1.5 rounded-full border text-sm ${
                  status === t
                    ? "bg-black text-white"
                    : "bg-white hover:bg-gray-100"
                }`}
                aria-pressed={status === t}
              >
                {t[0].toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6">
        <div className="flex items-center gap-2 mb-4">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by email, name, phone…"
            className="w-full md:w-80 rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-black/50"
          />
          <button
            onClick={fetchUsers}
            className="px-3 py-2 rounded-lg bg-black text-white"
            aria-busy={loading}
          >
            Refresh
          </button>
        </div>

        {loading && <div className="text-gray-600">Loading users…</div>}
        {err && <div className="text-red-600">Error: {err}</div>}

        {!loading && !err && (
          <div className="overflow-x-auto rounded-xl border bg-white">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="text-left px-4 py-3">User</th>
                  <th className="text-left px-4 py-3">Username</th>
                  <th className="text-left px-4 py-3">Phone</th>
                  <th className="text-left px-4 py-3">Created</th>
                  <th className="text-left px-4 py-3">Status</th>
                  <th className="text-right px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <tr key={u.id} className="border-t">
                    <td className="px-4 py-3">
                      <div className="font-medium">
                        {u.fullName ?? u.email ?? "(no email)"}
                      </div>
                      <div className="text-gray-500">{u.email}</div>
                    </td>
                    <td className="px-4 py-3">{u.userName ?? "-"}</td>
                    <td className="px-4 py-3">{u.phoneNumber ?? "-"}</td>
                    <td className="px-4 py-3">{renderDate(u.createdAt)}</td>
                    <td className="px-4 py-3">
                      {u.isApproved ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full bg-green-100 text-green-800">
                          Approved
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full bg-yellow-100 text-yellow-800">
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right space-x-2">
                      {!u.isApproved ? (
                        <button
                          onClick={() => approve(u.id)}
                          disabled={approvingId === u.id}
                          className="px-3 py-1.5 rounded-md bg-black text-white hover:opacity-90 disabled:opacity-60"
                          aria-busy={approvingId === u.id}
                          title="Approve user"
                        >
                          {approvingId === u.id ? "Approving…" : "Approve"}
                        </button>
                      ) : (
                        <span className="text-gray-400 align-middle">—</span>
                      )}

                      <button
                        onClick={() => removeUser(u.id)}
                        disabled={deletingId === u.id}
                        className="px-3 py-1.5 rounded-md border text-red-600 hover:bg-red-50 disabled:opacity-60"
                        aria-busy={deletingId === u.id}
                        title="Delete user"
                      >
                        {deletingId === u.id ? "Deleting…" : "Delete"}
                      </button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-8 text-center text-gray-500"
                    >
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
