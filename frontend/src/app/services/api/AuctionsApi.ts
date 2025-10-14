export type AuctionSummaryDto = {
  id: number;
  title: string;
  image?: string | null;
  currentBid: number;
  endTime?: string | null;
  badge?: string | null;
  description?: string | null;
  createdAt?: string;
};

export type ListAuctionsParams = {
  sort?: "endingSoon" | "latest";
  limit?: number;
  page?: number;
};

import { API_BASE } from "../../../lib/config";

export async function listAuctions(params: ListAuctionsParams = {}) {
  const url = new URL(`${API_BASE}/api/auctions`);
  Object.entries(params).forEach(
    ([k, v]) => v != null && url.searchParams.set(k, String(v))
  );
  const res = await fetch(url.toString(), { cache: "no-store" });
  if (!res.ok) throw new Error(`listAuctions failed: ${res.status}`);
  return res.json() as Promise<{
    total: number;
    page: number;
    limit: number;
    items: AuctionSummaryDto[];
  }>;
}

export async function createAuction(body: Partial<AuctionSummaryDto>) {
  const res = await fetch(`${API_BASE}/api/auctions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`createAuction failed: ${res.status}`);
  return res.json();
}

export async function updateAuction(
  id: number,
  body: Partial<AuctionSummaryDto>
) {
  const res = await fetch(`${API_BASE}/api/auctions/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`updateAuction failed: ${res.status}`);
  return res.json();
}

export async function deleteAuction(id: number) {
  const res = await fetch(`${API_BASE}/api/auctions/${id}`, {
    method: "DELETE",
  });
  if (!res.ok && res.status !== 204)
    throw new Error(`deleteAuction failed: ${res.status}`);
}
