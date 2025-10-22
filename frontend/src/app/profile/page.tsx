"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "../../lib/session";
import { apiFetch, apiFetchForm } from "../../lib/api";
import { toImageSrc } from "../../lib/Config";

type KycState = {
  status: string;
  nic?: string | null;
  selfie?: string | null;
  reviewedAt?: string | null;
};

export default function ProfilePage() {
  const { user, loading, refresh } = useSession();
  const router = useRouter();

  const tabs = ["Profile", "Verification"] as const;
  type Tab = (typeof tabs)[number];
  const [tab, setTab] = useState<Tab>("Profile");

  const [name, setName] = useState(user?.name || "");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [kyc, setKyc] = useState<KycState | null>(null);
  const [nicFile, setNicFile] = useState<File | null>(null);
  const [selfieFile, setSelfieFile] = useState<File | null>(null);

  const [err, setErr] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void refresh();
  }, [refresh]);
  useEffect(() => {
    if (!loading && !user) router.replace("/auth/login?next=/profile");
  }, [loading, user, router]);

  useEffect(() => {
    if (user) void loadKyc();
  }, [user]);

  const loadKyc = async () => {
    try {
      const s = await apiFetch<KycState>("/api/kyc");
      setKyc(s);
    } catch {
      /* ignore */
    }
  };

  const onSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setInfo(null);
    setBusy(true);
    try {
      await apiFetch("/api/profile", {
        method: "PUT",
        body: JSON.stringify({ name }),
      });
      setInfo("Profile updated.");
    } catch (e: any) {
      setErr(e?.message ?? "Update failed");
    } finally {
      setBusy(false);
    }
  };

  const onUploadAvatar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!avatarFile) return;
    setErr(null);
    setInfo(null);
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("file", avatarFile);
      await apiFetchForm("/api/profile/avatar", fd, { method: "POST" });
      setAvatarFile(null);
      setInfo("Avatar updated.");
    } catch (e: any) {
      setErr(e?.message ?? "Upload failed");
    } finally {
      setBusy(false);
    }
  };

  const submitKyc = async (type: "nic" | "selfie") => {
    const file = type === "nic" ? nicFile : selfieFile;
    if (!file) return;
    setErr(null);
    setInfo(null);
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      await apiFetchForm(`/api/kyc/${type}`, fd, { method: "POST" });
      if (type === "nic") setNicFile(null);
      else setSelfieFile(null);
      await loadKyc();
      setInfo(`${type.toUpperCase()} uploaded.`);
    } catch (e: any) {
      setErr(e?.message ?? "Upload failed");
    } finally {
      setBusy(false);
    }
  };

  if (loading || !user)
    return <main className="max-w-4xl mx-auto p-6">Loading…</main>;

  const avatarUrl = toImageSrc(user.avatarUrl || undefined);

  return (
    <main className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold">Your Account</h1>
      {(err || info) && (
        <p className={`mt-4 ${err ? "text-red-600" : "text-green-700"}`}>
          {err || info}
        </p>
      )}

      <div className="mt-6 flex gap-2 border-b">
        {tabs.map((t) => (
          <button
            key={t}
            className={`px-3 py-2 -mb-px border-b-2 ${tab === t ? "border-indigo-600 text-indigo-700" : "border-transparent text-gray-600"}`}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "Profile" && (
        <section className="mt-6 grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-white p-4 border rounded">
            <form onSubmit={onSaveProfile} className="grid gap-3">
              <label className="text-sm text-gray-600">Display name</label>
              <input
                className="border p-2 rounded"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <div className="text-sm text-gray-600">Email</div>
              <div className="p-2 border rounded bg-gray-50">{user.email}</div>
              <div className="text-sm text-gray-600">Email status</div>
              <div className="p-2 border rounded bg-gray-50">
                {user.emailConfirmed ? "Verified" : "Not verified"}
              </div>
              <button
                disabled={busy}
                className="mt-2 px-4 py-2 rounded bg-indigo-600 text-white disabled:opacity-60"
              >
                {busy ? "Saving…" : "Save"}
              </button>
            </form>
          </div>
          <div className="bg-white p-4 border rounded">
            <div className="text-sm text-gray-600">Profile picture</div>
            <img
              src={avatarUrl || "/placeholder.png"}
              alt="avatar"
              className="w-32 h-32 object-cover rounded-full border mt-2"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = "/placeholder.png";
              }}
            />
            <form onSubmit={onUploadAvatar} className="mt-3 grid gap-2">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setAvatarFile(e.target.files?.[0] ?? null)}
              />
              <button
                disabled={busy || !avatarFile}
                className="px-3 py-1.5 rounded border"
              >
                {busy ? "Uploading…" : "Upload"}
              </button>
            </form>
          </div>
        </section>
      )}

      {tab === "Verification" && (
        <section className="mt-6 grid md:grid-cols-2 gap-6">
          <div className="bg-white p-4 border rounded">
            <h2 className="font-semibold">Status</h2>
            <p className="mt-2 text-sm">
              KYC: <strong>{kyc?.status ?? "none"}</strong>
              {kyc?.reviewedAt && (
                <> • Reviewed {new Date(kyc.reviewedAt).toLocaleString()}</>
              )}
            </p>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div>
                <div className="text-sm text-gray-600">NIC</div>
                {kyc?.nic ? (
                  <img
                    src={toImageSrc(kyc.nic)}
                    alt="nic"
                    className="mt-1 w-full h-36 object-cover border rounded"
                  />
                ) : (
                  <div className="mt-1 text-xs text-gray-500">Not uploaded</div>
                )}
              </div>
              <div>
                <div className="text-sm text-gray-600">Selfie</div>
                {kyc?.selfie ? (
                  <img
                    src={toImageSrc(kyc.selfie)}
                    alt="selfie"
                    className="mt-1 w-full h-36 object-cover border rounded"
                  />
                ) : (
                  <div className="mt-1 text-xs text-gray-500">Not uploaded</div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white p-4 border rounded">
            <h2 className="font-semibold">Upload documents</h2>
            <div className="mt-3">
              <div className="text-sm text-gray-600">NIC image</div>
              <div className="flex gap-2 mt-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setNicFile(e.target.files?.[0] ?? null)}
                />
                <button
                  onClick={() => submitKyc("nic")}
                  disabled={!nicFile || busy}
                  className="px-3 py-1.5 rounded border"
                >
                  Upload NIC
                </button>
              </div>
            </div>
            <div className="mt-4">
              <div className="text-sm text-gray-600">Selfie</div>
              <div className="flex gap-2 mt-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setSelfieFile(e.target.files?.[0] ?? null)}
                />
                <button
                  onClick={() => submitKyc("selfie")}
                  disabled={!selfieFile || busy}
                  className="px-3 py-1.5 rounded border"
                >
                  Upload Selfie
                </button>
              </div>
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
