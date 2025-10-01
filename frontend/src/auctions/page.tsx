"use client";
import { useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://localhost:7168";


export default function NewAuctionPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [currentBid, setCurrentBid] = useState<string>(""); // ✅ match backend property
  const [status, setStatus] = useState<string>("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("Submitting...");

    try {
      const res = await fetch(`${API_BASE}/api/auctions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description: description || null,
          currentBid: Number(currentBid), // ✅ backend expects "currentBid"
        }),
      });

      const text = await res.text();

      if (!res.ok) throw new Error(`${res.status} ${res.statusText}: ${text}`);

      setStatus("✅ Created!\n" + text);
      setTitle("");
      setDescription("");
      setCurrentBid("");
    } catch (err: any) {
      setStatus("❌ " + err.message);
      console.error("Create failed:", err);
    }
  }

  return (
    <main className="max-w-lg mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Add Auction</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block">
          <span className="text-sm font-medium">Title</span>
          <input
            className="mt-1 w-full border rounded p-2"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="iPhone 16 Pro Max"
            required
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium">Description</span>
          <textarea
            className="mt-1 w-full border rounded p-2"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Condition, storage, color..."
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium">Start Price</span>
          <input
            className="mt-1 w-full border rounded p-2"
            type="number"
            step="0.01"
            value={currentBid}
            onChange={(e) => setCurrentBid(e.target.value)}
            placeholder="550000.00"
            required
          />
        </label>

        <button
          type="submit"
          className="px-4 py-2 rounded bg-black text-white hover:opacity-90"
        >
          Create
        </button>
      </form>

      {status && (
        <pre className="mt-4 p-3 rounded bg-gray-50 border whitespace-pre-wrap">
          {status}
        </pre>
      )}

      <p className="text-sm text-gray-500 mt-4">
        API: {API_BASE}/api/auctions
      </p>
    </main>
  );
}
