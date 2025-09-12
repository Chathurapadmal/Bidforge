// Lightweight client for /auctions list endpoint
export type AuctionSummaryDto = {
  id: string;
  title: string;
  image: string;        // CDN URL for the hero image
  currentBid: number;   // backend-calculated current highest bid
  endTime?: string;     // ISO (UTC). Optional if already closed
  badge?: string;       // "Ending soon" | "New" | "Hot" | "Reserve met" | etc.
};

export type ListAuctionsParams = {
  status?: "ACTIVE" | "CLOSED" | "UPCOMING";
  featured?: boolean;
  sort?: "endingSoon" | "newlyListed" | "popular";
  limit?: number;
  cursor?: string;
  // Optional field selection if your API supports it:
  fields?: string; // e.g., "id,title,image,currentBid,endTime,badge"
};

export type ListAuctionsResponse = {
  items: AuctionSummaryDto[];
  nextCursor?: string | null;
};

export async function listAuctions(
  params: ListAuctionsParams = {}
): Promise<ListAuctionsResponse> {
  const url = new URL("/auctions", process.env.NEXT_PUBLIC_API_BASE_URL= "https//:localhost:5001/api");
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") url.searchParams.set(k, String(v));
  });

  const res = await fetch(url.toString(), {
    method: "GET",
    headers: { "Accept": "application/json" },
    cache: "no-store", // these change often
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `Failed to fetch auctions (${res.status})`);
  }

  return res.json();
}
