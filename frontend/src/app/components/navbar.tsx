'use client';



import { useState } from 'react';

import Link from 'next/link';

import { usePathname } from 'next/navigation';



export default function Navbar() {

  const [isOpen, setIsOpen] = useState(false);

  const pathname = usePathname();





  const linkClasses = (path: string) =>

    `block px-3 py-2 transition duration-200 font-signika rounded-md ${

      pathname === path

        ? "text-black font-semibold border-b-2 border-black bg-white dark:bg-neutral-800"

        : "text-gray-700 hover:text-black hover:shadow-lg "

    }`;



  return (

    <nav className="bg-gray-50 border-b shadow-md ">

      <div className=" mx-auto px-3 py-1 flex items-center justify-between">

        {}

        <div className="flex items-center">

          <img src="/bidf.png" alt="Logo" className="h-10 w-auto " />

        </div>



        {}

        <div className="hidden md:flex gap-2 items-center h-8">

          <Link href="/" className={linkClasses("/")} >Home</Link>

          <Link href="/auctions" className={linkClasses("/auctions")}>Auctions</Link>



          <div className="relative group">

            <button className={`${linkClasses("/services")} inline-flex items-center`}>

              Services

            </button>

            <div className="absolute hidden group-hover:block bg-gray-50 border mt-1 rounded w-32">

              <Link href=" /buy" className="block px-2 py-1 text-gray-700 hover:text-black hover:shadow-lg rounded-md">

                Buy

              </Link>

              <Link href="/sell" className="block px-2 py-1 text-gray-700 hover:text-black hover:shadow-lg rounded-md">

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



        {}

        <div className="md:hidden">

          <button

            className="bg-gray-300 text-gray-700 px-3 py-2 rounded-md hover:bg-gray-400 transition"

            onClick={() => setIsOpen(!isOpen)}

          >

            {isOpen ? "✖" : "☰"}

          </button>

        </div>

      </div>



      {}

      <div className={`md:hidden bg-gray-50 border-t ${isOpen ? 'block' : 'hidden'} rounded-md mx-4 mt-2 p-2`}>

        <Link href="/" className={linkClasses("/")}>Home</Link>

        <Link href="/auctions" className={linkClasses("/auctions")}>Auctions</Link>

        <Link href="/buy" className={linkClasses("/buy")}>Buy</Link>

        <Link href="/sell" className={linkClasses("/sell")}>Sell</Link>

        <Link href="/aboutus" className={linkClasses("/AboutUs")}>About Us</Link>

        <Link href="/contact" className={linkClasses("/contact")}>Contact Us</Link>

        <Link href="/profile" className={linkClasses("/profile")}>

          <span className="material-symbols-outlined text-lg">account_circle</span>

        </Link>

      </div>

    </nav>

  );

}


