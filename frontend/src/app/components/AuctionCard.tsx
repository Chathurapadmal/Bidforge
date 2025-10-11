"use client";
import React, { useMemo, useEffect, useState, type SyntheticEvent } from "react";
import { toImageSrc, PLACEHOLDER } from "@/lib/imageUtils";

type Auction = {
  id: number;
  title: string;
  image?: string | null;
  currentBid?: number;
  startPrice?: number;
  startTime?: string | null;
  endTime?: string | null;
  badge?: string | null;
};

type Props = { auction: Auction };

function useCountdown(endIso?: string | null) {
  const end = useMemo(() => (endIso ? new Date(endIso).getTime() : 0), [endIso]);
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t); }, []);
  if (!endIso) return { hasDeadline: false, isOver: false, label: undefined as string | undefined };
  const diff = Math.max(end - now, 0);
  const s = Math.floor(diff / 1000);
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const isOver = diff <= 0;
  const label = isOver ? "Ended" : `${d > 0 ? `${d}d ` : ""}${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(sec).padStart(2,"0")}`;
  return { hasDeadline: true, isOver, label };
}

export default function AuctionCard({ auction }: Props) {
  const imgSrc = useMemo(() => toImageSrc(auction.image), [auction.image]);
  const { hasDeadline, isOver, label } = useCountdown(auction.endTime);

  useEffect(() => {
    // See exactly what the card is requesting
    console.log("Auction image resolved:", { raw: auction.image, final: imgSrc });
  }, [auction.image, imgSrc]);

  const onErr = (e: SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = PLACEHOLDER;
  };

  return (
    <div className="border rounded-2xl p-4 shadow-sm hover:shadow-md transition bg-white flex flex-col gap-3">
      <div className="relative">
        <img
          src={imgSrc}
          alt={auction.title}
          className="w-full h-48 object-cover rounded-lg"
          loading="lazy"
          onError={onErr}
        />
        {auction.badge && (
          <span className="absolute left-3 top-3 rounded-full bg-red-600 text-white text-xs font-medium px-2 py-0.5">
            {auction.badge}
          </span>
        )}
      </div>
      <div className="flex items-center justify-between">
        <h3 className="font-semibold line-clamp-1">{auction.title}</h3>
        {hasDeadline && (
          <span className={`text-xs px-2 py-0.5 rounded ${isOver ? "bg-gray-200 text-gray-700" : "bg-emerald-100 text-emerald-700"}`} title={auction.endTime ?? undefined}>
            {label}
          </span>
        )}
      </div>
    </div>
  );
}
