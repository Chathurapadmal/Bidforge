"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-white text-gray-900">
      {/* background accents */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full blur-3xl bg-blue-500/15" />
        <div className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full blur-3xl bg-sky-400/15" />
        <div className="absolute inset-0 opacity-[0.06] bg-[radial-gradient(circle_at_center,theme(colors.blue.500),transparent_40%)]" />
      </div>

      <div className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
        {/* 🔹 Logo Image with Hover Zoom */}
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl"
        >
          <motion.span
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="inline-block"
          >
            <img src="/bidf.png" alt="bidforge" className="-mt-10" />
          </motion.span>
        </motion.h1>

        {/* 🔹 Text and Buttons Group with Hover Zoom */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 200 }}
        >
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mx-auto mt-4 max-w-2xl text-center text-base text-gray-700 sm:text-lg"
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
              className="inline-flex items-center justify-center rounded-xl px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 hover:text-white active:bg-blue-700 transition hover:scale-[1.05]"
            >
              About Us
            </Link>

            <Link
              href="/buy"
              className="inline-flex items-center justify-center rounded-xl px-5 py-2.5 text-sm font-semibold border border-blue-500 text-gray-900 hover:border-blue-600 transition hover:scale-[1.05]"
            >
              Browse Auctions
            </Link>
          </motion.div>
        </motion.div>

        {/* 🔹 Metrics Row */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.25 }}
          className="mx-auto mt-10 grid max-w-3xl grid-cols-3 gap-3 text-center text-sm"
        >
          <div className="rounded-xl border border-gray-300 hover:border-blue-500 p-3 bg-white/80 backdrop-blur transition-transform duration-300 hover:scale-[1.05]">
            <div className="font-bold">24/7</div>
            <div className="text-gray-500">Live Bidding</div>
          </div>
          <div className="rounded-xl border border-gray-300 hover:border-blue-500 p-3 bg-white/80 backdrop-blur transition-transform duration-300 hover:scale-[1.05]">
            <div className="font-bold">Secure</div>
            <div className="text-gray-500">Payments</div>
          </div>
          <div className="rounded-xl border border-gray-300 hover:border-blue-500 p-3 bg-white/80 backdrop-blur transition-transform duration-300 hover:scale-[1.05]">
            <div className="font-bold">LKR</div>
            <div className="text-gray-500">Local Pricing</div>
          </div>
        </motion.div>

        {/* 🔹 Three Feature Cards Section (before slider) */}
        <motion.section
          className="container mx-auto pt-12 px-6"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          viewport={{ once: true }}
        >
          <div className="grid gap-6 md:grid-cols-3 max-w-7xl mx-auto">

            {/* Card 1 */}
            <motion.div
              whileHover={{ scale: 1.03 }}
              transition={{ type: 'spring', stiffness: 200 }}
              className="rounded-xl border border-gray-200 bg-white p-6 shadow-md hover:shadow-xl transition hover:border-blue-500/60 hover:shadow-blue-500/20"
            >
              <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-3">
                Connecting the World of Spare Parts
              </h2>
              <span className="block h-1 w-16 bg-blue-500 rounded mb-4"></span>
              <p className="text-gray-700 leading-relaxed">
                We bridge the gap between buyers and sellers by offering a global auction
                experience that ensures fair pricing, transparency, and efficiency. Our intuitive
                platform enables smooth participation for businesses and individuals alike.
              </p>
            </motion.div>

            {/* Card 2 */}
            <motion.div
              whileHover={{ scale: 1.03 }}
              transition={{ type: 'spring', stiffness: 200 }}
              className="rounded-xl border border-blue-300 bg-white p-6 shadow-md hover:shadow-xl transition  hover:border-blue-500/60 hover:shadow-blue-500/20"
            >
              <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-3">
                Secure, Transparent, and Reliable
              </h2>
              <span className="block h-1 w-16 bg-blue-500 rounded mb-4"></span>
              <p className="text-gray-700 leading-relaxed">
                BidForge ensures that every transaction is safe and trustworthy through verified
                listings, secure payment gateways, and clear communication between parties.
              </p>
            </motion.div>

            {/* Card 3 */}
            <motion.div
              whileHover={{ scale: 1.03 }}
              transition={{ type: 'spring', stiffness: 200 }}
              className="rounded-xl border border-gray-200 bg-white p-6 shadow-md hover:shadow-xl transition   hover:border-blue-500/60 hover:shadow-blue-500/20"
            >
              <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-3">
                Why Choose BidForge?
              </h2>
              <span className="block h-1 w-16 bg-blue-500 rounded mb-4"></span>
              <ul className="grid grid-cols-1 gap-y-2 list-disc list-inside text-gray-700">
                <li>Real-time online bidding system</li>
                <li>Wide range of spare parts categories</li>
                <li>Verified sellers and buyers</li>
                <li>Transparent auction process</li>
                <li>Easy-to-use interface for quick navigation</li>
              </ul>
            </motion.div>
          </div>
        </motion.section>
      </div>
    </section>
  );
}
