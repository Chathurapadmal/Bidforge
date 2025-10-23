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
  const [info, setInfo] = useState<string | null>(null);
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

  // Poll status every 5s (leader & button state)
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
    setInfo(null);
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
      setInfo("Bid placed successfully.");
    } catch (e: any) {
      setErr(e?.message ?? "Bid failed");
    }
  };

  const onPurchase = async () => {
    setErr(null);
    setInfo(null);
    if (!user) {
      router.push(`/auth/login?next=/productDetail/${id}`);
      return;
    }
    try {
      await apiFetch(`/api/auctions/${id}/purchase`, { method: "POST" });
      await loadAll();
      setInfo("Purchase confirmed!");
    } catch (e: any) {
      setErr(e?.message ?? "Purchase failed");
    }
  };

  // Countdown (hydration-safe: render static on first load, then tick)
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const endsAt = detail ? new Date(detail.endTime).getTime() : NaN;
  const msLeft = now && !Number.isNaN(endsAt) ? Math.max(0, endsAt - now) : 0;
  const endedFromClock = msLeft <= 0;
  const isEnded = status?.isEnded ?? endedFromClock;

  const fmtLeft = () => {
    if (!detail) return "";
    if (isEnded) return "Ended";
    if (!now) return "—";
    const sec = Math.floor(msLeft / 1000);
    const d = Math.floor(sec / 86400);
    const h = Math.floor((sec % 86400) / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    const parts: string[] = [];
    if (d) parts.push(`${d}d`);
    if (h || d) parts.push(`${h}h`);
    if (m || h || d) parts.push(`${m}m`);
    parts.push(`${s}s`);
    return parts.join(" ");
  };

  if (loading && !user) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="w-full max-w-5xl animate-pulse">
          <div className="h-6 w-44 bg-gray-200 rounded mb-4" />
          <div className="grid md:grid-cols-2 gap-6">
            <div className="h-72 bg-white border border-gray-200 rounded-2xl" />
            <div className="h-72 bg-white border border-gray-200 rounded-2xl" />
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto p-6">
        {/* Alerts */}
        {err && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {err}
          </div>
        )}
        {info && (
          <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {info}
          </div>
        )}

        {!detail ? (
          <p className="text-gray-600">Loading…</p>
        ) : (
          <>
            <div className="grid md:grid-cols-2 gap-6">
              {/* Image card */}
              <div className="rounded-2xl overflow-hidden border border-gray-200 bg-white shadow-sm">
                <div className="relative">
                  {detail.badge && (
                    <span className="absolute left-3 top-3 z-10 inline-flex items-center rounded-lg bg-gray-900/80 px-2 py-1 text-xs font-medium text-white backdrop-blur">
                      {detail.badge}
                    </span>
                  )}
                  <img
                    src={imgSrc || "/placeholder.png"}
                    alt={detail.title}
                    className="w-full h-auto object-cover"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src =
                        "/placeholder.png";
                    }}
                  />
                </div>
              </div>

              {/* Sticky buy box */}
              <div className="md:sticky md:top-4 h-fit">
                <h1 className="text-2xl font-semibold text-gray-900">
                  {detail.title}
                </h1>

                <p className="mt-4 text-gray-700 whitespace-pre-wrap">
                  {detail.description || ""}
                </p>

                <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                  <div className="text-sm text-gray-600">Current bid</div>
                  <div className="mt-0.5 text-2xl font-semibold text-gray-900">
                    {formatLKR(currentBid)}
                  </div>
                  <div className="mt-1 text-sm text-gray-700">
                    Leader: {leaderName ? <strong>{leaderName}</strong> : "—"}
                  </div>
                  <div className="mt-2 text-sm">
                    Ends in: <strong>{fmtLeft()}</strong>
                  </div>

                  {!isEnded ? (
                    <form
                      onSubmit={onBid}
                      className="mt-4 grid gap-2 sm:flex sm:items-center"
                    >
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder={`Your bid > ${currentBid.toLocaleString()}`}
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="block w-full sm:w-44 rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-gray-900 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        required
                      />
                      <button
                        className="inline-flex w-full sm:w-auto items-center justify-center rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        type="submit"
                      >
                        Place bid
                      </button>
                      <p className="text-xs text-gray-500 sm:ml-2">
                        Tip: bid slightly higher to avoid ties.
                      </p>
                    </form>
                  ) : (
                    <div className="mt-4">
                      {status?.canPurchase ? (
                        <button
                          className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
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

            {/* Bids */}
            <section className="mt-10">
              <h2 className="text-lg font-semibold text-gray-900">Bids</h2>
              {bids.length === 0 ? (
                <p className="mt-3 text-gray-600">No bids yet.</p>
              ) : (
                <ul className="mt-3 divide-y rounded-2xl border border-gray-200 bg-white shadow-sm">
                  {bids.map((b) => (
                    <li
                      key={b.id}
                      className="p-3 sm:p-4 flex items-center justify-between"
                    >
                      <div>
                        <div className="font-medium text-gray-900">
                          {formatLKR(b.amount)}
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
