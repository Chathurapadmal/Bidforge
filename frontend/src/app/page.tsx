// src/app/page.tsx
"use client";

import Link from "next/link";
import "./css/globals.css";
import { useEffect, useMemo, useState } from "react";
import PhotoSlider from "./components/slider";
import Hero from "./components/hero";
import ProductGrid from "./components/productGrid";

type AuctionDto = {
  id: number;
  title: string;
  currentBid: number;
  startTime?: string | null;
  endTime?: string | null;
  image?: string | null; // filename, "/images/x", or absolute URL
  badge?: string | null;
};

import { API_BASE } from "../lib/Config";
const PLACEHOLDER = "/placeholder.png";

/* ---------- utils ---------- */
function toImageSrc(img?: string | null): string {
  if (!img) return PLACEHOLDER;
  let s = img.trim();
  if (!s) return PLACEHOLDER;
  try {
    s = decodeURIComponent(s);
  } catch {}
  if (/^https?:\/\//i.test(s)) return s; // absolute URL
  if (s.startsWith("images/")) s = `/${s}`; // "images/x" -> "/images/x"
  if (s.startsWith("/images/")) return `${API_BASE}${s}`; // server path
  return `${API_BASE}/images/${encodeURIComponent(s)}`; // bare filename
}

function useCountdown(endIso?: string | null) {
  const end = useMemo(
    () => (endIso ? new Date(endIso).getTime() : 0),
    [endIso]
  );
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  if (!endIso) return { isOver: false, label: undefined as string | undefined };
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

function fmtCurrencyLKR(n: number) {
  return n.toLocaleString(undefined, { maximumFractionDigits: 0 });
}

/* ---------- card ---------- */
function FeaturedAuctionCard({ a }: { a: AuctionDto }) {
  const { isOver, label } = useCountdown(a.endTime);
  const imgSrc = useMemo(() => toImageSrc(a.image), [a.image]);

  return (
    <article className="group rounded-2xl overflow-hidden border border-gray-200 bg-white shadow-sm hover:shadow-md transition">
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={imgSrc}
          alt={a.title}
          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = PLACEHOLDER;
          }}
        />
        {a.badge && (
          <span className="absolute left-3 top-3 rounded-full bg-fuchsia-500 text-white text-xs font-medium px-2 py-0.5">
            {a.badge}
          </span>
        )}
        {label && (
          <span
            className={`absolute right-3 bottom-3 rounded-md text-white text-xs px-2 py-1 ${
              isOver ? "bg-gray-700" : "bg-indigo-600"
            }`}
          >
            ⏱ {label}
          </span>
        )}
      </div>

      <div className="p-4">
        <h3 className="line-clamp-2 text-sm font-semibold min-h-[2.5rem]">
          {a.title}
        </h3>
        <div className="mt-2 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-600">Current bid</p>
            <p className="text-base font-semibold">
              LKR {fmtCurrencyLKR(a.currentBid)}
            </p>
          </div>
          <Link
            href={`/productDetail/${a.id}`}
            className={`inline-flex items-center justify-center rounded-lg px-3 py-2 text-sm font-medium text-white hover:opacity-90 ${
              isOver ? "bg-gray-400 cursor-not-allowed" : "bg-indigo-600"
            }`}
            aria-disabled={isOver}
            onClick={(e) => {
              if (isOver) e.preventDefault();
            }}
          >
            {isOver ? "Closed" : "Place Order"}
          </Link>
        </div>
      </div>
    </article>
  );
}

/* ---------- page ---------- */
export default function Page() {
  const [auctions, setAuctions] = useState<AuctionDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(
          `${API_BASE}/api/auctions?sort=endingSoon&limit=12`,
          {
            cache: "no-store",
          }
        );
        if (!res.ok) throw new Error(`Failed: ${res.status}`);
        const data = await res.json();
        setAuctions(data.items ?? []);
      } catch (e: any) {
        setError(e.message ?? "Failed to load auctions");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <section className="relative overflow-hidden min-h-screen bg-white text-gray-900">
      {/* background accents (white theme) */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full blur-3xl bg-indigo-500/15" />
        <div className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full blur-3xl bg-pink-500/15" />
        <div className="absolute inset-0 opacity-[0.06] bg-[radial-gradient(circle_at_center,theme(colors.indigo.500),transparent_40%)]" />
      </div>

      <main className="p-6">
        <Hero />

        {/* Top Photo Slider */}
        <div className="mt-2">
          <PhotoSlider images={["slide1.jpg", "slide2.jpg", "slide3.jpg"]} />
        </div>

        {/* Featured Auctions */}
        {error && <p className="text-red-600 mt-6">{error}</p>}
        {loading && (
          <p className="mt-6 text-gray-600">Loading featured auctions…</p>
        )}

        {!loading && !error && (
          <div className="mt-6 ">
            <ProductGrid />
          </div>
        )}
      </main>
    </section>
  );
}
