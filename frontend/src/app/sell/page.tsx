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

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setInfo(null);

    // quick checks
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

      // with Authorization header (apiFetchForm does it)
      const res = await apiFetchForm<{ id: number }>("/api/auctions", fd, {
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

      // reload mine
      await loadMine();

      // optional: redirect to detail
      // router.push(`/productDetail/${res.id}`);
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
      <main className="max-w-3xl mx-auto p-6">Checking authentication…</main>
    );
  }

  return (
    <main className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold">Sell</h1>

      {err && <p className="mt-4 text-red-600 whitespace-pre-wrap">{err}</p>}
      {info && <p className="mt-4 text-green-600">{info}</p>}

      {/* Create form */}
      <form onSubmit={onSubmit} className="mt-6 grid gap-4 max-w-3xl">
        <input
          className="border p-2 rounded text-black"
          placeholder="Title"
          value={form.title}
          onChange={(e) => set("title", e.target.value)}
          required
        />

        <textarea
          className="border p-2 rounded text-black"
          placeholder="Description"
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
          rows={4}
        />

        <input
          className="border p-2 rounded text-black"
          type="number"
          min="0"
          step="0.01"
          placeholder="Starting bid (LKR)"
          value={form.startingBid}
          onChange={(e) => set("startingBid", e.target.value)}
        />

        <label className="text-sm text-gray-600">
          End time (your local time)
          <input
            className="border p-2 rounded w-full mt-1 text-black"
            type="datetime-local"
            value={form.endTime}
            onChange={(e) => set("endTime", e.target.value)}
            required
          />
        </label>

        <input
          className="border p-2 rounded text-black"
          placeholder="Badge (optional)"
          value={form.badge}
          onChange={(e) => set("badge", e.target.value)}
        />

        <input
          className="border p-2 rounded"
          type="file"
          accept="image/*"
          onChange={(e) => setImage(e.target.files?.[0] ?? null)}
        />

        <button
          type="submit"
          disabled={busy}
          className="px-4 py-2 rounded bg-indigo-600 text-white disabled:opacity-60"
        >
          {busy ? "Creating…" : "Create"}
        </button>
      </form>

      {/* My auctions */}
      <section className="mt-10">
        <h2 className="text-xl font-semibold">Your Auctions</h2>
        {loadingMine && (
          <p className="mt-4 text-gray-600">Loading your auctions…</p>
        )}
        {mine && mine.length === 0 && (
          <p className="mt-4 text-gray-600">
            You haven’t created any auctions yet.
          </p>
        )}

        {mine && mine.length > 0 && (
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {mine.map((a) => {
              const src = toImageSrc(a.image);
              return (
                <article
                  key={a.id}
                  className="rounded-xl overflow-hidden border bg-white"
                >
                  <div className="aspect-[4/3] overflow-hidden bg-gray-100">
                    <img
                      src={src}
                      alt={a.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src =
                          "/placeholder.png";
                      }}
                      loading="lazy"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold line-clamp-2">{a.title}</h3>
                    <p className="mt-1 text-sm text-gray-600">Current bid</p>
                    <p className="font-semibold">
                      LKR {a.currentBid.toLocaleString()}
                    </p>
                    <div className="mt-3 flex gap-3">
                      <button
                        onClick={() => onDelete(a.id)}
                        className="px-3 py-1 border rounded text-red-600 border-red-300 hover:bg-red-50"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
