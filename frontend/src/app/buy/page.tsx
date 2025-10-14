// src/app/buy/page.tsx
"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import BuyFilters, { BuyFilterState } from "../components/filter";

type Auction = {
  id: number;
  title: string;
  description?: string | null;
  image?: string | null;
  currentBid: number;
  endTime?: string | null;
  badge?: string | null;
  createdAt: string;
};

import { API_BASE } from "../../lib/config";
const PLACEHOLDER = "/placeholder.png";

/* ---------- utils ---------- */
function fmtCurrencyLKR(n: number) {
  return n.toLocaleString(undefined, { maximumFractionDigits: 0 });
}
function toImageSrc(img?: string | null): string {
  if (!img) return PLACEHOLDER;
  let s = img.trim();
  if (!s) return PLACEHOLDER;
  try {
    s = decodeURIComponent(s);
  } catch {}
  if (/^https?:\/\//i.test(s)) return s;
  if (s.startsWith("/images/")) return `${API_BASE}${s}`;
  if (s.startsWith("images/")) s = `/${s}`;
  if (!s.startsWith("/images/")) s = `/images/${encodeURIComponent(s)}`;
  return `${API_BASE}${s}`;
}
function useCountdown(endIso?: string | null) {
  const end = useMemo(
    () => (endIso ? new Date(endIso).getTime() : 0),
    [endIso]
  );
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  if (!endIso) return { isOver: false, label: undefined as string | undefined };
  const diff = Math.max(end - now, 0);
  const s = Math.floor(diff / 1000);
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const isOver = diff <= 0;
  const label = isOver
    ? "Ended"
    : `${d > 0 ? `${d}d ` : ""}${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  return { isOver, label };
}

/* ---------- card ---------- */
function AuctionCard({ a }: { a: Auction }) {
  const { isOver, label } = useCountdown(a.endTime);
  const imgSrc = useMemo(() => toImageSrc(a.image), [a.image]);

  return (
    <article className="group rounded-2xl overflow-hidden border border-gray-200 bg-white shadow-sm hover:shadow-md transition">
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
        {label && (
          <span
            className={`absolute right-3 bottom-3 rounded-md text-white text-xs px-2 py-1 ${isOver ? "bg-gray-700" : "bg-indigo-600"}`}
          >
            ⏱ {label}
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
              LKR {fmtCurrencyLKR(a.currentBid)}
            </p>
          </div>
          <Link
            href={`/productDetail/${a.id}`}
            className={`inline-flex items-center justify-center rounded-lg px-3 py-2 text-sm font-medium text-white hover:opacity-90 ${
              isOver ? "bg-gray-400 cursor-not-allowed" : "bg-indigo-600"
            }`}
            aria-disabled={isOver}
            onClick={(e) => {
              if (isOver) e.preventDefault();
            }}
          >
            {isOver ? "Closed" : "Place Order"}
          </Link>
        </div>
      </div>
    </article>
  );
}

/* ---------- page ---------- */
export default function BuyPage() {
  const [items, setItems] = useState<Auction[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  // filter state
  const [filters, setFilters] = useState<BuyFilterState>({
    q: "",
    min: "",
    max: "",
    status: "all",
    badge: "",
    sort: "latest",
  });

  // toggle panel
  const [showFilters, setShowFilters] = useState(false);

  // fetch from backend whenever filters change (debounced by BuyFilters itself)
  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      try {
        setErr(null);
        setLoading(true);

        const sp = new URLSearchParams();
        if (filters.q) sp.set("q", filters.q);
        if (filters.min) sp.set("min", filters.min);
        if (filters.max) sp.set("max", filters.max);
        if (filters.badge) sp.set("badge", filters.badge);
        if (filters.status && filters.status !== "all")
          sp.set("status", filters.status);
        if (filters.sort) sp.set("sort", filters.sort);
        sp.set("limit", "100");

        const url = `${API_BASE}/api/auctions?${sp.toString()}`;
        const res = await fetch(url, {
          cache: "no-store",
          signal: controller.signal,
        });
        if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
        const data = await res.json();
        setItems(data.items ?? []);
      } catch (e: any) {
        if (e.name !== "AbortError")
          setErr(e.message ?? "Failed to load auctions");
      } finally {
        setLoading(false);
      }
    })();
    return () => controller.abort();
  }, [filters]);

  return (
    <main className="min-h-screen bg-white text-gray-900">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">Buy Products</h1>
            <p className="text-sm text-gray-500">
              Find your next win on Bidforge.
            </p>
          </div>

          {/* Filter toggle button */}
          <button
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium hover:bg-gray-50"
            onClick={() => setShowFilters((s) => !s)}
          >
            <span>Filters</span>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              className={`${showFilters ? "rotate-180" : ""} transition`}
            >
              <path fill="currentColor" d="M7 10l5 5 5-5z" />
            </svg>
          </button>
        </div>

        {/* Collapsible panel */}
        <div
          className={`transition-[max-height,opacity] overflow-hidden ${showFilters ? "max-h-[700px] opacity-100" : "max-h-0 opacity-0"}`}
          aria-hidden={!showFilters}
        >
          <BuyFilters onChange={setFilters} />
        </div>

        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-gray-500">
            {items.length > 0 ? `Showing ${items.length} items` : " "}
          </span>
        </div>

        {err && (
          <div className="mb-6 rounded-lg border border-red-300 bg-red-50 p-4 text-sm text-red-800">
            {err}
          </div>
        )}

        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 12 }).map((_, i) => (
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
        ) : items.length === 0 ? (
          <div className="text-center text-gray-500 py-10 border border-gray-200 rounded-xl bg-white">
            No products match your filters.
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {items.map((a) => (
              <AuctionCard key={a.id} a={a} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
