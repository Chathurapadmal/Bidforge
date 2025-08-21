'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-white border-b shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/bidf.png" alt="Logo" className="h-8 w-8" />
          <button className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
            <span className="text-3xl">&#9776;</span> 
          </button>
        </div>

        <div className={`md:flex gap-8 items-center ${isOpen ? 'block' : 'hidden'} md:block`}>
          <Link href="/" className="hover:text-blue-600">Home</Link>
          <Link href="/auctions" className="hover:text-blue-600">Auctions</Link>

          <div className="relative group">
            <button className="hover:text-blue-600">Services</button>
            <div className="absolute hidden group-hover:block bg-white border shadow-md mt-1 rounded w-32">
              <Link href="/services/buy" className="block px-4 py-2 hover:bg-blue-100">Buy</Link>
              <Link href="/services/sell" className="block px-4 py-2 hover:bg-blue-100">Sell</Link>
            </div>
          </div>

          <Link href="/about" className="hover:text-blue-600">About Us</Link>
          <Link href="/contact" className="hover:text-blue-600">Contact Us</Link>
          <Link href="/profile" className="hover:text-blue-600">Profile</Link>
        </div>
      </div>
    </nav>
  );
}
