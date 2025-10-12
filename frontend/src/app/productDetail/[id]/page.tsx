"use client";

import { useEffect, useMemo, useState } from "react";

type Auction = {
  id: number;
  title: string;
  description?: string | null;
  images?: string[] | null;
  image?: string | null;
  currentBid?: number | null;
  startingPrice?: number | null;
  startTime?: string | null;
  endTime?: string | null;
  badge?: string | null;
  createdAt: string;
};

const API_BASE =
  (process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/+$/, "")) ||
  "http://localhost:7168";
const PLACEHOLDER = "/placeholder.png";

function toImageSrc(img?: string | null) {
  if (!img) return PLACEHOLDER;
  let s = img.trim();
  try { s = decodeURIComponent(s); } catch {}
  if (/^https?:\/\//i.test(s)) return s;
  if (s.startsWith("images/")) s = `/${s}`;
  if (s.startsWith("/images/")) return `${API_BASE}${s}`;
  return `${API_BASE}/images/${encodeURIComponent(s)}`;
}

export default function Page({ params }: { params: { id: string } }) {
  const id = Number(params.id);
  const [data, setData] = useState<Auction | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const images = useMemo(() => {
    if (!data) return [PLACEHOLDER];
    if (data.images?.length) return data.images.map(toImageSrc);
    if (data.image) return [toImageSrc(data.image)];
    return [PLACEHOLDER];
  }, [data]);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setErr(null);
        const res = await fetch(`${API_BASE}/api/auctions/${id}`, { cache: "no-store" });
        if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
        setData(await res.json());
      } catch (e: any) {
        setErr(e?.message ?? "Failed to load");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (!Number.isFinite(id) || id <= 0) return <main className="p-6">Invalid product id</main>;
  if (loading) return <main className="p-6">Loading…</main>;
  if (err || !data) return <main className="p-6 text-red-600">{err ?? "Not found"}</main>;

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold mb-4">{data.title}</h1>

        <div className="grid gap-8 lg:grid-cols-2">
          <section className="bg-white dark:bg-gray-900 border border-gray-200/60 dark:border-gray-800 rounded-xl p-4">
            <div className="aspect-[4/3] overflow-hidden rounded-lg border border-gray-200/60 dark:border-gray-800">
              <img
                src={images[0]}
                alt={data.title}
                className="h-full w-full object-cover"
                onError={(e) => ((e.currentTarget as HTMLImageElement).src = PLACEHOLDER)}
              />
            </div>
            {images.length > 1 && (
              <div className="mt-3 grid grid-cols-5 gap-2">
                {images.slice(1).map((src, i) => (
                  <img
                    key={i}
                    src={src}
                    alt={`thumb ${i + 2}`}
                    className="h-16 w-full object-cover rounded border border-gray-200/60 dark:border-gray-800"
                    onError={(e) => ((e.currentTarget as HTMLImageElement).src = PLACEHOLDER)}
                  />
                ))}
              </div>
            )}
          </section>

          <section className="bg-white dark:bg-gray-900 border border-gray-200/60 dark:border-gray-800 rounded-xl p-4 space-y-3">
            <div>
              <p className="text-xs text-gray-500">Current / Starting</p>
              <p className="text-2xl font-bold">
                LKR {(data.currentBid ?? data.startingPrice ?? 0).toLocaleString()}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-lg border border-gray-200/60 dark:border-gray-800 p-3">
                <div className="text-gray-500">Starts</div>
                <div className="font-medium">
                  {data.startTime ? new Date(data.startTime).toLocaleString() : "—"}
                </div>
              </div>
              <div className="rounded-lg border border-gray-200/60 dark:border-gray-800 p-3">
                <div className="text-gray-500">Ends</div>
                <div className="font-medium">
                  {data.endTime ? new Date(data.endTime).toLocaleString() : "—"}
                </div>
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
    </main>
  );
}
