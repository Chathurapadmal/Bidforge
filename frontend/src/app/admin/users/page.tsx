"use client";

import { useEffect, useMemo, useState } from "react";
import { API_BASE } from "../../../lib/config";

type AdminUser = {
  id: string;
  userName: string;
  email: string;
  emailConfirmed: boolean;
  isApproved: boolean;
  mobileNumber?: string | null;
  nicNumber?: string | null;
  selfiePath?: string | null; // server path e.g. /uploads/selfies/...
  nicImagePath?: string | null; // server path e.g. /uploads/nics/...
  termsAcceptedAt?: string | null;
};

function toAbs(path?: string | null) {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  if (path.startsWith("/")) return `${API_BASE}${path}`;
  return `${API_BASE}/${path}`;
}

export default function AdminUsersPage() {
  const [items, setItems] = useState<AdminUser[]>([]);
  const [status, setStatus] = useState<"pending" | "approved" | "all">(
    "pending"
  );
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  async function load() {
    try {
      setErr(null);
      setLoading(true);
      const res = await fetch(
        `${API_BASE}/api/admin/users?status=${status}&limit=200`,
        { cache: "no-store" }
      );
      const json = await res.json();
      if (!res.ok)
        throw new Error(json?.message || `${res.status} ${res.statusText}`);
      setItems(json.items ?? []);
    } catch (e: any) {
      setErr(e?.message ?? "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [status]);

  async function approve(id: string) {
    if (!confirm("Approve this user?")) return;
    try {
      const res = await fetch(`${API_BASE}/api/admin/users/${id}/approve`, {
        method: "POST",
      });
      if (!res.ok) {
        const txt = await res.text();
        alert(`Approve failed: ${txt}`);
        return;
      }
      await load();
    } catch (e: any) {
      alert(e?.message ?? "Approve failed");
    }
  }

  return (
    <main className="min-h-screen bg-white text-gray-900">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h1 className="text-2xl font-bold">Admin · Users</h1>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as any)}
            className="rounded border border-gray-300 p-2 text-sm"
          >
            <option value="pending">
              Pending (email confirmed, not approved)
            </option>
            <option value="approved">Approved</option>
            <option value="all">All</option>
          </select>
        </div>

        {err && (
          <div className="mb-4 rounded border border-red-300 bg-red-50 p-3 text-sm text-red-800">
            {err}
          </div>
        )}

        {loading ? (
          <p className="text-gray-500">Loading…</p>
        ) : items.length === 0 ? (
          <div className="text-center text-gray-500 py-10 border border-gray-200 rounded-xl bg-white">
            No users in this filter.
          </div>
        ) : (
          <div className="overflow-auto border border-gray-200 rounded-xl bg-white">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr className="border-b">
                  <th className="p-2 text-left">User</th>
                  <th className="p-2 text-left">Contact</th>
                  <th className="p-2 text-left">Documents</th>
                  <th className="p-2 text-left">Status</th>
                  <th className="p-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((u) => (
                  <tr key={u.id} className="border-t align-top">
                    <td className="p-2">
                      <div className="font-semibold">{u.userName}</div>
                      <div className="text-xs text-gray-600">
                        NIC: {u.nicNumber ?? "—"}
                      </div>
                    </td>
                    <td className="p-2">
                      <div>{u.email}</div>
                      <div className="text-xs text-gray-600">
                        {u.mobileNumber ?? "—"}
                      </div>
                    </td>
                    <td className="p-2">
                      <div className="flex gap-2">
                        {u.selfiePath && (
                          <a href={toAbs(u.selfiePath)} target="_blank">
                            <img
                              src={toAbs(u.selfiePath)}
                              className="h-16 w-16 object-cover border rounded"
                              alt="selfie"
                            />
                          </a>
                        )}
                        {u.nicImagePath && (
                          <a href={toAbs(u.nicImagePath)} target="_blank">
                            <img
                              src={toAbs(u.nicImagePath)}
                              className="h-16 w-16 object-cover border rounded"
                              alt="NIC"
                            />
                          </a>
                        )}
                      </div>
                    </td>
                    <td className="p-2">
                      <div className="text-xs">
                        Email:{" "}
                        {u.emailConfirmed ? "Verified ✅" : "Unverified ❌"}
                      </div>
                      <div className="text-xs">
                        Approval: {u.isApproved ? "Approved ✅" : "Pending ⏳"}
                      </div>
                    </td>
                    <td className="p-2">
                      {!u.isApproved ? (
                        <button
                          className="px-3 py-1 rounded bg-green-600 text-white hover:opacity-90"
                          onClick={() => approve(u.id)}
                        >
                          Approve
                        </button>
                      ) : (
                        <span className="text-gray-500 text-xs">
                          No actions
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
