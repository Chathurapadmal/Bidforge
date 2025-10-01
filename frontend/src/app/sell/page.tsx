"use client";

import { useEffect, useState } from "react";

type Auction = {
  id: number;
  title: string;
  description?: string | null;
  image?: string | null;
  currentBid?: number | null; 
  endTime?: string | null;
  badge?: string | null;
  createdAt: string;
};

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://localhost:7168";

export default function AdminAuctionsPage() {
  const [items, setItems] = useState<Auction[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [title, setTitle] = useState<string>("");
  const [image, setImage] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [currentBid, setCurrentBid] = useState<string>("");
  const [endTime, setEndTime] = useState<string>("");      
  const [badge, setBadge] = useState<string>("");
  const [description, setDescription] = useState<string>("");

  async function load() {
    try {
      setErr(null);
      setLoading(true);
      const res = await fetch(
        `${API_BASE}/api/auctions?sort=latest&limit=100`,
        { cache: "no-store" }
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

  useEffect(() => { load(); }, []);

  async function uploadImageIfNeeded(): Promise<string | null> {
    if (file) {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch(`${API_BASE}/api/upload`, {
        method: "POST",
        body: form,
      });
      const txt = await res.text();
      if (!res.ok) {
        throw new Error(`Upload failed: ${res.status} ${res.statusText}: ${txt}`);
      }
      const data = JSON.parse(txt);
      return data.url ?? null;
    }
    return image ? image : null;
  }

  async function createAuction(e: React.FormEvent) {
    e.preventDefault();
    try {
      const imageUrl = await uploadImageIfNeeded();

      const res = await fetch(`${API_BASE}/api/auctions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          image: imageUrl,
          currentBid: currentBid === "" ? 0 : Number(currentBid),
          endTime: endTime ? new Date(endTime).toISOString() : null,
          badge: badge || null,
          description: description || null,
        }),
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`${res.status} ${res.statusText}: ${txt}`);
      }

      // reset form and reload
      setTitle("");
      setImage("");
      setFile(null);
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
        body: JSON.stringify({
          title: a.title ?? "",                 // never undefined
          image: a.image ?? null,
          description: a.description ?? null,
          currentBid: a.currentBid ?? 0,        // never undefined
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
      });
      if (!res.ok && res.status !== 204) {
        const txt = await res.text();
        throw new Error(`${res.status} ${res.statusText}: ${txt}`);
      }
      setItems(prev => prev.filter(x => x.id !== id));
    } catch (e: any) {
      alert("Delete failed: " + (e?.message ?? e));
    }
  }

  // safe getters to avoid undefined in controlled inputs
  const safeDateLocal = (iso?: string | null) =>
    iso ? new Date(iso).toISOString().slice(0, 16) : "";

  return (
    <main className="min-h-screen bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold mb-6">Admin · Auctions</h1>

        <form
          onSubmit={createAuction}
          className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 bg-panel-light dark:bg-panel-dark border border-border-light dark:border-border-dark rounded-xl p-4 mb-8"
        >
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">Title</span>
            <input
              className="border border-border-light dark:border-border-dark bg-panel-light dark:bg-panel-dark rounded p-2 focus:outline-none focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark"
              value={title}                 // "" initially → always controlled
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </label>

          {/* Upload file only (URL input removed) */}
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">Upload Image</span>
            <input
              className="border border-border-light dark:border-border-dark bg-panel-light dark:bg-panel-dark rounded p-2 file:mr-3 file:rounded file:border-0 file:px-3 file:py-2 file:bg-secondary-light file:text-white hover:file:opacity-90"
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
            {file && (
              <span className="text-xs text-text-mutedLight dark:text-text-mutedDark mt-1">
                Selected: {file.name}
              </span>
            )}
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">Starting / Current Price</span>
            <input
              className="border border-border-light dark:border-border-dark bg-panel-light dark:bg-panel-dark rounded p-2 focus:outline-none focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark"
              type="number"
              step="0.01"
              value={currentBid}            // "" initially → controlled
              onChange={(e) => setCurrentBid(e.target.value)}
              required
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">Ends At</span>
            <input
              className="border border-border-light dark:border-border-dark bg-panel-light dark:bg-panel-dark rounded p-2 focus:outline-none focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark"
              type="datetime-local"
              value={endTime}               // "" initially → controlled
              onChange={(e) => setEndTime(e.target.value)}
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">Badge</span>
            <input
              className="border border-border-light dark:border-border-dark bg-panel-light dark:bg-panel-dark rounded p-2 focus:outline-none focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark"
              value={badge}                 // "" initially → controlled
              onChange={(e) => setBadge(e.target.value)}
              placeholder="New / Hot / Featured"
            />
          </label>

          <label className="md:col-span-2 lg:col-span-3 flex flex-col gap-1">
            <span className="text-sm font-medium">Description</span>
            <textarea
              className="border border-border-light dark:border-border-dark bg-panel-light dark:bg-panel-dark rounded p-2 focus:outline-none focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark"
              value={description}           // "" initially → controlled
              onChange={(e) => setDescription(e.target.value)}
            />
          </label>

          <div className="md:col-span-2 lg:col-span-3">
            <button
              className="px-4 py-2 rounded bg-primary-light dark:bg-primary-dark text-white hover:opacity-90"
            >
              Create Auction
            </button>
          </div>
        </form>

        {loading ? (
          <p className="text-text-mutedLight dark:text-text-mutedDark">Loading…</p>
        ) : err ? (
          <p className="text-red-600">{err}</p>
        ) : (
          <div className="overflow-auto border border-border-light dark:border-border-dark rounded-xl bg-panel-light dark:bg-panel-dark">
            <table className="min-w-full text-sm">
              <thead className="bg-background-light dark:bg-background-dark">
                <tr className="border-b border-border-light dark:border-border-dark">
                  <th className="p-2 text-left text-text-secondary dark:text-text-mutedDark">ID</th>
                  <th className="p-2 text-left text-text-secondary dark:text-text-mutedDark">Title</th>
                  <th className="p-2 text-left text-text-secondary dark:text-text-mutedDark">Image</th>
                  <th className="p-2 text-left text-text-secondary dark:text-text-mutedDark">Bid</th>
                  <th className="p-2 text-left text-text-secondary dark:text-text-mutedDark">Ends</th>
                  <th className="p-2 text-left text-text-secondary dark:text-text-mutedDark">Badge</th>
                  <th className="p-2 text-left text-text-secondary dark:text-text-mutedDark">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((a) => (
                  <tr key={a.id} className="border-t border-border-light dark:border-border-dark">
                    <td className="p-2">{a.id}</td>

                    <td className="p-2">
                      <input
                        className="border border-border-light dark:border-border-dark bg-panel-light dark:bg-panel-dark rounded p-1 w-56 focus:outline-none focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark"
                        value={a.title ?? ""}  // ✅ never undefined
                        onChange={(e) =>
                          setItems((prev) =>
                            prev.map((x) =>
                              x.id === a.id ? { ...x, title: e.target.value } : x
                            )
                          )
                        }
                      />
                    </td>

                    <td className="p-2">
                      <input
                        className="border border-border-light dark:border-border-dark bg-panel-light dark:bg-panel-dark rounded p-1 w-56 focus:outline-none focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark"
                        value={a.image ?? ""}  // ✅ never undefined
                        onChange={(e) =>
                          setItems((prev) =>
                            prev.map((x) =>
                              x.id === a.id ? { ...x, image: e.target.value } : x
                            )
                          )
                        }
                      />
                    </td>

                    <td className="p-2">
                      <input
                        className="border border-border-light dark:border-border-dark bg-panel-light dark:bg-panel-dark rounded p-1 w-28 focus:outline-none focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark"
                        type="number"
                        step="0.01"
                        value={a.currentBid ?? 0} // ✅ never undefined
                        onChange={(e) =>
                          setItems((prev) =>
                            prev.map((x) =>
                              x.id === a.id
                                ? { ...x, currentBid: e.target.value === "" ? 0 : Number(e.target.value) }
                                : x
                            )
                          )
                        }
                      />
                    </td>

                    <td className="p-2">
                      <input
                        className="border border-border-light dark:border-border-dark bg-panel-light dark:bg-panel-dark rounded p-1 w-56 focus:outline-none focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark"
                        type="datetime-local"
                        value={safeDateLocal(a.endTime)} // ✅ "" or formatted string
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

                    <td className="p-2">
                      <input
                        className="border border-border-light dark:border-border-dark bg-panel-light dark:bg-panel-dark rounded p-1 w-32 focus:outline-none focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark"
                        value={a.badge ?? ""} // ✅ never undefined
                        onChange={(e) =>
                          setItems((prev) =>
                            prev.map((x) =>
                              x.id === a.id ? { ...x, badge: e.target.value } : x
                            )
                          )
                        }
                      />
                    </td>

                    <td className="p-2 space-x-2">
                      <button
                        className="px-3 py-1 rounded bg-primary-light dark:bg-primary-dark text-white hover:opacity-90"
                        onClick={() => saveAuction(a)}
                      >
                        Save
                      </button>
                      <button
                        className="px-3 py-1 rounded bg-secondary-light text-white hover:opacity-90"
                        onClick={() => deleteAuction(a.id)}
                        title="Delete"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}

                {items.length === 0 && (
                  <tr>
                    <td
                      className="p-3 text-center text-text-mutedLight dark:text-text-mutedDark"
                      colSpan={7}
                    >
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
