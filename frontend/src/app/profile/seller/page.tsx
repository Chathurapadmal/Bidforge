"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

type Auction = {
  id: string;
  title: string;
  currentBid: string;
  endsAt: string;
  image: string;
};

export default function SellerDashboardPage() {
  // Sample seller details
  const seller = {
    name: "AutoHub Traders",
    contact: "autohub@example.com",
    phone: "+94 71 555 1212",
    address: "No. 12, Main Street, Nugegoda, Colombo, Sri Lanka",
    since: "2023",
  };

  // Sample auctions state
  const [auctions, setAuctions] = useState<Auction[]>([
    {
      id: "a1",
      title: "Toyota Allion 260 (2017)",
      currentBid: "LKR 4,250,000",
      endsAt: "Ends in 2d 6h",
      image: "/car-sample.jpg",
    },
    {
      id: "a2",
      title: "Apple MacBook Air M2",
      currentBid: "LKR 410,000",
      endsAt: "Ends in 22h",
      image: "/macbook.jpg",
    },
    {
      id: "a3",
      title: "Samsung 55'' Smart TV",
      currentBid: "LKR 180,000",
      endsAt: "Ends in 3d 4h",
      image: "/tv.jpg",
    },
  ]);

  function removeAuction(id: string) {
    setAuctions((prev) => prev.filter((a) => a.id !== id));
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5] flex flex-col items-center justify-start p-10 space-y-10">
      {/* SECTION 1: Seller profile/details */}
      <section className="w-full max-w-6xl bg-white rounded-3xl shadow-2xl ring-1 ring-gray-200 overflow-hidden p-10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-gray-200 pb-6 mb-8">
          <div className="flex items-center gap-4">
            <Image
              src="/profile-avatar.png"
              alt="Seller"
              width={90}
              height={90}
              className="rounded-full border border-gray-300"
            />
            <div>
              <h1 className="text-3xl font-semibold text-gray-900">{seller.name}</h1>
              <p className="text-gray-500 text-sm">Seller on BidForge since {seller.since}</p>
            </div>
          </div>
          <Link
            href="/seller/new-auction"
            className="mt-4 sm:mt-0 bg-[#0b2b23] text-white px-5 py-2 rounded-lg hover:bg-[#134c3a] transition-all"
          >
            Add more auctions
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Detail label="Contact Email" value={seller.contact} />
          <Detail label="Phone" value={seller.phone} />
          <Detail label="Address" value={seller.address} />
        </div>
      </section>

      {/* SECTION 2: My Auctions */}
      <section className="w-full max-w-6xl bg-white rounded-3xl shadow-2xl ring-1 ring-gray-200 overflow-hidden p-10">
        <div className="flex items-center justify-between mb-6 border-b border-gray-200 pb-4">
          <h2 className="text-3xl font-semibold text-gray-900">My Auctions</h2>

          <Link
            href="/seller/new-auction"
            className="bg-[#0b2b23] text-white px-4 py-2 rounded-lg hover:bg-[#134c3a] transition-all"
          >
            Add more auctions
          </Link>
        </div>

        {auctions.length === 0 ? (
          <div className="border border-dashed border-gray-300 rounded-lg p-10 text-center text-gray-500">
            You have no active auctions. Click <strong>Add more auctions</strong> to create one.
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {auctions.map((a) => (
              <AuctionCard key={a.id} auction={a} onRemove={() => removeAuction(a.id)} />
            ))}
          </div>
        )}
      </section>

      <footer className="text-gray-500 text-sm mt-6">
        © 2025 BidForge. All Rights Reserved.
      </footer>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-700 uppercase mb-1">{label}</h3>
      <p className="text-gray-800">{value}</p>
    </div>
  );
}

function AuctionCard({
  auction,
  onRemove,
}: {
  auction: {
    title: string;
    currentBid: string;
    endsAt: string;
    image: string;
  };
  onRemove: () => void;
}) {
  return (
    <div className="flex items-center gap-4 border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition bg-white">
      <Image
        src={auction.image}
        alt={auction.title}
        width={100}
        height={100}
        className="rounded-lg object-cover"
      />
      <div className="flex-1">
        <h4 className="font-semibold text-gray-900">{auction.title}</h4>
        <p className="text-gray-600 text-sm">{auction.endsAt}</p>
        <p className="text-[#0b2b23] font-bold mt-1">{auction.currentBid}</p>
      </div>

      <button
        onClick={onRemove}
        className="text-red-600 hover:text-white border border-red-600 hover:bg-red-600 rounded-lg px-3 py-1 text-sm transition"
        aria-label="Remove auction"
      >
        Remove
      </button>
    </div>
  );
}
