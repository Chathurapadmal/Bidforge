"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiFetch } from "../../../lib/api";
import { toImageSrc } from "../../../lib/Config";
import { useSession } from "../../../lib/session";

type StatusResp = {
  currentBid: number;
  topBid: {
    amount: number;
    bidderId: string;
    bidderName?: string | null;
  } | null;
  isEnded: boolean;
  canPurchase: boolean;
  purchasedAt?: string | null;
};

type DetailResp = {
  id: number;
  title: string;
  description?: string | null;
  currentBid: number;
  startTime: string;
  endTime: string;
  image?: string | null;
  badge?: string | null;
  sellerId?: string | null;
  topBid?: {
    amount: number;
    at: string;
    bidderId: string;
    bidderName?: string | null;
  } | null;
  isEnded: boolean;
  purchasedAt?: string | null;
};

type BidRow = {
  id: number;
  amount: number;
  at: string;
  bidderId: string;
  bidderName?: string | null;
};

export default function ProductDetailPage() {
  const params = useParams<{ id: string }>();
  const id = Number(params?.id);
  const router = useRouter();
  const { user, loading, refresh } = useSession();

  const [detail, setDetail] = useState<DetailResp | null>(null);
  const [status, setStatus] = useState<StatusResp | null>(null);
  const [bids, setBids] = useState<BidRow[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [amount, setAmount] = useState<string>("");

  const imgSrc = useMemo(() => toImageSrc(detail?.image), [detail?.image]);

  const loadAll = async () => {
    try {
      const [d, s, bs] = await Promise.all([
        apiFetch<DetailResp>(`/api/auctions/${id}`),
        apiFetch<StatusResp>(`/api/auctions/${id}/status`),
        apiFetch<BidRow[]>(`/api/auctions/${id}/bids`),
      ]);
      setDetail(d);
      setStatus(s);
      setBids(bs);
    } catch (e: any) {
      setErr(e?.message ?? "Failed to load auction");
    }
  };

  useEffect(() => {
    void refresh();
  }, [refresh]);
  useEffect(() => {
    if (id) void loadAll();
  }, [id]);

  // Poll status every 5s (so the leader & button state update)
  useEffect(() => {
    const t = setInterval(() => {
      void apiFetch<StatusResp>(`/api/auctions/${id}/status`)
        .then(setStatus)
        .catch(() => {});
    }, 5000);
    return () => clearInterval(t);
  }, [id]);

  const currentBid = status?.currentBid ?? detail?.currentBid ?? 0;
  const leaderName =
    status?.topBid?.bidderName ?? detail?.topBid?.bidderName ?? null;

  const onBid = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    if (!user) {
      router.push(`/auth/login?next=/productDetail/${id}`);
      return;
    }
    const v = Number(amount);
    if (!Number.isFinite(v) || v <= 0) {
      setErr("Enter a valid positive amount.");
      return;
    }

    try {
      await apiFetch(`/api/auctions/${id}/bids`, {
        method: "POST",
        body: JSON.stringify({ Amount: v }),
      });
      setAmount("");
      await loadAll();
    } catch (e: any) {
      setErr(e?.message ?? "Bid failed");
    }
  };

  const onPurchase = async () => {
    setErr(null);
    if (!user) {
      router.push(`/auth/login?next=/productDetail/${id}`);
      return;
    }
    try {
      await apiFetch(`/api/auctions/${id}/purchase`, { method: "POST" });
      await loadAll();
      alert("Purchase confirmed! (stub)");
    } catch (e: any) {
      setErr(e?.message ?? "Purchase failed");
    }
  };

  // countdown
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const endsAt = detail ? new Date(detail.endTime).getTime() : 0;
  const msLeft = Math.max(0, endsAt - now);
  const isEnded = status?.isEnded ?? msLeft <= 0;

  const fmtLeft = () => {
    if (!detail) return "";
    if (isEnded) return "Ended";
    const sec = Math.floor(msLeft / 1000);
    const d = Math.floor(sec / 86400);
    const h = Math.floor((sec % 86400) / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    const parts = [];
    if (d) parts.push(`${d}d`);
    if (h || d) parts.push(`${h}h`);
    if (m || h || d) parts.push(`${m}m`);
    parts.push(`${s}s`);
    return parts.join(" ");
    // safe: no String.repeat anywhere :)
  };

  return (
    <main className="max-w-5xl mx-auto p-6">
      {err && <p className="mb-4 text-red-600 break-words">{err}</p>}

      {!detail ? (
        <p>Loading…</p>
      ) : (
        <>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="rounded overflow-hidden border bg-white">
              <img
                src={imgSrc}
                alt={detail.title}
                className="w-full h-auto object-cover"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src =
                    "/placeholder.png";
                }}
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{detail.title}</h1>
              {detail.badge && (
                <span className="inline-block mt-2 text-xs px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">
                  {detail.badge}
                </span>
              )}

              <p className="mt-4 text-gray-700 whitespace-pre-wrap">
                {detail.description || ""}
              </p>

              <div className="mt-6 p-4 rounded-lg border bg-white">
                <div className="text-sm text-gray-600">Current bid</div>
                <div className="text-2xl font-semibold">
                  LKR {currentBid.toLocaleString()}
                </div>
                <div className="mt-1 text-sm text-gray-700">
                  Leader: {leaderName ? <strong>{leaderName}</strong> : "—"}
                </div>
                <div className="mt-2 text-sm">
                  Ends in: <strong>{fmtLeft()}</strong>
                </div>

                {!isEnded ? (
                  <form onSubmit={onBid} className="mt-4 flex gap-2">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder={`Your bid > ${currentBid.toLocaleString()}`}
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="border p-2 rounded w-40"
                      required
                    />
                    <button
                      className="px-4 py-2 rounded bg-indigo-600 text-white"
                      type="submit"
                    >
                      Place bid
                    </button>
                  </form>
                ) : (
                  <div className="mt-4">
                    {status?.canPurchase ? (
                      <button
                        className="px-4 py-2 rounded bg-emerald-600 text-white"
                        onClick={onPurchase}
                      >
                        Purchase
                      </button>
                    ) : (
                      <p className="text-gray-700">
                        {status?.purchasedAt ? "Purchased" : "Auction ended."}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <section className="mt-10">
            <h2 className="text-xl font-semibold">Bids</h2>
            {bids.length === 0 ? (
              <p className="mt-3 text-gray-600">No bids yet.</p>
            ) : (
              <ul className="mt-3 divide-y border rounded bg-white">
                {bids.map((b) => (
                  <li
                    key={b.id}
                    className="p-3 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-medium">
                        LKR {b.amount.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600">
                        by {b.bidderName || b.bidderId}
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(b.at).toLocaleString()}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </main>
  );
}
