// src/app/auctions/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { API_BASE, toImageSrc } from "../../lib/Config";

type Auction = { id: number; title: string; currentBid: number; endTime?: string | null; image?: string | null; badge?: string | null; };
type ListResp = { page: number; pageSize: number; total: number; items: Auction[] };
const PLACEHOLDER = "/placeholder.png";

export default function AuctionsPage() {
  const [data, setData] = useState<ListResp | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  async function load(p = 1) {
    setLoading(true); setErr(null);
    try {
      // If you enabled the /api rewrite above, you can also use fetch(`/api/auctions?...`)
      const res = await fetch(`${API_BASE || ""}/api/auctions?sort=endingSoon&limit=12&page=${p}`, { cache: "no-store" });
      if (!res.ok) throw new Error(`Auctions fetch failed (${res.status})`);
      const j = (await res.json()) as ListResp;
      setData(j); setPage(j.page ?? p);
    } catch (e: any) {
      setErr(e?.message ?? "Failed to load auctions");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(1); }, []);

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1;

  return (
    <main className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold">Auctions</h1>
      {err && <p className="mt-4 text-red-600 break-words">{err}</p>}
      {loading && <p className="mt-4 text-gray-600">Loading…</p>}
      {!loading && data && (
        <>
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {data.items.map((a) => {
              const src = toImageSrc(a.image) || PLACEHOLDER; // returns '/uploads/...'
              return (
                <article key={a.id} className="rounded-xl overflow-hidden border bg-white">
                  <div className="relative aspect-[4/3] bg-gray-100">
                    <Image
                      src={src}
                      alt={a.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold line-clamp-2">{a.title}</h3>
                    <p className="mt-1 text-sm text-gray-600">Current bid</p>
                    <p className="font-semibold">LKR {a.currentBid.toLocaleString()}</p>
                    <div className="mt-3">
                      <Link className="text-indigo-600 hover:underline" href={`/productDetail/${a.id}`}>
                        View
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          <div className="flex items-center gap-3 mt-6">
            <button disabled={page <= 1} onClick={() => load(page - 1)} className="px-3 py-1 border rounded disabled:opacity-50">Prev</button>
            <span className="text-sm text-gray-600">Page {page} of {totalPages}</span>
            <button disabled={page >= totalPages} onClick={() => load(page + 1)} className="px-3 py-1 border rounded disabled:opacity-50">Next</button>
          </div>
        </>
      )}
    </main>
  );
}
