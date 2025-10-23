// File: src/app/sell/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "../../lib/session";
import { apiFetch, apiFetchForm } from "../../lib/api";
import { toImageSrc } from "../../lib/Config";

type MyAuction = {
  id: number;
  title: string;
  currentBid: number;
  endTime: string;
  image?: string | null;
  badge?: string | null;
};

export default function SellPage() {
  const router = useRouter();
  const { user, loading, refresh } = useSession();

  const [form, setForm] = useState({
    title: "",
    description: "",
    startingBid: "",
    endTime: "",
    badge: "",
  });
  const [image, setImage] = useState<File | null>(null);

  const [err, setErr] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [mine, setMine] = useState<MyAuction[] | null>(null);
  const [loadingMine, setLoadingMine] = useState(false);

  // Require login
  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/auth/login?next=/sell");
    }
  }, [loading, user, router]);

  const loadMine = async () => {
    setLoadingMine(true);
    try {
      const items = await apiFetch<MyAuction[]>("/api/my/auctions");
      setMine(items);
    } catch (e: any) {
      setMine([]);
      setErr(e?.message ?? "Failed to load your auctions");
    } finally {
      setLoadingMine(false);
    }
  };

  useEffect(() => {
    if (user) void loadMine();
  }, [user]);

  const set = (k: keyof typeof form, v: string) =>
    setForm((s) => ({ ...s, [k]: v }));

  const previewUrl = useMemo(() => {
    if (!image) return "";
    return URL.createObjectURL(image);
  }, [image]);

  useEffect(() => {
    // cleanup preview URL
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setInfo(null);

    if (!form.title.trim()) return setErr("Title is required.");
    if (!form.endTime || Number.isNaN(Date.parse(form.endTime)))
      return setErr("Please pick a valid end time.");

    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("Title", form.title.trim());
      if (form.description.trim())
        fd.append("Description", form.description.trim());

      const start = (form.startingBid || "").trim();
      const starting = start ? Number(start) : 0;
      if (Number.isNaN(starting) || starting < 0)
        throw new Error("Starting bid must be a number ≥ 0.");
      fd.append("StartingBid", String(starting));

      // backend expects UTC
      const endIso = new Date(form.endTime).toISOString();
      fd.append("EndTimeUtc", endIso);

      if (form.badge.trim()) fd.append("Badge", form.badge.trim());
      if (image) fd.append("Image", image);

      await apiFetchForm<{ id: number }>("/api/auctions", fd, {
        method: "POST",
      });

      setInfo("Auction created!");
      setForm({
        title: "",
        description: "",
        startingBid: "",
        endTime: "",
        badge: "",
      });
      setImage(null);
      await loadMine();
    } catch (e: any) {
      setErr(e?.message ?? "Create failed");
    } finally {
      setBusy(false);
    }
  };

  const onDelete = async (id: number) => {
    if (!confirm("Delete this auction?")) return;
    try {
      await apiFetch(`/api/auctions/${id}`, { method: "DELETE" });
      await loadMine();
    } catch (e: any) {
      alert(e?.message ?? "Delete failed");
    }
  };

  if (loading || !user) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="w-full max-w-3xl animate-pulse">
          <div className="h-6 w-56 bg-gray-200 rounded mb-4" />
          <div className="h-64 bg-white border border-gray-200 rounded-2xl" />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-2xl font-semibold text-gray-900">Sell</h1>

        {/* Alerts */}
        {err && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 whitespace-pre-wrap">
            {err}
          </div>
        )}
        {info && (
          <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {info}
          </div>
        )}

        {/* Create form card */}
        <section className="mt-6">
          <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-6 max-w-3xl">
            <h2 className="text-lg font-semibold text-gray-900">
              Create an auction
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              End time is interpreted in your local timezone and stored as UTC.
            </p>

            <form onSubmit={onSubmit} className="mt-5 grid gap-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Title
                </label>
                <input
                  className="block w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-gray-900 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g., Throttle Body for FB 15"
                  value={form.title}
                  onChange={(e) => set("title", e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  className="block w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-gray-900 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Condition, accessories, pickup/delivery…"
                  value={form.description}
                  onChange={(e) => set("description", e.target.value)}
                  rows={4}
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Starting bid (LKR)
                  </label>
                  <input
                    className="block w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-gray-900 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0"
                    value={form.startingBid}
                    onChange={(e) => set("startingBid", e.target.value)}
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    End time (your local time)
                  </label>
                  <input
                    className="block w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-gray-900 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    type="datetime-local"
                    value={form.endTime}
                    onChange={(e) => set("endTime", e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Badge (optional)
                  </label>
                  <input
                    className="block w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-gray-900 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g., Featured, New, Hot"
                    value={form.badge}
                    onChange={(e) => set("badge", e.target.value)}
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Image
                  </label>
                  <input
                    className="block w-full text-sm text-gray-700 file:mr-3 file:rounded-lg file:border-0 file:bg-gray-100 file:px-4 file:py-2 file:text-gray-700 hover:file:bg-gray-200"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImage(e.target.files?.[0] ?? null)}
                  />
                  {previewUrl && (
                    <div className="mt-3 rounded-xl border border-gray-200 bg-white p-2">
                      <img
                        src={previewUrl}
                        alt="preview"
                        className="max-h-48 w-auto object-cover rounded-lg"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-1">
                <button
                  type="submit"
                  disabled={busy}
                  className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {busy ? "Creating…" : "Create auction"}
                </button>
              </div>
            </form>
          </div>
        </section>

        {/* My auctions */}
        <section className="mt-10">
          <h2 className="text-lg font-semibold text-gray-900">Your auctions</h2>

          {loadingMine && (
            <ul className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, i) => (
                <li
                  key={i}
                  className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden"
                >
                  <div className="animate-pulse">
                    <div className="aspect-[4/3] bg-gray-200" />
                    <div className="p-4 space-y-3">
                      <div className="h-4 bg-gray-200 rounded w-2/3" />
                      <div className="h-3 bg-gray-200 rounded w-1/2" />
                      <div className="h-8 bg-gray-200 rounded w-24" />
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {mine && mine.length === 0 && (
            <p className="mt-4 text-gray-600">
              You haven’t created any auctions yet.
            </p>
          )}

          {mine && mine.length > 0 && (
            <ul className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
              {mine.map((a) => {
                const src = toImageSrc(a.image) || "/placeholder.png";
                return (
                  <li
                    key={a.id}
                    className="group rounded-2xl overflow-hidden border border-gray-200 bg-white shadow-sm transition hover:shadow-md hover:-translate-y-0.5"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                      {a.badge && (
                        <span className="absolute left-3 top-3 z-10 inline-flex items-center rounded-lg bg-gray-900/80 px-2 py-1 text-xs font-medium text-white backdrop-blur">
                          {a.badge}
                        </span>
                      )}
                      <img
                        src={src}
                        alt={a.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src =
                            "/placeholder.png";
                        }}
                        loading="lazy"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 line-clamp-2">
                        {a.title}
                      </h3>
                      <p className="mt-1 text-sm text-gray-600">Current bid</p>
                      <p className="font-semibold text-gray-900">
                        LKR {a.currentBid.toLocaleString()}
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        Ends {new Date(a.endTime).toLocaleString()}
                      </p>

                      <div className="mt-3 flex gap-3">
                        <button
                          onClick={() => router.push(`/productDetail/${a.id}`)}
                          className="inline-flex items-center justify-center rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-800 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                          View
                        </button>
                        <button
                          onClick={() => onDelete(a.id)}
                          className="inline-flex items-center justify-center rounded-xl border border-red-300 bg-white px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
