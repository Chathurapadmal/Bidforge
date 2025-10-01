"use client";
import { useEffect, useState } from "react";
import AuctionCard from "./components/AuctionCard";
import PhotoSlider from "./components/slider";

// 👇 Match your backend DTO
type AuctionDto = {
  id: number;
  title: string;
  currentBid: number;
  // optional start time coming from the backend; add if missing
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
        setAuctions(data.items ?? []); // your backend wraps results in { items: [...] }
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

      {error && <p className="text-red-500">{error}</p>}
      {loading && <p>Loading auctions…</p>}

      <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {auctions.map((a) => (
          <AuctionCard
            key={a.id}
            auction={{
              id: a.id,
              title: a.title,
              // your AuctionCard expects both startPrice + currentBid
              startPrice: a.currentBid,
              currentBid: a.currentBid,
              startTime: a.startTime ?? "", // Provide startTime, fallback to empty string if missing
              endTime: a.endTime,
            }}
          />
        ))}
      </div>
    </main>
  );
}
