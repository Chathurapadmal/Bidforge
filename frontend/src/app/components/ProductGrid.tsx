// components/ProductGrid.tsx (img version)
"use client";
import Link from "next/link";

type Auction = {
  id: number;
  title: string;
  image?: string | null; // absolute URL from API
};

export default function ProductGrid({ items }: { items: Auction[] }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
      {items.map((a) => (
        <Link
          key={a.id}
          href={`/auctions/${a.id}`}
          className="block border rounded-2xl p-3 bg-white hover:shadow"
        >
          <div className="w-full h-48 overflow-hidden rounded-xl bg-gray-100">
            <img
              src={a.image ?? "/placeholder.png"}
              alt={a.title}
              className="w-full h-48 object-cover"
              loading="lazy"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = "/placeholder.png";
              }}
            />
          </div>
          <div className="mt-2 font-medium line-clamp-2">{a.title}</div>
        </Link>
      ))}
    </div>
  );
}
