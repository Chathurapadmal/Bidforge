// src/app/profile/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { API_BASE } from "../../lib/config";

type Me = {
  userName: string;
  email: string;
  fullName?: string | null;
  profilePicture?: string | null; // e.g. "/profile-pictures/abc.jpg" or absolute URL
};

const PLACEHOLDER = "/placeholder.png";

export default function ProfilePage() {
  const [me, setMe] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const router = useRouter();

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/auth/me`, {
          credentials: "include",
        });
        if (res.status === 401) {
          router.replace(`/auth/login?next=/profile`);
          return;
        }
        if (!res.ok) {
          setErr(`Failed to load profile: ${res.status} ${res.statusText}`);
          return;
        }
        const j = (await res.json()) as Me;
        if (active) setMe(j);
      } catch (e: any) {
        setErr(e?.message || "Failed to load profile");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [router]);

  function onPickFile(f?: File | null) {
    setFile(f ?? null);
    if (f) {
      const url = URL.createObjectURL(f);
      setPreview(url);
    } else {
      setPreview(null);
    }
  }

  async function onUpload() {
    if (!file) return;
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch(`${API_BASE}/api/profile/upload-picture`, {
        method: "POST",
        credentials: "include",
        body: fd,
      });
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(text || `Upload failed: ${res.status}`);
      }
      // Re-fetch /me to get the new photo URL
      const meRes = await fetch(`${API_BASE}/api/auth/me`, {
        credentials: "include",
      });
      if (meRes.ok) setMe(await meRes.json());
      setFile(null);
      setPreview(null);
    } catch (e: any) {
      setErr(e?.message ?? "Upload failed");
    }
  }

  if (loading) return <div className="p-6">Loading…</div>;
  if (err) return <div className="p-6 text-red-600">{err}</div>;
  if (!me) return null;

  const imgSrc =
    preview ??
    (me.profilePicture && me.profilePicture.trim()
      ? me.profilePicture
      : PLACEHOLDER);

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-lg mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold mb-6">Your Profile</h1>

        <div className="bg-white rounded-xl border p-6 space-y-4">
          <div className="flex items-center gap-4">
            <img
              src={imgSrc}
              alt="Profile"
              className="w-24 h-24 rounded-full object-cover border"
            />
            <div>
              <div className="text-lg font-semibold">
                {me.fullName?.trim() || me.userName}
              </div>
              <div className="text-gray-600">{me.email}</div>
            </div>
          </div>

          <div className="pt-4 border-t">
            <label className="block text-sm font-medium mb-1">
              Update profile picture
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => onPickFile(e.target.files?.[0] || null)}
              className="block"
            />
            <button
              disabled={!file}
              onClick={onUpload}
              className="mt-3 inline-flex items-center rounded bg-blue-600 px-4 py-2 text-white hover:opacity-90 disabled:opacity-60"
            >
              Upload
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
