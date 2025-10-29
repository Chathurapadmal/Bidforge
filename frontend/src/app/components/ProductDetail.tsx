"use client";

import { useEffect, useMemo, useState } from "react";

type Auction = {
  id: number;
  title: string;
  description?: string | null;
  images?: string[] | null;
  image?: string | null;            // legacy single
  currentBid?: number | null;
  startingPrice?: number | null;
  startTime?: string | null;
  endTime?: string | null;
  badge?: string | null;
  createdAt: string;
};

type Props = {
  id: number;             // product/auction id to load
  onClose?: () => void;   // optional (for modal usage)
};

const API_BASE =
  (process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/+$/, "")) ||
  "http://localhost:7168";
const PLACEHOLDER = "/placeholder.png";

function toImageSrc(img?: string | null): string {
  if (!img) return PLACEHOLDER;
  let s = img.trim();
  if (!s) return PLACEHOLDER;
  try { s = decodeURIComponent(s); } catch {}
  if (/^https?:\/\//i.test(s)) return s;
  if (s.startsWith("images/")) s = `/${s}`;
  if (s.startsWith("/images/")) return `${API_BASE}${s}`;
  return `${API_BASE}/images/${encodeURIComponent(s)}`;
}

export default function ProductDetail({ id, onClose }: Props) {
  const [data, setData] = useState<Auction | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  // gallery state
  const images = useMemo(() => {
    if (!data) return [PLACEHOLDER];
    if (data.images?.length) return data.images.map(toImageSrc);
    if (data.image) return [toImageSrc(data.image)];
    return [PLACEHOLDER];
  }, [data]);

  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setErr(null);
        const res = await fetch(`${API_BASE}/api/auctions/${id}`, { cache: "no-store" });
        if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
        const a: Auction = await res.json();
        if (!cancelled) setData(a);
      } catch (e: any) {
        if (!cancelled) setErr(e?.message ?? "Failed to load");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [id]);

  if (loading) return <div className="p-6">Loading…</div>;
  if (err || !data) return <div className="p-6 text-red-600">{err ?? "Not found"}</div>;

  const price = (data.currentBid ?? data.startingPrice ?? 0).toLocaleString();

  return (
    <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-xl border border-gray-200/60 dark:border-gray-800">
      {/* Optional close (for modal usage) */}
      {onClose && (
        <div className="flex justify-end p-2">
          <button
            onClick={onClose}
            className="rounded px-3 py-1 text-sm bg-gray-200 dark:bg-gray-800"
          >
            Close
          </button>
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-2 p-4">
        {/* Gallery */}
        <section>
          <div className="aspect-[4/3] overflow-hidden rounded-lg border border-gray-200/60 dark:border-gray-800">
            <img
              src={images[activeIdx]}
              alt={data.title}
              className="h-full w-full object-cover"
              onError={(e) => ((e.currentTarget as HTMLImageElement).src = PLACEHOLDER)}
            />
          </div>
          {images.length > 1 && (
            <div className="mt-3 grid grid-cols-5 sm:grid-cols-6 md:grid-cols-7 gap-2">
              {images.map((src, i) => (
                <button
                  key={i}
                  onClick={() => setActiveIdx(i)}
                  className={`border rounded-lg overflow-hidden ${
                    i === activeIdx ? "border-indigo-600 ring-2 ring-indigo-300"
                                     : "border-gray-200/60 dark:border-gray-800"
                  }`}
                  aria-label={`Show image ${i + 1}`}
                >
                  <img
                    src={src}
                    alt={`thumb ${i + 1}`}
                    className="h-16 w-full object-cover"
                    onError={(e) => ((e.currentTarget as HTMLImageElement).src = PLACEHOLDER)}
                  />
                </button>
              ))}
            </div>
          )}
        </section>

        {/* Info */}
        <section className="space-y-3">
          <h1 className="text-xl md:text-2xl font-bold">{data.title}</h1>
          {data.badge && (
            <span className="rounded-full bg-indigo-600 text-white text-xs font-medium px-3 py-1">
              {data.badge}
            </span>
          )}

          <div>
            <p className="text-xs text-gray-500">Current / Starting</p>
            <p className="text-2xl font-bold">LKR {price}</p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-lg border border-gray-200/60 dark:border-gray-800 p-3">
              <div className="text-gray-500">Starts</div>
              <div className="font-medium">{data.startTime ? new Date(data.startTime).toLocaleString() : "—"}</div>
            </div>
            <div className="rounded-lg border border-gray-200/60 dark:border-gray-800 p-3">
              <div className="text-gray-500">Ends</div>
              <div className="font-medium">{data.endTime ? new Date(data.endTime).toLocaleString() : "—"}</div>
            </div>
          </div>

          {data.description && (
            <div className="pt-2">
              <h3 className="font-semibold mb-1">Description</h3>
              <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">
                {data.description}
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
