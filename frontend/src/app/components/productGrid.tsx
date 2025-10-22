// src/app/components/productgrid.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { API_BASE } from "../../lib/Config";

type Auction = {
  id: number;
  title: string;
  description?: string | null;
  image?: string | null; // legacy single filename or absolute
  images?: string[] | null; // optional multiple filenames
  currentBid?: number | null;
  endTime?: string | null; // ISO
  badge?: string | null;
  createdAt: string; // ISO
};

const PLACEHOLDER = "/placeholder.png";

/** Normalize anything → absolute URL */
function toImageSrc(img?: string | null): string {
  if (!img) return PLACEHOLDER;
  let s = img.trim();
  if (!s) return PLACEHOLDER;
  try {
    s = decodeURIComponent(s);
  } catch {}
  if (/^https?:\/\//i.test(s)) return s;
  if (s.startsWith("images/")) s = `/${s}`;
  if (s.startsWith("/images/")) return `${API_BASE}${s}`;
  return `${API_BASE}/images/${encodeURIComponent(s)}`;
}

function fmtCurrencyLKR(n: number) {
  return n.toLocaleString(undefined, { maximumFractionDigits: 0 });
}

export default function ProductGrid() {
  const [items, setItems] = useState<Auction[]>([]);
  const [visible, setVisible] = useState(5); // 5 per "page"
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    const c = new AbortController();
    (async () => {
      try {
        setErr(null);
        setLoading(true);
        const url = `${API_BASE}/api/auctions?sort=latest&limit=10`;
        const res = await fetch(url, { cache: "no-store", signal: c.signal });
        if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
        const data = await res.json();
        setItems(Array.isArray(data.items) ? data.items : []);
      } catch (e: any) {
        if (e.name !== "AbortError") setErr(e?.message ?? "Failed to load");
      } finally {
        setLoading(false);
      }
    })();
    return () => c.abort();
  }, []);

  const canShowMore = useMemo(
    () => visible < Math.min(items.length, 10),
    [visible, items.length]
  );
  const slice = useMemo(
    () => items.slice(0, Math.min(visible, 10)),
    [items, visible]
  );

  return (
    <section className="w-full">
      {err && (
        <div className="mb-4 rounded border border-red-300 bg-red-50 p-3 text-sm text-red-800">
          {err}
        </div>
      )}

      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="animate-pulse rounded-2xl overflow-hidden border border-gray-200 bg-white"
            >
              <div className="aspect-[4/3] bg-gray-100" />
              <div className="p-4 space-y-3">
                <div className="h-4 w-3/4 bg-gray-100 rounded" />
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="h-3 w-20 bg-gray-100 rounded" />
                    <div className="h-4 w-24 bg-gray-100 rounded" />
                  </div>
                  <div className="h-9 w-24 bg-gray-100 rounded-lg" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : slice.length === 0 ? (
        <div className="text-center text-gray-500 py-8 border border-gray-200 rounded-xl bg-white">
          No products available yet.
        </div>
      ) : (
        <>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {slice.map((a) => {
              const imgs =
                a.images && a.images.length > 0
                  ? a.images
                  : a.image
                    ? [a.image]
                    : [];
              const cover = imgs[0];
              const imgSrc = toImageSrc(cover);
              return (
                <article
                  key={a.id}
                  className="group rounded-2xl overflow-hidden border border-gray-200 bg-white shadow-sm hover:shadow-md transition"
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img
                      src={imgSrc}
                      alt={a.title}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = PLACEHOLDER;
                      }}
                    />
                    {a.badge && (
                      <span className="absolute left-3 top-3 rounded-full bg-fuchsia-500 text-white text-xs font-medium px-2 py-0.5">
                        {a.badge}
                      </span>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="line-clamp-2 text-sm font-semibold min-h-[2.5rem]">
                      {a.title}
                    </h3>
                    <div className="mt-2 flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-600">Current bid</p>
                        <p className="text-base font-semibold">
                          {a.currentBid != null
                            ? `LKR ${fmtCurrencyLKR(a.currentBid)}`
                            : "—"}
                        </p>
                      </div>
                      <Link
                        href={`/productDetail/${a.id}`}
                        className="inline-flex items-center justify-center rounded-lg px-3 py-2 text-sm font-medium text-white bg-indigo-600 hover:opacity-90"
                      >
                        View
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          <div className="mt-6 flex justify-center">
            <button
              className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
              onClick={() => setVisible((v) => Math.min(v + 5, 10))}
              disabled={!canShowMore}
            >
              {canShowMore ? "Show more" : "No more items"}
            </button>
          </div>
        </>
      )}
    </section>
  );
}
