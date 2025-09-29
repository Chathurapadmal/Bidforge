'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Tailwind classes for all links/buttons
  const linkClasses = (path: string) =>
    `block px-2.5 py-1 transition-all duration-100 font-signika rounded-md ${
      pathname === path
        ? "text-black font-semibold border-b-2 border-black bg-white dark:bg-neutral-800 rounded-b-none"
        : "text-gray-600 text-sm font-allan hover:font-medium hover:scale-105 hover:text-gray-700 hover:shadow-lg"
    }`;

  return (
    <nav className="bg-white border-b border-gray-200 shadow-md relative z-50 pt-1">
      <div className="mx-auto px-3 py-1 flex items-center justify-between">
        {/* Logo on the left */}
        <div className="flex items-center">
          <img src="/bidf.png" alt="Logo" className="h-10 w-auto" />
        </div>

        {/* Desktop menu links */}
        <div className="hidden md:flex gap-2 items-center h-8">
          <Link href="/" className={linkClasses("/")}>Home</Link>
          <Link href="/auctions" className={linkClasses("/auctions")}>Auctions</Link>

          <div className="relative group">
            {/* Services button */}
            <button className={`${linkClasses("/services")} inline-flex items-center`}>
              Services
            </button>

            {/* Dropdown menu */}
            <div className="absolute left-0 top-full hidden group-hover:block bg-gray-50 border mt-1 rounded w-32 z-50 
                            before:content-[''] before:absolute before:-top-2 before:left-0 before:w-full before:h-2">
              <Link
                href="/services/buy"
                className="block px-2 py-1 text-gray-700 hover:text-blue-400 hover:scale-105 hover:shadow-lg rounded-md transition-all duration-200"
              >
                Buy
              </Link>
              <Link
                href="/services/sell"
                className="block px-2 py-1 text-gray-700 hover:text-blue-400 hover:scale-105 hover:shadow-lg rounded-md transition-all duration-200"
              >
                Sell
              </Link>
            </div>
          </div>

          <Link href="/about" className={linkClasses("/about")}>About Us</Link>
          <Link href="/contact" className={linkClasses("/contact")}>Contact Us</Link>
          <Link href="/profile" className={linkClasses("/profile")}>
            <span className="material-symbols-outlined text-lg">account_circle</span>
          </Link>
        </div>

        {/* Mobile Hamburger */}
        <div className="md:hidden">
          <button
            className="bg-gray-300 text-gray-700 px-3 py-2 rounded-md hover:bg-gray-400 transition"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? "✖" : "☰"}
          </button>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      <div className={`md:hidden bg-gray-50 border-t ${isOpen ? 'block' : 'hidden'} rounded-md mx-4 mt-2 p-2`}>
        <Link href="/" className={linkClasses("/")}>Home</Link>
        <Link href="/auctions" className={linkClasses("/auctions")}>Auctions</Link>
        <Link href="/services/buy" className={linkClasses("/services/buy")}>Buy</Link>
        <Link href="/services/sell" className={linkClasses("/services/sell")}>Sell</Link>
        <Link href="/about" className={linkClasses("/about")}>About Us</Link>
        <Link href="/contact" className={linkClasses("/contact")}>Contact Us</Link>
        <Link href="/profile" className={linkClasses("/profile")}>
          <span className="material-symbols-outlined text-lg">account_circle</span>
        </Link>
      </div>
    </nav>
  );
}
