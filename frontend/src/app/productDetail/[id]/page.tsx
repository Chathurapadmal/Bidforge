// app/productDetail/[id]/page.tsx
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { API_BASE } from "../../../lib/config";

type Auction = {
  id: number;
  title: string;
  description?: string | null;

  // any of these may come from backend
  imageUrls?: string[] | null; // absolute URLs
  imagePaths?: string[] | null; // "/images/..."
  images?: string[] | null; // filenames only
  image?: string | null; // legacy single

  currentBid?: number | null;
  startingPrice?: number | null;
  startTime?: string | null;
  endTime?: string | null;
  badge?: string | null;
  createdAt?: string | null;
};

type BidDto = {
  id: number;
  amount: number;
  bidder?: string | null;
  createdAt: string; // ISO
};

const PLACEHOLDER = "/placeholder.png";
const MIN_INCREMENT = 100;

/** Normalize anything -> absolute URL suitable for <img src> */
function toImageSrc(img?: string | null) {
  if (!img) return PLACEHOLDER;
  let s = img.trim();
  try {
    s = decodeURIComponent(s);
  } catch {}
  if (/^https?:\/\//i.test(s)) return s; // absolute
  if (s.startsWith("images/")) s = `/${s}`; // "images/x" -> "/images/x"
  if (s.startsWith("/images/")) return `${API_BASE}${s}`; // server path
  return `${API_BASE}/images/${encodeURIComponent(s)}`; // bare filename
}

export default function Page() {
  const params = useParams();
  const idStr = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const id = Number(idStr);

  const [data, setData] = useState<Auction | null>(null);
  const [bids, setBids] = useState<BidDto[]>([]);
  const [bidAmount, setBidAmount] = useState<string>("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [info, setInfo] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  const gallery = useMemo(() => {
    if (!data) return [PLACEHOLDER];

    if (Array.isArray(data.imageUrls) && data.imageUrls.length)
      return data.imageUrls.map(toImageSrc);
    if (Array.isArray(data.imagePaths) && data.imagePaths.length)
      return data.imagePaths.map(toImageSrc);
    if (Array.isArray(data.images) && data.images.length)
      return data.images.map(toImageSrc);

    if (typeof data.image === "string" && data.image.includes(",")) {
      return data.image.split(",").map((s) => toImageSrc(s));
    }
    if (data.image) return [toImageSrc(data.image)];

    return [PLACEHOLDER];
  }, [data]);

  const lastBid = data?.currentBid ?? data?.startingPrice ?? 0;
  const minNext = Math.max(0, Number(lastBid)) + MIN_INCREMENT;

  const loadAll = useCallback(async () => {
    if (!Number.isFinite(id) || id <= 0) {
      setErr("Invalid product id.");
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    const { signal } = controller;
    let isMounted = true;

    setLoading(true);
    setErr(null);
    setInfo(null);
    setNotFound(false);

    const auctionUrl = `${API_BASE}/api/auctions/${id}`;
    const bidsUrl = `${API_BASE}/api/auctions/${id}/bids?limit=50`;

    try {
      const [aRes, bRes] = await Promise.all([
        fetch(auctionUrl, { cache: "no-store", signal }),
        fetch(bidsUrl, { cache: "no-store", signal }),
      ]);

      if (aRes.status === 404) {
        if (isMounted) {
          setData(null);
          setBids([]);
          setNotFound(true);
        }
        return;
      }

      if (!aRes.ok) {
        const txt = await aRes.text().catch(() => "");
        throw new Error(
          `GET ${auctionUrl} -> ${aRes.status} ${aRes.statusText}${txt ? ` · ${txt}` : ""}`
        );
      }

      const aJson = await aRes.json().catch(() => null);
      if (isMounted) setData(aJson);

      if (bRes.ok) {
        const bJson = await bRes.json().catch(() => ({}));
        const list = Array.isArray(bJson.items) ? bJson.items : [];
        if (isMounted) setBids(list);
      } else if (isMounted) setBids([]);
    } catch (e: any) {
      if (!signal.aborted && isMounted) setErr(e?.message ?? "Failed to load");
    } finally {
      if (isMounted) setLoading(false);
    }

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [id]);

  useEffect(() => {
    const p = loadAll();
    return () => {
      p.then((cleanup) => typeof cleanup === "function" && cleanup()).catch(
        () => {}
      );
    };
  }, [loadAll]);

  async function placeBid(e: React.FormEvent) {
    e.preventDefault();
    if (!data) return;

    const amount = Number(bidAmount);
    if (!Number.isFinite(amount) || amount <= 0) {
      setInfo(null);
      setErr("Enter a valid amount.");
      return;
    }
    if (amount <= (data.currentBid ?? data.startingPrice ?? 0)) {
      setErr(
        `Your bid must be higher than ${Math.floor(lastBid).toLocaleString()}.`
      );
      setInfo(null);
      return;
    }
    if (amount < minNext) {
      setErr(
        `Minimum next bid is ${minNext.toLocaleString()} (increment ${MIN_INCREMENT}).`
      );
      setInfo(null);
      return;
    }

    try {
      setPosting(true);
      setErr(null);
      setInfo(null);

      const res = await fetch(`${API_BASE}/api/auctions/${id}/bids`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ amount }),
      });

      const json = await res.json().catch(() => null);

      if (!res.ok) {
        const msg =
          json?.message || `Bid failed: ${res.status} ${res.statusText}`;
        setErr(msg);
        return;
      }

      setInfo("Bid placed successfully ✅");
      setBidAmount("");
      await loadAll();
    } catch (e: any) {
      setErr(e?.message ?? "Bid failed");
    } finally {
      setPosting(false);
    }
  }

  // ---------- render states ----------
  if (!Number.isFinite(id) || id <= 0)
    return <main className="p-6">Invalid product id</main>;
  if (loading) return <main className="p-6">Loading…</main>;
  if (notFound) {
    return (
      <main className="min-h-screen grid place-items-center bg-white text-gray-900">
        <div className="text-center">
          <h1 className="text-3xl font-bold">404 — Not Found</h1>
          <p className="mt-2 text-gray-600">
            That product doesn’t exist or was removed.
          </p>
        </div>
      </main>
    );
  }
  if (err && !data) return <main className="p-6 text-red-600">{err}</main>;
  if (!data) return <main className="p-6">Not found</main>;

  // ---------- main UI ----------
  return (
    <main className="min-h-screen bg-white text-gray-900">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold mb-4">{data.title}</h1>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* LEFT: all photos */}
          <section className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {gallery.map((src, i) => (
                <div
                  key={src + i}
                  className={`overflow-hidden rounded-lg border border-gray-200 ${i === 0 ? "sm:col-span-2" : ""}`}
                >
                  <div className="aspect-[4/3]">
                    <img
                      src={src}
                      alt={`${data.title} — photo ${i + 1}`}
                      className="h-full w-full object-cover"
                      onError={(e) =>
                        ((e.currentTarget as HTMLImageElement).src =
                          PLACEHOLDER)
                      }
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 text-xs text-gray-500">
              Showing {gallery.length} photo{gallery.length === 1 ? "" : "s"}
            </div>
          </section>

          {/* RIGHT: details + bid */}
          <section className="bg-white border border-gray-200 rounded-xl p-4 space-y-4">
            <div>
              <p className="text-xs text-gray-500">Current / Starting</p>
              <p className="text-2xl font-bold">
                LKR{" "}
                {(data.currentBid ?? data.startingPrice ?? 0).toLocaleString()}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-lg border border-gray-200 p-3">
                <div className="text-gray-500">Starts</div>
                <div className="font-medium">
                  {data.startTime
                    ? new Date(data.startTime).toLocaleString()
                    : "—"}
                </div>
              </div>
              <div className="rounded-lg border border-gray-200 p-3">
                <div className="text-gray-500">Ends</div>
                <div className="font-medium">
                  {data.endTime ? new Date(data.endTime).toLocaleString() : "—"}
                </div>
              </div>
            </div>

            {data.description && (
              <div className="pt-2">
                <h3 className="font-semibold mb-1">Description</h3>
                <p className="text-sm text-gray-700 whitespace-pre-line">
                  {data.description}
                </p>
              </div>
            )}

            {/* Place Bid */}
            <form onSubmit={placeBid} className="pt-2 border-t border-gray-200">
              <div className="text-sm text-gray-600 mb-2">
                Last bid:{" "}
                <span className="font-semibold">
                  {Math.floor(lastBid).toLocaleString()}
                </span>{" "}
                · Minimum next:{" "}
                <span className="font-semibold">
                  {minNext.toLocaleString()}
                </span>
              </div>

              <div className="flex gap-2">
                <input
                  type="number"
                  inputMode="numeric"
                  step="1"
                  min={minNext}
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                  className="w-40 rounded border border-gray-300 bg-white p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={`${minNext}`}
                />
                <button
                  disabled={posting}
                  className="px-4 py-2 rounded bg-blue-600 text-white hover:opacity-90 disabled:opacity-60"
                  type="submit"
                >
                  {posting ? "Placing…" : "Place Bid"}
                </button>
              </div>

              {err && <div className="mt-2 text-sm text-red-600">{err}</div>}
              {info && (
                <div className="mt-2 text-sm text-green-600">{info}</div>
              )}
            </form>

            {bids.length > 0 && (
              <div className="pt-4">
                <h4 className="font-semibold mb-2 text-sm">Recent bids</h4>
                <ul className="space-y-1 text-sm">
                  {bids.map((b) => (
                    <li
                      key={b.id}
                      className="flex justify-between gap-2 border-b border-gray-100 pb-1"
                    >
                      <span>{b.bidder ?? "Guest"}</span>
                      <span>LKR {Math.floor(b.amount).toLocaleString()}</span>
                      <span className="text-gray-500">
                        {new Date(b.createdAt).toLocaleString()}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
