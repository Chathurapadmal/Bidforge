"use client";

import Image from "next/image";

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-[#f5f5f5] flex flex-col items-center justify-start p-10 space-y-10">
      {/* ========== PROFILE DETAILS SECTION ========== */}
      <section className="w-full max-w-6xl bg-white rounded-3xl shadow-2xl ring-1 ring-gray-200 overflow-hidden p-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-gray-200 pb-6 mb-8">
          <div className="flex items-center gap-4">
            <Image
              src="/profile-avatar.png"
              alt="Profile Avatar"
              width={90}
              height={90}
              className="rounded-full border border-gray-300"
            />
            <div>
              <h1 className="text-3xl font-semibold text-gray-900">D.W.B Chamal</h1>
              <p className="text-gray-500 text-sm">BidForge Member since 2024</p>
            </div>
          </div>
          <button className="mt-4 sm:mt-0 bg-[#0b2b23] text-white px-5 py-2 rounded-lg hover:bg-[#134c3a] transition-all">
            Edit Profile
          </button>
        </div>

        {/* Profile Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Detail label="Full Name" value="H.K Mahesh" />
          <Detail label="Email" value="mahesh@example.com" />
          <Detail label="Phone" value="+94 77 123 4567" />
          <Detail
            label="Address"
            value="No. 45, Station Road, Homagama, Colombo, Sri Lanka"
          />
          <Detail label="Date of Birth" value="1999-07-20" />
          <Detail label="Joined" value="2024-03-15" />
        </div>
      </section>

      {/* ========== MY BIDS SECTION ========== */}
      <section className="w-full max-w-6xl bg-white rounded-3xl shadow-2xl ring-1 ring-gray-200 overflow-hidden p-10">
        <div className="flex items-center justify-between mb-6 border-b border-gray-200 pb-4">
          <h2 className="text-3xl font-semibold text-gray-900">My Bids</h2>
          <p className="text-gray-500 text-sm">Showing your latest bids</p>
        </div>

        {/* Example Bids */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <BidCard
            title="Toyota Allion 260 (2017)"
            price="LKR 4,250,000"
            date="Bid placed on Oct 10, 2025"
            image="/car-sample.jpg"
          />
         
        </div>
      </section>

      {/* Footer */}
      <footer className="text-gray-500 text-sm mt-6">
        © 2025 BidForge. All Rights Reserved.
      </footer>
    </div>
  );
}

// Profile detail row
function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-700 uppercase mb-1">{label}</h3>
      <p className="text-gray-800">{value}</p>
    </div>
  );
}

// Bid card component
function BidCard({
  title,
  price,
  date,
  image,
}: {
  title: string;
  price: string;
  date: string;
  image: string;
}) {
  return (
    <div className="flex items-center gap-4 border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition bg-white">
      <Image
        src={image}
        alt={title}
        width={100}
        height={100}
        className="rounded-lg object-cover"
      />
      <div className="flex-1">
        <h4 className="font-semibold text-gray-900">{title}</h4>
        <p className="text-gray-600 text-sm">{date}</p>
        <p className="text-[#0b2b23] font-bold mt-1">{price}</p>
      </div>
    </div>
  );
}
