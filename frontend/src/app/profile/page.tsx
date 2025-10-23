// src/app/profile/page.tsx
"use client";

import { useEffect, useState } from "react";
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
      const s = await apiFetch<KycState>("/api/kyc/me");
      setKyc(s as any); // keep your wrapper’s behavior
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

  const onSubmitKycBoth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setInfo(null);

    if (!nicFile && !selfieFile) {
      setErr("Please choose at least one file (NIC or Selfie).");
      return;
    }

    setBusy(true);
    try {
      let didSomething = false;
      if (nicFile) {
        const fdNic = new FormData();
        fdNic.append("Nic", nicFile);
        await apiFetchForm("/api/kyc/nic", fdNic, { method: "POST" });
        didSomething = true;
      }
      if (selfieFile) {
        const fdSelfie = new FormData();
        fdSelfie.append("Selfie", selfieFile);
        await apiFetchForm("/api/kyc/selfie", fdSelfie, { method: "POST" });
        didSomething = true;
      }
      if (didSomething) {
        setNicFile(null);
        setSelfieFile(null);
        await loadKyc();
        setInfo("KYC files uploaded. Status set to pending.");
      }
    } catch (e: any) {
      setErr(e?.message ?? "KYC upload failed");
    } finally {
      setBusy(false);
    }
  };

  if (loading || !user) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="w-full max-w-2xl animate-pulse">
          <div className="h-6 w-40 bg-gray-200 rounded mb-4" />
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2 h-64 bg-white border border-gray-200 rounded-2xl" />
            <div className="h-64 bg-white border border-gray-200 rounded-2xl" />
          </div>
        </div>
      </main>
    );
  }

  const avatarUrl = toImageSrc(user.avatarUrl || undefined);

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-2xl font-semibold text-gray-900">Your account</h1>

        {/* Alerts */}
        {err && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {err}
          </div>
        )}
        {info && (
          <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {info}
          </div>
        )}

        {/* Tabs */}
        <div className="mt-6 border-b border-gray-200">
          <div className="flex gap-2">
            {tabs.map((t) => {
              const active = tab === t;
              return (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`px-4 py-2 text-sm font-medium -mb-px rounded-t-xl border-b-2 transition ${
                    active
                      ? "border-indigo-600 text-indigo-700"
                      : "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300"
                  }`}
                >
                  {t}
                </button>
              );
            })}
          </div>
        </div>

        {tab === "Profile" && (
          <section className="mt-6 grid md:grid-cols-3 gap-6">
            {/* Details card */}
            <div className="md:col-span-2 bg-white border border-gray-200 shadow-sm rounded-2xl p-6">
              <form onSubmit={onSaveProfile} className="grid gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Display name
                  </label>
                  <input
                    className="block w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-gray-900 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div>
                  <div className="mb-1.5 text-sm font-medium text-gray-700">
                    Email
                  </div>
                  <div className="rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-gray-900">
                    {user.email}
                  </div>
                </div>

                <div>
                  <div className="mb-1.5 text-sm font-medium text-gray-700">
                    Email status
                  </div>
                  <div className="rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5">
                    {user.emailConfirmed ? "Verified" : "Not verified"}
                  </div>
                </div>

                <button
                  disabled={busy}
                  className="mt-2 inline-flex w-fit items-center justify-center rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {busy ? "Saving…" : "Save changes"}
                </button>
              </form>
            </div>

            {/* Avatar card */}
            <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-6">
              <div className="text-sm font-medium text-gray-700">
                Profile picture
              </div>
              <img
                src={avatarUrl || "/placeholder.png"}
                alt="avatar"
                className="mt-3 w-32 h-32 object-cover rounded-full border"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src =
                    "/placeholder.png";
                }}
              />
              <form onSubmit={onUploadAvatar} className="mt-4 grid gap-3">
                <label className="block">
                  <span className="mb-1.5 block text-sm text-gray-600">
                    Upload image
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setAvatarFile(e.target.files?.[0] ?? null)}
                    className="block w-full text-sm text-gray-700 file:mr-3 file:rounded-lg file:border-0 file:bg-gray-100 file:px-4 file:py-2 file:text-gray-700 hover:file:bg-gray-200"
                  />
                </label>
                <button
                  disabled={busy || !avatarFile}
                  className="inline-flex w-fit items-center justify-center rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-800 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {busy ? "Uploading…" : "Upload"}
                </button>
              </form>
            </div>
          </section>
        )}

        {tab === "Verification" && (
          <section className="mt-6 grid md:grid-cols-2 gap-6">
            {/* Status card */}
            <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-6">
              <h2 className="text-base font-semibold text-gray-900">Status</h2>
              <p className="mt-2 text-sm text-gray-700">
                KYC: <strong>{kyc?.status ?? "none"}</strong>
                {kyc?.reviewedAt && (
                  <> • Reviewed {new Date(kyc.reviewedAt).toLocaleString()}</>
                )}
              </p>

              <div className="mt-4 grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-600">NIC</div>
                  {kyc?.nic ? (
                    <img
                      src={toImageSrc(kyc.nic)}
                      alt="nic"
                      className="mt-2 w-full h-40 object-cover border rounded-xl"
                    />
                  ) : (
                    <div className="mt-2 text-xs text-gray-500">
                      Not uploaded
                    </div>
                  )}
                </div>
                <div>
                  <div className="text-sm text-gray-600">Selfie</div>
                  {kyc?.selfie ? (
                    <img
                      src={toImageSrc(kyc.selfie)}
                      alt="selfie"
                      className="mt-2 w-full h-40 object-cover border rounded-xl"
                    />
                  ) : (
                    <div className="mt-2 text-xs text-gray-500">
                      Not uploaded
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Upload card */}
            <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-6">
              <h2 className="text-base font-semibold text-gray-900">
                Upload documents
              </h2>
              <form onSubmit={onSubmitKycBoth} className="mt-4 grid gap-5">
                <label className="block">
                  <span className="mb-1.5 block text-sm text-gray-600">
                    NIC image
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setNicFile(e.target.files?.[0] ?? null)}
                    className="block w-full text-sm text-gray-700 file:mr-3 file:rounded-lg file:border-0 file:bg-gray-100 file:px-4 file:py-2 file:text-gray-700 hover:file:bg-gray-200"
                  />
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-sm text-gray-600">
                    Selfie
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setSelfieFile(e.target.files?.[0] ?? null)}
                    className="block w-full text-sm text-gray-700 file:mr-3 file:rounded-lg file:border-0 file:bg-gray-100 file:px-4 file:py-2 file:text-gray-700 hover:file:bg-gray-200"
                  />
                </label>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="submit"
                    disabled={busy || (!nicFile && !selfieFile)}
                    className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {busy ? "Submitting…" : "Submit verification"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setNicFile(null);
                      setSelfieFile(null);
                    }}
                    className="inline-flex items-center justify-center rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-800 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed"
                    disabled={busy}
                  >
                    Clear
                  </button>
                </div>

                <p className="text-xs text-gray-500">
                  You can submit one or both files. Submitting either will set
                  your KYC status to <b>pending</b>.
                </p>
              </form>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
