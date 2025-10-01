"use client";

import { useEffect, useMemo, useState } from "react";

export type Auction = {
  id: number;
  title: string;
  currentBid: number;
  startTime: string; // ISO string
  endTime: string;   // ISO string
  startPrice: number;
  image?: string | null;
  badge?: string | null;
};

type Props = {
  auction: Auction;
};

function fmtCurrency(n: number) {
  return n.toLocaleString(undefined, {
    style: "currency",
    currency: "LKR",
    maximumFractionDigits: 0,
  });
}

function useCountdown(endIso: string) {
  const end = useMemo(() => new Date(endIso).getTime(), [endIso]);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

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

export default function AuctionCard({ auction }: Props) {
  const { isOver, label } = useCountdown(auction.endTime);

  return (
    <div className="border rounded-2xl p-4 shadow-sm hover:shadow-md transition bg-white flex flex-col gap-3">
      <div className="relative">
        <img
          src={auction.image ?? "/placeholder.png"}
          alt={auction.title}
          className="w-full h-48 object-cover rounded-lg"
        />
        {auction.badge && (
          <span className="absolute left-3 top-3 rounded-full bg-red-600 text-white text-xs font-medium px-2 py-0.5">
            {auction.badge}
          </span>
        )}
      </div>

      <div className="flex-1">
        <h2 className="text-lg font-semibold line-clamp-2">
          {auction.title}
        </h2>

        <div className="mt-3 space-y-1 text-sm">
          <p className="text-gray-800">
            Current Bid:{" "}
            <span className="font-semibold">{fmtCurrency(auction.currentBid)}</span>
          </p>
          <p
            className={`mt-1 ${
              isOver ? "text-red-600" : "text-green-700"
            } font-medium`}
          >
            {isOver ? "Auction ended" : `Ends in: ${label}`}
          </p>
        </div>
      </div>

      <a
        href={`/auctions/${auction.id}`}
        className={`mt-3 w-full rounded-xl px-4 py-2 font-semibold text-center transition
          ${isOver ? "bg-gray-300 text-gray-600 cursor-not-allowed" : "bg-black text-white hover:bg-gray-800"}`}
      >
        {isOver ? "Closed" : "Place Bid"}
      </a>
    </div>
  );
}
