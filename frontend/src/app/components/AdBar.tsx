"use client";

import { useEffect, useState } from "react";

const ads = [
  "🔥 Join live auctions now and grab the best deals!",
  "⚙️ Spare parts marketplace – trusted sellers worldwide.",
  "💰 Zero listing fees for sellers this month!",
  "📦 Fast delivery & secure payments on BidForge."
];

export default function AdBar() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % ads.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full bg-secondary-light dark:bg-secondary-dark text-white text-center py-2 text-sm font-medium shadow-md">
      {ads[index]}
    </div>
  );
}
