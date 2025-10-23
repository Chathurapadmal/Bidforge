// src/app/buy/page.tsx
"use client";

import useSWR from "swr";
import Link from "next/link";
import { API_BASE, toImageSrc } from "../../lib/Config";

type AuctionCard = {
  id: number;
  title: string;
  description?: string | null;
  image?: string | null;
  images?: string[] | null;
  currentBid: number;
  endTime?: string | null;
  badge?: string | null;
  createdAt?: string;
};

type AuctionsResponse = { items: AuctionCard[] };

const fetcher = async (url: string) => {
  const res = await fetch(url, {
    headers: { Accept: "application/json" },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
};

// Lightweight countdown badge
function TimeLeft({ end }: { end?: string | null }) {
  if (!end) return null;

  const endTs = new Date(end).getTime();

  // avoid hydration mismatch by computing after mount
  // we don't need per-second updates for list view; show relative label
  const now = Date.now();
  const ms = endTs - now;
  if (Number.isNaN(endTs)) return null;

  const label =
    ms <= 0
      ? "Ended"
      : ms < 60_000
        ? "Ending soon"
        : ms < 3_600_000
          ? `${Math.floor(ms / 60_000)}m left`
          : ms < 86_400_000
            ? `${Math.floor(ms / 3_600_000)}h left`
            : `${Math.floor(ms / 86_400_000)}d left`;

  const ended = ms <= 0;

  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
        ended
          ? "bg-gray-100 text-gray-600 border border-gray-200"
          : "bg-indigo-50 text-indigo-700 border border-indigo-200"
      }`}
    >
      {label}
    </span>
  );
}

export default function BuyPage() {
  const { data, error, isLoading, mutate } = useSWR<AuctionsResponse>(
    `${API_BASE || ""}/api/auctions?sort=newest&limit=100`,
    fetcher
  );

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto p-6">
          <h1 className="text-3xl font-semibold text-center text-gray-900">
            Latest Auctions
          </h1>
          <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <li
                key={i}
                className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden"
              >
                <div className="animate-pulse">
                  <div className="w-full aspect-[4/3] bg-gray-200" />
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-2/3" />
                    <div className="h-3 bg-gray-200 rounded w-5/6" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                    <div className="h-8 bg-gray-200 rounded w-24" />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto p-6 text-center">
          <h1 className="text-3xl font-semibold text-gray-900">
            Latest Auctions
          </h1>
          <div className="mt-6 inline-flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            Failed to load auctions.
            <button
              onClick={() => mutate()}
              className="rounded-lg border border-red-300 bg-white/60 px-3 py-1 text-red-700 hover:bg-white"
            >
              Retry
            </button>
          </div>
        </div>
      </main>
    );
  }

  const items = data?.items ?? [];

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-3xl font-semibold text-center text-gray-900">
          Latest Auctions
        </h1>

        {items.length === 0 ? (
          <p className="mt-6 text-gray-500 text-center italic">
            No auctions available yet.
          </p>
        ) : (
          <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((a) => {
              const imgSrc = toImageSrc(a.image) || "/placeholder.png";
              const badge = a.badge?.trim();
              return (
                <li
                  key={a.id}
                  className="group rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden transition hover:shadow-md hover:-translate-y-0.5"
                >
                  <Link
                    href={`/productDetail/${a.id}`}
                    className="block focus:outline-none"
                  >
                    <div className="relative w-full aspect-[4/3] bg-gray-100 overflow-hidden">
                      {badge && (
                        <span className="absolute left-3 top-3 z-10 inline-flex items-center rounded-lg bg-gray-900/80 px-2 py-1 text-xs font-medium text-white backdrop-blur">
                          {badge}
                        </span>
                      )}
                      <img
                        src={imgSrc}
                        alt={a.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src =
                            "/placeholder.png";
                        }}
                      />
                    </div>

                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 line-clamp-1 group-hover:text-indigo-700">
                        {a.title}
                      </h3>
                      <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                        {a.description || "—"}
                      </p>

                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-700">Current</span>
                          <span className="rounded-md border border-indigo-200 bg-indigo-50 px-2 py-0.5 text-sm font-semibold text-indigo-700">
                            {formatLKR(a.currentBid)}
                          </span>
                        </div>
                        <TimeLeft end={a.endTime} />
                      </div>

                      {a.endTime && (
                        <div className="mt-1 text-xs text-gray-400">
                          Ends {new Date(a.endTime).toLocaleString()}
                        </div>
                      )}
                    </div>
                  </Link>

                  <div className="p-4 pt-0">
                    <Link
                      href={`/productDetail/${a.id}`}
                      className="inline-flex items-center rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      More details
                    </Link>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </main>
  );
}

function formatLKR(n: number) {
  try {
    return new Intl.NumberFormat("en-LK", {
      style: "currency",
      currency: "LKR",
      maximumFractionDigits: 0,
    }).format(n);
  } catch {
    return `LKR ${Math.round(n).toLocaleString()}`;
  }
}
