"use client";
import { useEffect, useState } from "react";
import { listAuctions } from "../services/api/AuctionsApi";

export function DebugAuctions() {
  const [msg, setMsg] = useState("Loading…");

  useEffect(() => {
    listAuctions({ limit: 3 })
      .then(r => setMsg(`✅ Got ${r.items.length} auctions. First: ${r.items[0]?.title ?? "n/a"}`))
      .catch(e => setMsg("❌ " + e.message));
  }, []);

  return <p className="text-sm text-gray-600">{msg}</p>;
}
