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

export default function BuyPage() {
  const { data, error, isLoading } = useSWR<AuctionsResponse>(
    `${API_BASE}/api/auctions?sort=newest&limit=100`,
    fetcher
  );

  if (isLoading) {
    return (
      <main className="max-w-6xl mx-auto p-6 text-center">
        <h1 className="text-3xl font-semibold mb-4 text-indigo-700">Auctions</h1>
        <p className="text-gray-500 animate-pulse">Loading…</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="max-w-6xl mx-auto p-6 text-center">
        <h1 className="text-3xl font-semibold mb-4 text-indigo-700">Auctions</h1>
        <p className="text-red-600 text-sm bg-red-50 p-3 rounded-lg inline-block">
          Failed to load auctions.
        </p>
      </main>
    );
  }

  const items = data?.items ?? [];

  return (
    <main className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-indigo-600 to-blue-400 bg-clip-text text-transparent">
        Latest Auctions
      </h1>

      {items.length === 0 ? (
        <p className="text-gray-500 text-center italic">No auctions available yet.</p>
      ) : (
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((a) => {
            const imgSrc = toImageSrc(a.image) || "/placeholder.png";
            return (
              <li
                key={a.id}
                className="border rounded-2xl overflow-hidden bg-white shadow-md hover:shadow-lg transition-all duration-200 hover:-translate-y-1"
              >
                <Link href={`/productDetail/${a.id}`} className="block group">
                  <div className="w-full aspect-[4/3] bg-gray-100 overflow-hidden">
                    <img
                      src={imgSrc}
                      alt={a.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = "/placeholder.png";
                      }}
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-800 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                      {a.title}
                    </h3>
                    <p className="text-sm text-gray-500 line-clamp-2 mt-1">
                      {a.description || "—"}
                    </p>
                    <div className="mt-3 flex items-center justify-between text-sm">
                      <span className="font-medium text-gray-700">
                        Current:
                      </span>
                      <span className="text-indigo-600 font-semibold">
                        {formatLKR(a.currentBid)}
                      </span>
                    </div>
                    {a.endTime && (
                      <div className="text-xs text-gray-400 mt-1">
                        Ends {new Date(a.endTime).toLocaleString()}
                      </div>
                    )}
                  </div>
                </Link>

                <div className="p-4 pt-0">
                  <Link
                    href={`/productDetail/${a.id}`}
                    className="inline-block mt-2 px-4 py-1.5 rounded-full border border-indigo-300 text-indigo-600 hover:bg-indigo-50 hover:shadow-sm transition text-sm font-medium"
                  >
                    More Details
                  </Link>
                </div>
              </li>
            );
          })}
        </ul>
      )}
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
