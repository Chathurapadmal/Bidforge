"use client";

import { useEffect, useMemo, useState } from "react";

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

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://localhost:7168";

/* ---------- utils ---------- */
function fmtCurrencyLKR(n: number) {
  return n.toLocaleString(undefined, { maximumFractionDigits: 0 });
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
    : `${d > 0 ? `${d}d ` : ""}${String(h).padStart(2, "0")}:${String(
        m
      ).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;

  return { isOver, label };
}

/* ---------- card component (hooks live here, not inside a loop) ---------- */
function AuctionCard({ a }: { a: Auction }) {
  const { isOver, label } = useCountdown(a.endTime);

  return (
    <article className="group rounded-2xl overflow-hidden border border-border-light dark:border-border-dark bg-panel-light dark:bg-panel-dark shadow-sm hover:shadow-md transition">
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={a.image ?? "/placeholder.png"}
          alt={a.title}
          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        {a.badge && (
          <span className="absolute left-3 top-3 rounded-full bg-secondary-light text-white text-xs font-medium px-2 py-0.5">
            {a.badge}
          </span>
        )}
        {label && (
          <span
            className={`absolute right-3 bottom-3 rounded-md text-white text-xs px-2 py-1 ${
              isOver ? "bg-gray-700" : "bg-secondary-light"
            }`}
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
            <p className="text-xs text-text-mutedLight dark:text-text-mutedDark">
              Current bid
            </p>
            <p className="text-base font-semibold">
              LKR {fmtCurrencyLKR(a.currentBid)}
            </p>
          </div>

          <a
            href={`/auctions/${a.id}`}
            className={`inline-flex items-center justify-center rounded-lg px-3 py-2 text-sm font-medium text-white hover:opacity-90 ${
              isOver ? "bg-gray-400 cursor-not-allowed" : "bg-primary-light"
            }`}
            aria-disabled={isOver}
          >
            {isOver ? "Closed" : "Place Bid"}
          </a>
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

  useEffect(() => {
    (async () => {
      try {
        setErr(null);
        setLoading(true);
        const res = await fetch(
          `${API_BASE}/api/auctions?sort=latest&limit=100`,
          { cache: "no-store" }
        );
        if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
        const data = await res.json();
        setItems(data.items ?? []);
      } catch (e: any) {
        setErr(e.message ?? "Failed to load auctions");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <main className="min-h-screen bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex items-end justify-between mb-6">
          <h1 className="text-2xl font-bold">Buy Products</h1>
          <span className="text-sm text-text-mutedLight dark:text-text-mutedDark">
            {items.length > 0 && `Showing ${items.length} items`}
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
                className="animate-pulse rounded-2xl overflow-hidden border border-border-light dark:border-border-dark bg-panel-light dark:bg-panel-dark"
              >
                <div className="aspect-[4/3] bg-background-light/70 dark:bg-background-dark/40" />
                <div className="p-4 space-y-3">
                  <div className="h-4 w-3/4 bg-background-light/70 dark:bg-background-dark/40 rounded" />
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <div className="h-3 w-20 bg-background-light/70 dark:bg-background-dark/40 rounded" />
                      <div className="h-4 w-24 bg-background-light/70 dark:bg-background-dark/40 rounded" />
                    </div>
                    <div className="h-9 w-24 bg-background-light/70 dark:bg-background-dark/40 rounded-lg" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center text-text-mutedLight dark:text-text-mutedDark py-10 border border-border-light dark:border-border-dark rounded-xl bg-panel-light dark:bg-panel-dark">
            No products found.
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
