'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);



  return (
    <nav className="bg-white border-b shadow-md">
      <div className="max-w-7*1 mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/bidf.png" alt="Logo" className="h-20 w-25" />
          <button className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
            <span className="text-3xl">&#9776;</span> 
          </button>
        </div>

        <div className={`md:flex gap-8 items-center ${isOpen ? 'block' : 'hidden'} md:block`}>
          <Link href="/" className="text-text-mutedLight dark:text-text-mutedDark hover:text-amber-600">Home</Link>
          <Link href="/auctions" className="text-text-mutedLight dark:text-text-mutedDark hover:text-amber-600">Auctions</Link>

          <div className="relative group">
            <button className="text-text-mutedLight dark:text-text-mutedDark hover:text-amber-600">Services</button>
            <div className="absolute hidden group-hover:block bg-white border shadow-md mt-1 rounded w-32">
              <Link href="/services/buy" className="text-text-mutedLight dark:text-text-mutedDark hover:text-amber-600">Buy</Link>
              <Link href="/services/sell" className="text-text-mutedLight dark:text-text-mutedDark">Sell</Link>
            </div>
          </div>

          <Link href="/about" className="text-text-mutedLight dark:text-text-mutedDark hover:text-amber-600">About Us</Link>
          <Link href="/contact" className="text-text-mutedLight dark:text-text-mutedDark hover:text-amber-600">Contact Us</Link>
          <Link href="/profile" className="text-text-mutedLight dark:text-text-mutedDark hover:text-amber-600">Profile</Link>
        </div>
      </div>
    </nav>
  );
}
