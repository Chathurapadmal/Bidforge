// src/app/profile/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "../../lib/session";
import { apiFetch, apiFetchForm } from "../../lib/api";
import { toImageSrc } from "../../lib/Config";

type Profile = {
  id: string;
  email: string | null;
  name: string | null;
  avatarUrl?: string | null;
};

type MyAuction = {
  id: number;
  title: string;
  currentBid: number;
  endTime: string;
  image?: string | null;
  badge?: string | null;
};

type MyBid = {
  id: number;
  amount: number;
  at: string;
  auctionId: number;
  auctionTitle: string;
};

type Note = {
  id: number;
  type: string;
  message: string;
  createdAt: string;
  isRead: boolean;
  data?: string | null;
};

export default function ProfilePage() {
  const { user, loading, refresh } = useSession();
  const router = useRouter();

  // tabs
  const tabs = ["Profile", "My Auctions", "My Bids", "Notifications"] as const;
  type Tab = (typeof tabs)[number];
  const [tab, setTab] = useState<Tab>("Profile");

  // data
  const [me, setMe] = useState<Profile | null>(null);
  const [mine, setMine] = useState<MyAuction[] | null>(null);
  const [bids, setBids] = useState<MyBid[] | null>(null);
  const [notes, setNotes] = useState<Note[] | null>(null);

  const [name, setName] = useState("");
  const avatarUrl = useMemo(
    () => toImageSrc(me?.avatarUrl || undefined),
    [me?.avatarUrl]
  );

  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const [err, setErr] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void refresh();
  }, [refresh]);
  useEffect(() => {
    if (!loading && !user) router.replace("/auth/login?next=/profile");
  }, [loading, user, router]);

  const loadMe = async () => {
    const p = await apiFetch<Profile>("/api/profile");
    setMe(p);
    setName(p.name || "");
  };
  const loadMineAuctions = async () =>
    setMine(await apiFetch<MyAuction[]>("/api/my/auctions"));
  const loadMyBids = async () =>
    setBids(await apiFetch<MyBid[]>("/api/my/bids"));
  const loadNotes = async () =>
    setNotes(await apiFetch<Note[]>("/api/notifications"));

  useEffect(() => {
    if (user) {
      void loadMe();
      void loadMineAuctions();
      void loadMyBids();
      void loadNotes();
    }
  }, [user]);

  if (loading || !user)
    return <main className="max-w-4xl mx-auto p-6">Loading…</main>;

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
      await loadMe();
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
      await loadMe();
      setAvatarFile(null);
      setInfo("Avatar updated.");
    } catch (e: any) {
      setErr(e?.message ?? "Upload failed");
    } finally {
      setBusy(false);
    }
  };

  const markAllRead = async () => {
    try {
      await apiFetch("/api/notifications/read-all", { method: "POST" });
      await loadNotes();
    } catch (e) {
      /* ignore */
    }
  };

  return (
    <main className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold">Your Account</h1>

      {(err || info) && (
        <p className={`mt-4 ${err ? "text-red-600" : "text-green-600"}`}>
          {err || info}
        </p>
      )}

      {/* Tabs */}
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

      {/* PROFILE */}
      {tab === "Profile" && me && (
        <section className="mt-6 grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <form
              onSubmit={onSaveProfile}
              className="grid gap-3 bg-white p-4 border rounded"
            >
              <label className="text-sm text-gray-600">Display name</label>
              <input
                className="border p-2 rounded"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
              />
              <div className="text-sm text-gray-600">Email</div>
              <div className="p-2 border rounded bg-gray-50">
                {me.email || "—"}
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
            <div className="mt-2">
              <img
                src={avatarUrl || "/placeholder.png"}
                alt="avatar"
                className="w-32 h-32 object-cover rounded-full border"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src =
                    "/placeholder.png";
                }}
              />
            </div>
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

      {/* MY AUCTIONS */}
      {tab === "My Auctions" && (
        <section className="mt-6">
          {!mine ? (
            <p>Loading…</p>
          ) : mine.length === 0 ? (
            <p className="text-gray-600">
              You haven’t created any auctions yet.
            </p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {mine.map((a) => (
                <article
                  key={a.id}
                  className="border rounded overflow-hidden bg-white"
                >
                  <div className="aspect-[4/3] bg-gray-100 overflow-hidden">
                    <img
                      src={toImageSrc(a.image)}
                      alt={a.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src =
                          "/placeholder.png";
                      }}
                    />
                  </div>
                  <div className="p-3">
                    <div className="font-semibold line-clamp-1">{a.title}</div>
                    <div className="text-sm mt-1">
                      Current: LKR {a.currentBid.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500">
                      Ends {new Date(a.endTime).toLocaleString()}
                    </div>
                    <div className="mt-3">
                      <a
                        className="text-indigo-600 hover:underline"
                        href={`/productDetail/${a.id}`}
                      >
                        Open
                      </a>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      )}

      {/* MY BIDS */}
      {tab === "My Bids" && (
        <section className="mt-6">
          {!bids ? (
            <p>Loading…</p>
          ) : bids.length === 0 ? (
            <p className="text-gray-600">You haven’t placed any bids yet.</p>
          ) : (
            <div className="overflow-x-auto bg-white border rounded">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left p-2">Auction</th>
                    <th className="text-left p-2">Bid</th>
                    <th className="text-left p-2">At</th>
                    <th className="p-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {bids.map((b) => (
                    <tr key={b.id} className="border-t">
                      <td className="p-2">{b.auctionTitle}</td>
                      <td className="p-2">LKR {b.amount.toLocaleString()}</td>
                      <td className="p-2">{new Date(b.at).toLocaleString()}</td>
                      <td className="p-2">
                        <a
                          className="text-indigo-600 hover:underline"
                          href={`/productDetail/${b.auctionId}`}
                        >
                          Open
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {/* NOTIFICATIONS */}
      {tab === "Notifications" && (
        <section className="mt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Your notifications</h2>
            <button
              onClick={markAllRead}
              className="text-sm px-3 py-1.5 border rounded"
            >
              Mark all read
            </button>
          </div>

          {!notes ? (
            <p className="mt-4">Loading…</p>
          ) : notes.length === 0 ? (
            <p className="mt-4 text-gray-600">No notifications yet.</p>
          ) : (
            <ul className="mt-4 divide-y border rounded bg-white">
              {notes.map((n) => (
                <li key={n.id} className="p-3">
                  <div className="text-sm">
                    <span
                      className={`inline-block px-2 py-0.5 rounded mr-2 ${badgeClass(n.type)}`}
                    >
                      {n.type}
                    </span>
                    {n.message}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {new Date(n.createdAt).toLocaleString()}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </main>
  );
}

function badgeClass(type: string) {
  switch (type) {
    case "bid_placed":
      return "bg-blue-50 text-blue-700";
    case "outbid":
      return "bg-amber-50 text-amber-700";
    case "winner_purchased":
      return "bg-emerald-50 text-emerald-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
}
