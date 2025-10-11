"use client";
import { useEffect, useState } from "react";
import PhotoSlider from "./components/slider";
import BuyPage from "./buy/page"; // 👈 import Buy page here

type AuctionDto = {
  id: number;
  title: string;
  currentBid: number;
  startTime?: string;
  endTime: string;
  image?: string;
  badge?: string;
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://localhost:7168";

export default function Page() {
  const [auctions, setAuctions] = useState<AuctionDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAuctions() {
      try {
        const res = await fetch(`${API_BASE}/api/auctions?sort=endingSoon&limit=12`, {
          cache: "no-store",
        });
        if (!res.ok) throw new Error(`Failed: ${res.status}`);
        const data = await res.json();
        setAuctions(data.items ?? []);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    fetchAuctions();
  }, []);

  return (
    <main className="p-6">
      {/* ----- Top Photo Slider ----- */}
      <PhotoSlider
        images={[
          "bidf.jpg",
          "Photo1.webp",
          "photo2.webp",
          "sliderpic.jpg",
          "slider2.jpg",
          "sliderpic3.jpg",
        ]}
      />

      {/* ----- Featured Auctions Section ----- */}
      {error && <p className="text-red-500 mt-6">{error}</p>}
      {loading && <p className="mt-6">Loading featured auctions…</p>}

      {!loading && !error && (
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {auctions.map((a) => (
            <div
              key={a.id}
              className="border rounded-2xl p-4 bg-white hover:shadow transition"
            >
              <img
                src={
                  a.image
                    ? a.image.startsWith("http")
                      ? a.image
                      : `https://localhost:7168/images/${a.image}`
                    : "/placeholder.png"
                }
                alt={a.title}
                className="w-full h-48 object-cover rounded-xl mb-2"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = "/placeholder.png";
                }}
              />
              <h3 className="font-semibold text-sm line-clamp-2 mb-1">{a.title}</h3>
              <p className="text-gray-600 text-xs">
                Current Bid: <span className="font-semibold">LKR {a.currentBid}</span>
              </p>
            </div>
          ))}
        </div>
      )}

      {/* ----- Integrated Buy Page ----- */}
 
    </main>
  );
}
