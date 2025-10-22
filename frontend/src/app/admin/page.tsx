"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "../../lib/api";
import { toImageSrc } from "../../lib/Config";

type AdminUser = {
  id: string;
  email: string | null;
  name: string | null;
  emailConfirmed: boolean;
  roles: string[];
  kycStatus: string;
  nic?: string | null;
  selfie?: string | null;
  avatar?: string | null;
};

type PendingKycUser = {
  id: string;
  email: string | null;
  name: string | null;
  nic?: string | null;
  selfie?: string | null;
};

export default function AdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [authErr, setAuthErr] = useState<string | null>(null);

  const [tab, setTab] = useState<"KYC Review" | "Users">("KYC Review");
  const [pending, setPending] = useState<PendingKycUser[] | null>(null);
  const [users, setUsers] = useState<AdminUser[] | null>(null);

  // users tab filters
  const [q, setQ] = useState("");
  const [kyc, setKyc] = useState<
    "" | "pending" | "approved" | "rejected" | "none"
  >("");

  const loadPending = async () => {
    const list = await apiFetch<PendingKycUser[]>("/api/admin/kyc/pending");
    setPending(list);
  };

  const loadUsers = async () => {
    const qs = new URLSearchParams();
    if (q.trim()) qs.set("query", q.trim());
    if (kyc) qs.set("kyc", kyc);
    const list = await apiFetch<AdminUser[]>(
      `/api/admin/users?${qs.toString()}`
    );
    setUsers(list);
  };

  const init = async () => {
    try {
      await loadPending();
      await loadUsers();
      setLoading(false);
    } catch (e: any) {
      // If 401/403, you aren't admin or not logged in
      setAuthErr(e?.message ?? "Unauthorized");
      setLoading(false);
    }
  };

  useEffect(() => {
    void init();
  }, []);

  const onApprove = async (userId: string) => {
    try {
      await apiFetch(`/api/admin/kyc/approve/${userId}`, { method: "POST" });
      await loadPending();
      await loadUsers();
    } catch {}
  };

  const onReject = async (userId: string) => {
    try {
      await apiFetch(`/api/admin/kyc/reject/${userId}`, { method: "POST" });
      await loadPending();
      await loadUsers();
    } catch {}
  };

  const onDeleteUser = async (userId: string) => {
    if (!confirm("Delete this user? This cannot be undone.")) return;
    try {
      await apiFetch(`/api/admin/users/${userId}`, { method: "DELETE" });
      await loadPending();
      await loadUsers();
    } catch (e: any) {
      alert(e?.message ?? "Delete failed");
    }
  };

  const filteredPending = pending ?? [];

  if (loading) return <main className="max-w-6xl mx-auto p-6">Loading…</main>;
  if (authErr)
    return (
      <main className="max-w-xl mx-auto p-6">
        <h1 className="text-2xl font-bold">Admin</h1>
        <p className="mt-4 text-red-600">
          Not authorized. Log in as an admin user.
        </p>
      </main>
    );

  return (
    <main className="max-w-7xl mx-auto p-6">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>

      <div className="mt-6 flex gap-2 border-b">
        {(["KYC Review", "Users"] as const).map((t) => (
          <button
            key={t}
            className={`px-3 py-2 -mb-px border-b-2 ${tab === t ? "border-indigo-600 text-indigo-700" : "border-transparent text-gray-600"}`}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </div>

      {/* KYC REVIEW */}
      {tab === "KYC Review" && (
        <section className="mt-6">
          {filteredPending.length === 0 ? (
            <p className="text-gray-600">No pending verifications.</p>
          ) : (
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
              {filteredPending.map((u) => (
                <article
                  key={u.id}
                  className="border rounded bg-white overflow-hidden"
                >
                  <div className="p-3 border-b">
                    <div className="font-semibold">{u.name || u.email}</div>
                    <div className="text-xs text-gray-500">{u.email}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 p-3">
                    <div>
                      <div className="text-xs text-gray-600 mb-1">NIC</div>
                      <div className="aspect-[4/3] bg-gray-100 overflow-hidden rounded">
                        <img
                          src={toImageSrc(u.nic || undefined)}
                          alt="nic"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src =
                              "/placeholder.png";
                          }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-600 mb-1">Selfie</div>
                      <div className="aspect-[4/3] bg-gray-100 overflow-hidden rounded">
                        <img
                          src={toImageSrc(u.selfie || undefined)}
                          alt="selfie"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src =
                              "/placeholder.png";
                          }}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 p-3 border-t">
                    <button
                      onClick={() => onApprove(u.id)}
                      className="px-3 py-1.5 rounded bg-emerald-600 text-white"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => onReject(u.id)}
                      className="px-3 py-1.5 rounded bg-amber-600 text-white"
                    >
                      Reject
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      )}

      {/* USERS */}
      {tab === "Users" && (
        <section className="mt-6">
          <div className="flex flex-wrap gap-2 items-end">
            <div>
              <label className="text-xs text-gray-600">Search</label>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="name, email, id"
                className="block border p-2 rounded"
              />
            </div>
            <div>
              <label className="text-xs text-gray-600">KYC</label>
              <select
                value={kyc}
                onChange={(e) => setKyc(e.target.value as any)}
                className="block border p-2 rounded"
              >
                <option value="">(all)</option>
                <option value="pending">pending</option>
                <option value="approved">approved</option>
                <option value="rejected">rejected</option>
                <option value="none">none</option>
              </select>
            </div>
            <button onClick={loadUsers} className="px-3 py-2 border rounded">
              Apply
            </button>
          </div>

          {!users || users.length === 0 ? (
            <p className="mt-4 text-gray-600">No users.</p>
          ) : (
            <div className="mt-4 overflow-x-auto bg-white border rounded">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left p-2">User</th>
                    <th className="text-left p-2">Email</th>
                    <th className="text-left p-2">Email Verified</th>
                    <th className="text-left p-2">Roles</th>
                    <th className="text-left p-2">KYC</th>
                    <th className="p-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="border-t">
                      <td className="p-2">
                        <div className="flex items-center gap-2">
                          <img
                            src={toImageSrc(u.avatar || undefined)}
                            alt=""
                            className="w-8 h-8 object-cover rounded-full border"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src =
                                "/placeholder.png";
                            }}
                          />
                          <div>
                            <div className="font-medium">{u.name}</div>
                            <div className="text-xs text-gray-500">{u.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-2">{u.email}</td>
                      <td className="p-2">{u.emailConfirmed ? "Yes" : "No"}</td>
                      <td className="p-2">
                        {u.roles?.length ? u.roles.join(", ") : "—"}
                      </td>
                      <td className="p-2">
                        <span
                          className={`px-2 py-0.5 rounded text-xs ${kycBadge(u.kycStatus)}`}
                        >
                          {u.kycStatus}
                        </span>
                      </td>
                      <td className="p-2 text-right">
                        <button
                          onClick={() => onDeleteUser(u.id)}
                          className="px-3 py-1.5 rounded border"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}
    </main>
  );
}

function kycBadge(status: string) {
  switch ((status || "none").toLowerCase()) {
    case "approved":
      return "bg-emerald-50 text-emerald-700";
    case "pending":
      return "bg-amber-50 text-amber-700";
    case "rejected":
      return "bg-rose-50 text-rose-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
}
