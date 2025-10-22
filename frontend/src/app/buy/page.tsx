// src/app/buy/page.tsx
"use client";

import useSWR from "swr";
import Link from "next/link";
import { API_BASE, toImageSrc } from "../../lib/Config"; // <= lowercase + helper

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
    // backend expects "newest" (not "latest")
    `${API_BASE}/api/auctions?sort=newest&limit=100`,
    fetcher
  );

  if (isLoading) {
    return (
      <main className="max-w-6xl mx-auto p-4">
        <h1 className="text-2xl font-semibold mb-4">Auctions</h1>
        <p className="text-gray-500">Loading…</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="max-w-6xl mx-auto p-4">
        <h1 className="text-2xl font-semibold mb-4">Auctions</h1>
        <p className="text-red-600 text-sm">Failed to load auctions.</p>
      </main>
    );
  }

  const items = data?.items ?? [];

  return (
    <main className="max-w-6xl mx-auto p-4">
      <h1 className="text-2xl font-semibold mb-4">Auctions</h1>

      {items.length === 0 ? (
        <p className="text-gray-500">No auctions yet.</p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((a) => {
            const imgSrc = toImageSrc(a.image) || "/placeholder.png";
            return (
              <li
                key={a.id}
                className="border rounded-xl overflow-hidden bg-white shadow-sm hover:shadow transition"
              >
                {/* Clickable image/title area goes to details too */}
                <Link href={`/productDetail/${a.id}`} className="block">
                  <div className="w-full aspect-[4/3] bg-gray-100 overflow-hidden">
                    {/* using <img> avoids Next/Image domain config issues */}
                    <img
                      src={imgSrc}
                      alt={a.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src =
                          "/placeholder.png";
                      }}
                    />
                  </div>
                  <div className="p-3">
                    <h3 className="font-semibold line-clamp-1">{a.title}</h3>
                    <p className="text-sm text-gray-500 line-clamp-2">
                      {a.description || "—"}
                    </p>
                    <div className="mt-2 text-sm">
                      <span className="font-medium">Current:</span>{" "}
                      {formatLKR(a.currentBid)}
                    </div>
                    {a.endTime && (
                      <div className="text-xs text-gray-500">
                        Ends {new Date(a.endTime).toLocaleString()}
                      </div>
                    )}
                  </div>
                </Link>

                {/* Explicit More Details button */}
                <div className="p-3 pt-0">
                  <Link
                    href={`/productDetail/${a.id}`}
                    className="inline-block mt-2 px-3 py-1.5 rounded border text-indigo-600 border-indigo-200 hover:bg-indigo-50 text-sm"
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
