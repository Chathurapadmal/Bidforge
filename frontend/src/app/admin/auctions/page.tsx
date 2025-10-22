// src/app/admin/auctions/page.tsx
"use client";

import { useEffect, useState } from "react";
import { getJSON } from "../../../lib/http";

type Auction = {
  id: number;
  title: string;
  description?: string | null;
  image?: string | null;
  currentBid?: number | null;
  endTime?: string | null;
  badge?: string | null;
  createdAt: string;
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://localhost:7163";

export default function AdminAuctionsPage() {
  const [items, setItems] = useState<Auction[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await getJSON<{ items: Auction[]; total: number }>(
          `${API_BASE}/api/auctions?limit=100&sort=latest`
        );
        setItems(data?.items ?? []);
        setTotal(data?.total ?? 0);
      } catch (e: any) {
        setErr(e?.message ?? "Failed to load auctions.");
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div>Loading…</div>;
  if (err) return <pre className="text-red-600 whitespace-pre-wrap">{err}</pre>;

  return (
    <div className="p-4 space-y-3">
      <div className="text-sm text-gray-500">Total: {total}</div>
      {items.length === 0 ? (
        <div className="text-gray-600">No auctions yet.</div>
      ) : (
        <ul className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
          {items.map(a => (
            <li key={a.id} className="border rounded p-3">
              <div className="font-medium">{a.title}</div>
              {a.image ? (
                <img className="h-28 w-full object-cover mt-2" src={a.image} alt="" />
              ) : null}
              <div className="text-sm text-gray-500 mt-1">
                Bid: {a.currentBid ?? 0} • {new Date(a.createdAt).toLocaleString()}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
