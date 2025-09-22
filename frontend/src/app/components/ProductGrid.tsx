"use client";

import * as React from "react";
import {
  listAuctions,
  type AuctionSummaryDto,
  type ListAuctionsParams,
} from "../services/api/AuctionsApi";
import Image from "next/image";

// ---- UI type your grid expects ----
export type Product = {
  id: string | number;
  title: string;
  image: string;
  price: number;
  endTime?: string;   // ✅ keep raw endTime
  endsIn?: string;    // ✅ formatted version
  badge?: string;
};

// ---- Helpers ----
function formatEndsIn(endTimeIso?: string): string | undefined {
  if (!endTimeIso) return undefined;
  const end = new Date(endTimeIso).getTime();
  const now = Date.now();
  const diff = Math.max(0, end - now);

  const s = Math.floor(diff / 1000);
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;

  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${sec}s`;
  return `${sec}s`;
}

function mapDtoToProduct(dto: AuctionSummaryDto): Product {
  return {
    id: dto.id,
    title: dto.title,
    image: dto.image,
    price: dto.currentBid,
    endTime: dto.endTime,       // ✅ store raw
    endsIn: formatEndsIn(dto.endTime),
    badge: dto.badge,
  };
}

// ---- Loading skeleton card ----
function CardSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl overflow-hidden border border-border-light dark:border-border-dark bg-panel-light dark:bg-panel-dark">
      <div className="aspect-[4/3] bg-gray-200/70 dark:bg-neutral-800" />
      <div className="p-4 space-y-3">
        <div className="h-4 w-3/4 bg-gray-200/70 dark:bg-neutral-800 rounded" />
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-3 w-20 bg-gray-200/70 dark:bg-neutral-800 rounded" />
            <div className="h-4 w-24 bg-gray-200/70 dark:bg-neutral-800 rounded" />
          </div>
          <div className="h-9 w-24 bg-gray-200/70 dark:bg-neutral-800 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

type ProductGridProps = {
  title?: string;
  viewAllHref?: string;
  apiParams?: ListAuctionsParams;
  pollMs?: number;
};

export default function ProductGrid({
  title = "Featured Auctions",
  viewAllHref = "/auctions",
  apiParams = {
    featured: true,
    status: "ACTIVE",
    sort: "endingSoon",
    limit: 12,
    fields: "id,title,image,currentBid,endTime,badge",
  },
  pollMs,
}: ProductGridProps) {
  const [items, setItems] = React.useState<Product[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Tick to refresh "endsIn"
  const [, forceTick] = React.useState(0);
  React.useEffect(() => {
    const t = setInterval(() => forceTick((n) => n + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const fetchGrid = React.useCallback(async () => {
    try {
      setError(null);
      const res = await listAuctions(apiParams);
      setItems(res.items.map(mapDtoToProduct));
    } catch (e: unknown) {   // ✅ fixed typing
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError("Failed to load auctions");
      }
    } finally {
      setLoading(false);
    }
  }, [apiParams]);

  React.useEffect(() => {
    fetchGrid();
  }, [fetchGrid]);

  React.useEffect(() => {
    if (!pollMs) return;
    const t = setInterval(fetchGrid, pollMs);
    return () => clearInterval(t);
  }, [pollMs, fetchGrid]);

  return (
    <section className="max-w-6xl mx-auto px-6 py-10">
      <div className="flex items-end justify-between mb-6">
        <h2 className="text-xl font-semibold text-text-light dark:text-text-dark">
          {title}
        </h2>
        <a
          href={viewAllHref}
          className="text-primary-light dark:text-primary-dark text-sm hover:underline"
        >
          View all
        </a>
      </div>

      {/* Error state */}
      {error && !loading && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
          {error}
        </div>
      )}

      {/* Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {loading
          ? Array.from({ length: apiParams.limit ?? 8 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))
          : items.length === 0 ? (
              <div className="col-span-full text-center text-sm text-text-mutedLight dark:text-text-mutedDark py-10">
                No auctions to display right now.
              </div>
            ) : (
              items.map((p) => (
                <article
                  key={p.id}
                  className="group rounded-2xl overflow-hidden border border-border-light dark:border-border-dark bg-panel-light dark:bg-panel-dark shadow-sm hover:shadow-md transition"
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    {/* ✅ changed img to Next Image */}
                    <Image
                      src={p.image}
                      alt={p.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {p.badge && (
                      <span className="absolute left-3 top-3 rounded-full bg-secondary-light dark:bg-secondary-dark text-white text-xs font-medium px-2 py-0.5">
                        {p.badge}
                      </span>
                    )}
                    {p.endTime && (
                      <span className="absolute right-3 bottom-3 rounded-md bg-black/70 text-white text-xs px-2 py-1">
                        ⏱ {formatEndsIn(p.endTime)}
                      </span>
                    )}
                  </div>

                  <div className="p-4">
                    <h3 className="line-clamp-2 text-sm font-medium text-text-light dark:text-text-dark">
                      {p.title}
                    </h3>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-primary-light dark:text-primary-dark font-semibold">
                        ${p.price}
                      </span>
                      <a
                        href={`/auctions/${p.id}`}
                        className="text-sm text-primary-light dark:text-primary-dark hover:underline"
                      >
                        Bid now
                      </a>
                    </div>
                  </div>
                </article>
              ))
            )}
      </div>
    </section>
  );
}
