// app/admin/auctions/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";


type Auction = {
  id: number;
  title: string;
  description?: string | null;
  image?: string | null; // absolute URL from API on reads
  currentBid?: number | null;
  endTime?: string | null; // ISO string
  badge?: string | null;
  createdAt: string; // ISO string
};

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://localhost:7168";

export default function AdminAuctionsPage() {
  const [items, setItems] = useState<Auction[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  // create form state
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [currentBid, setCurrentBid] = useState("");
  const [endTime, setEndTime] = useState("");
  const [badge, setBadge] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    load();
    // revoke preview on unmount
    return () => {
      if (filePreview) URL.revokeObjectURL(filePreview);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function load() {
    try {
      setErr(null);
      setLoading(true);
      const res = await fetch(
        `${API_BASE}/api/auctions?sort=latest&limit=100`,
        {
          cache: "no-store",
          credentials: "include",
        }
      );
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      const data = await res.json();
      setItems(Array.isArray(data.items) ? data.items : []);
    } catch (e: any) {
      setErr(e?.message ?? "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  // ---- helpers ----
  const safeDateLocal = (iso?: string | null) =>
    iso ? new Date(iso).toISOString().slice(0, 16) : "";

  const fmtMoney = useMemo(
    () =>
      new Intl.NumberFormat(undefined, {
        style: "currency",
        currency: "LKR",
        maximumFractionDigits: 2,
      }),
    []
  );

  async function uploadImageIfNeeded(): Promise<string | null> {
    if (!file) return null;

    const form = new FormData();
    form.append("file", file);

    const res = await fetch(`${API_BASE}/api/upload`, {
      method: "POST",
      body: form,
      credentials: "include",
    });

    const data = await res.json().catch(async () => {
      const txt = await res.text();
      throw new Error(`Upload failed: ${res.status} ${res.statusText}: ${txt}`);
    });

    if (!res.ok) {
      throw new Error(
        `Upload failed: ${res.status} ${res.statusText}: ${JSON.stringify(data)}`
      );
    }

    // server returns { url, fileName }
    const fileName =
      data?.fileName ??
      (typeof data?.url === "string"
        ? decodeURIComponent(new URL(data.url).pathname.split("/").pop() || "")
        : "");

    if (!fileName)
      throw new Error("Upload succeeded but no filename returned.");
    return fileName; // IMPORTANT: filename only (e.g., IMG_123.webp)
  }

  async function createAuction(e: React.FormEvent) {
    e.preventDefault();
    try {
      // upload first (returns filename)
      const imageFileName = await uploadImageIfNeeded();

      const payload = {
        title,
        image: imageFileName, // filename only (backend sanitizes anyway)
        currentBid: currentBid === "" ? 0 : Number(currentBid),
        endTime: endTime ? new Date(endTime).toISOString() : null,
        badge: badge || null,
        description: description || null,
      };

      const res = await fetch(`${API_BASE}/api/auctions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`${res.status} ${res.statusText}: ${txt}`);
      }

      // reset form + reload
      setTitle("");
      setFile(null);
      if (filePreview) URL.revokeObjectURL(filePreview);
      setFilePreview(null);
      setCurrentBid("");
      setEndTime("");
      setBadge("");
      setDescription("");
      await load();
    } catch (e: any) {
      alert("Create failed: " + (e?.message ?? e));
    }
  }

  async function saveAuction(a: Auction) {
    try {
      const res = await fetch(`${API_BASE}/api/auctions/${a.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title: a.title ?? "",
          image: a.image ?? null, // on edit, allow keeping existing
          description: a.description ?? null,
          currentBid: a.currentBid ?? 0,
          endTime: a.endTime ?? null,
          badge: a.badge ?? null,
        }),
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`${res.status} ${res.statusText}: ${txt}`);
      }
      await load();
    } catch (e: any) {
      alert("Update failed: " + (e?.message ?? e));
    }
  }

  async function deleteAuction(id: number) {
    if (!confirm("Delete this auction?")) return;
    try {
      const res = await fetch(`${API_BASE}/api/auctions/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok && res.status !== 204) {
        const txt = await res.text();
        throw new Error(`${res.status} ${res.statusText}: ${txt}`);
      }
      setItems((prev) => prev.filter((x) => x.id !== id));
    } catch (e: any) {
      alert("Delete failed: " + (e?.message ?? e));
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-gray-100">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold mb-6">Admin · Auctions</h1>

        {/* CREATE FORM */}
        <form
          onSubmit={createAuction}
          className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 bg-white dark:bg-gray-900 border border-gray-200/60 dark:border-gray-800 rounded-xl p-4 mb-8"
        >
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">Title</span>
            <input
              className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">Upload Image</span>
            <input
              className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 rounded p-2 file:mr-3 file:rounded file:border-0 file:px-3 file:py-2 file:bg-blue-600 file:text-white hover:file:opacity-90"
              type="file"
              accept="image/*"
              onChange={(e) => {
                const f = e.target.files?.[0] ?? null;
                setFile(f);
                if (filePreview) URL.revokeObjectURL(filePreview);
                setFilePreview(f ? URL.createObjectURL(f) : null);
              }}
            />
            {filePreview && (
              <img
                src={filePreview}
                alt="preview"
                className="mt-2 h-24 w-24 object-cover rounded border border-gray-200 dark:border-gray-800"
              />
            )}
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">
              Starting / Current Price
            </span>
            <input
              className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              type="number"
              step="0.01"
              value={currentBid}
              onChange={(e) => setCurrentBid(e.target.value)}
              required
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">Ends At</span>
            <input
              className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              type="datetime-local"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">Badge</span>
            <input
              className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={badge}
              onChange={(e) => setBadge(e.target.value)}
              placeholder="New / Hot / Featured"
            />
          </label>

          <label className="md:col-span-2 lg:col-span-3 flex flex-col gap-1">
            <span className="text-sm font-medium">Description</span>
            <textarea
              className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </label>

          <div className="md:col-span-2 lg:col-span-3">
            <button
              className="px-4 py-2 rounded bg-blue-600 text-white hover:opacity-90"
              type="submit"
            >
              Create Auction
            </button>
          </div>
        </form>

        {/* TABLE */}
        {loading ? (
          <p className="text-gray-500">Loading…</p>
        ) : err ? (
          <p className="text-red-600">{err}</p>
        ) : (
          <div className="overflow-auto border border-gray-200/60 dark:border-gray-800 rounded-xl bg-white dark:bg-gray-900">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800/50">
                <tr className="border-b border-gray-200/60 dark:border-gray-800">
                  <th className="p-2 text-left">ID</th>
                  <th className="p-2 text-left">Image</th>
                  <th className="p-2 text-left">Title</th>
                  <th className="p-2 text-left">Bid</th>
                  <th className="p-2 text-left">Ends</th>
                  <th className="p-2 text-left">Badge</th>
                  <th className="p-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((a) => (
                  <tr
                    key={a.id}
                    className="border-t border-gray-200/60 dark:border-gray-800"
                  >
                    <td className="p-2 align-top">{a.id}</td>

                    <td className="p-2 align-top">
                      {a.image ? (
                        <img
                          src={a.image}
                          alt={a.title}
                          className="h-16 w-16 object-cover rounded border border-gray-200 dark:border-gray-800"
                        />
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>

                    <td className="p-2 align-top">
                      <input
                        className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 rounded p-1 w-56 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={a.title ?? ""}
                        onChange={(e) =>
                          setItems((prev) =>
                            prev.map((x) =>
                              x.id === a.id
                                ? { ...x, title: e.target.value }
                                : x
                            )
                          )
                        }
                      />
                      <textarea
                        className="mt-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 rounded p-1 w-56 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Description"
                        value={a.description ?? ""}
                        onChange={(e) =>
                          setItems((prev) =>
                            prev.map((x) =>
                              x.id === a.id
                                ? { ...x, description: e.target.value }
                                : x
                            )
                          )
                        }
                      />
                    </td>

                    <td className="p-2 align-top">
                      <input
                        className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 rounded p-1 w-28 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        type="number"
                        step="0.01"
                        value={a.currentBid ?? 0}
                        onChange={(e) =>
                          setItems((prev) =>
                            prev.map((x) =>
                              x.id === a.id
                                ? {
                                  ...x,
                                  currentBid:
                                    e.target.value === ""
                                      ? 0
                                      : Number(e.target.value),
                                }
                                : x
                            )
                          )
                        }
                      />
                      <div className="text-xs text-gray-500 mt-1">
                        {a.currentBid != null
                          ? fmtMoney.format(a.currentBid)
                          : "—"}
                      </div>
                    </td>

                    <td className="p-2 align-top">
                      <input
                        className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 rounded p-1 w-56 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        type="datetime-local"
                        value={safeDateLocal(a.endTime)}
                        onChange={(e) => {
                          const iso = e.target.value
                            ? new Date(e.target.value).toISOString()
                            : null;
                          setItems((prev) =>
                            prev.map((x) =>
                              x.id === a.id ? { ...x, endTime: iso } : x
                            )
                          );
                        }}
                      />
                    </td>

                    <td className="p-2 align-top">
                      <input
                        className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 rounded p-1 w-32 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={a.badge ?? ""}
                        onChange={(e) =>
                          setItems((prev) =>
                            prev.map((x) =>
                              x.id === a.id
                                ? { ...x, badge: e.target.value }
                                : x
                            )
                          )
                        }
                      />
                    </td>

                    <td className="p-2 align-top space-x-2">
                      <button
                        className="px-3 py-1 rounded bg-blue-600 text-white hover:opacity-90"
                        onClick={() => saveAuction(a)}
                      >
                        Save
                      </button>
                      <button
                        className="px-3 py-1 rounded bg-red-600 text-white hover:opacity-90"
                        onClick={() => deleteAuction(a.id)}
                        title="Delete"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}

                {items.length === 0 && !loading && (
                  <tr>
                    <td className="p-3 text-center text-gray-500" colSpan={7}>
                      No auctions yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
