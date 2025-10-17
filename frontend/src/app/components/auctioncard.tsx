// bidforge/frontend/src/app/components/auctioncard.tsx
"use client";

export type Auction = {
  id: number;
  title: string;
  description?: string | null;
  image?: string | null; // "/images/foo.jpg" | "foo.jpg" | absolute URL | null
  currentBid?: number | null;
  endTime?: string | null; // ISO
  badge?: string | null;
  createdAt: string; // ISO
};

const PLACEHOLDER = "/placeholder.png";

function joinUrl(base: string, path: string) {
  const b = base.replace(/\/+$/, "");
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${b}${p}`;
}

export function toImageSrc(img: string | null | undefined, apiBase: string) {
  if (!img || img.trim() === "") return PLACEHOLDER;
  // absolute?
  try {
    new URL(img);
    return img; // already absolute
  } catch {
    /* not absolute */
  }
  // relative to API (we serve /images/* from API)
  return joinUrl(apiBase, img.startsWith("/images") ? img : `/images/${img}`);
}

type Props = { auction: Auction; apiBase: string };

export default function AuctionCard({ auction, apiBase }: Props) {
  const src = toImageSrc(auction.image, apiBase);
  return (
    <div className="border rounded-xl p-3 shadow-sm">
      <img src={src} alt={auction.title} className="w-full h-48 object-cover rounded-lg" />
      <div className="mt-2">
        <h3 className="font-semibold">{auction.title}</h3>
        {auction.currentBid != null && (
          <p className="text-sm opacity-80">Current bid: {auction.currentBid.toFixed(2)}</p>
        )}
      </div>
    </div>
  );
}
