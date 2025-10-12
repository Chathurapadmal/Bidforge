"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-white text-gray-900">
      {/* background accents */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full blur-3xl bg-indigo-500/15" />
        <div className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full blur-3xl bg-pink-500/15" />
        <div className="absolute inset-0 opacity-[0.06] bg-[radial-gradient(circle_at_center,theme(colors.indigo.500),transparent_40%)]" />
      </div>

      <div className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl"
        >
          <span className="bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-pink-500 bg-clip-text text-transparent">
            <img src="/bidf.png" alt="bidforge" />
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mx-auto mt-4 max-w-2xl text-center text-base text-gray-600 sm:text-lg"
        >
          Sri Lanka’s slick, real-time auction hub. Discover deals, bid confidently, and win smarter.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.18 }}
          className="mt-8 flex items-center justify-center gap-3"
        >
          <Link
            href="/about"
            className="inline-flex items-center justify-center rounded-xl px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 transition"
          >
            About Us
          </Link>

          <Link
            href="/buy"
            className="inline-flex items-center justify-center rounded-xl px-5 py-2.5 text-sm font-semibold border border-gray-300 text-gray-900 hover:bg-gray-50 transition"
          >
            Browse Auctions
          </Link>
        </motion.div>

        {/* tiny metrics row */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.25 }}
          className="mx-auto mt-10 grid max-w-3xl grid-cols-3 gap-3 text-center text-sm"
        >
          <div className="rounded-xl border border-gray-200 p-3 bg-white/80 backdrop-blur">
            <div className="font-bold">24/7</div>
            <div className="text-gray-500">Live Bidding</div>
          </div>
          <div className="rounded-xl border border-gray-200 p-3 bg-white/80 backdrop-blur">
            <div className="font-bold">Secure</div>
            <div className="text-gray-500">Payments</div>
          </div>
          <div className="rounded-xl border border-gray-200 p-3 bg-white/80 backdrop-blur">
            <div className="font-bold">LKR</div>
            <div className="text-gray-500">Local Pricing</div>
          </div>
        </motion.div>
      </div>

      {/* subtle bottom divider */}

    </section>
  );
}
