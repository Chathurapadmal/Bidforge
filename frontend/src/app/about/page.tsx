"use client";

import React from "react";
import { motion } from "framer-motion";
import PhotoSlider from "../components/slider";

export default function AboutPage() {
  return (
    <motion.div
      className="w-full bg-neutral-900 text-gray-200"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      

      {/* --- Section 2: Full-width Slider --- */}
      <section className="relative w-full py-0.5">
        <div className="[&_*]:rounded-none">
          <PhotoSlider
            images={["/slide1.jpg", "/slide2.jpg", "/slide3.jpg"]}
            autoPlayMs={3000}
          />
        </div>
      </section>

      {/* --- Section 1: About Us (motion + hover via whileHover) --- */}
      <motion.section
        className="container mx-auto py-16 px-6 text-center"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        viewport={{ once: true }}
      >
        <h1 className="text-4xl font-bold text-white">About Us</h1>
        <span className="block h-0.5 w-40 bg-amber-500 mt-2 rounded mx-auto mb-3"></span>

        <p className="text-xl leading-relaxed max-w-5xl mx-auto text-gray-300">
          <strong>BidForge</strong> is a specialized online auction platform dedicated to connecting
          buyers and sellers of spare parts from around the world. Whether you’re searching for
          automotive components, machinery spares, industrial equipment parts, or rare replacement
          items, BidForge provides a secure, transparent, and competitive marketplace where every
          transaction is built on trust. Our platform is designed to make it easier for sellers to
          reach a wide audience and for buyers to find the exact parts they need at the right price.
          With real-time bidding, detailed product listings, and a commitment to quality, BidForge
          is where deals are forged and spare parts find their new home.
        </p>
      </motion.section>
          <div className="h-0.5 bg-amber-500 rounded my-14"></div>

      {/* --- Section 3: Three feature cards with hover zoom --- */}
      <motion.section
        className="container mx-auto py-16 px-6"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        viewport={{ once: true }}
      >
        <div className="grid gap-8 md:grid-cols-3">
          {/* Card 1 */}
          <motion.div
            whileHover={{ scale: 1.03 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-6 shadow-lg shadow-black/30"
          >
            <h2 className="text-2xl md:text-3xl font-semibold text-white mb-3">
              Connecting the World of Spare Parts
            </h2>
            <span className="block h-1 w-16 bg-amber-500 rounded mb-4"></span>
            <p className="text-gray-200 leading-relaxed">
              We bridge the gap between buyers and sellers by offering a global auction
              experience that ensures fair pricing, transparency, and efficiency. Our intuitive
              platform enables smooth participation for businesses and individuals alike.
            </p>
          </motion.div>

          {/* Card 2 */}
          <motion.div
            whileHover={{ scale: 1.03 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-6 shadow-lg shadow-black/30"
          >
            <h2 className="text-2xl md:text-3xl font-semibold text-white mb-3">
              Secure, Transparent, and Reliable
            </h2>
            <span className="block h-1 w-16 bg-amber-500 rounded mb-4"></span>
            <p className="text-gray-200 leading-relaxed">
              BidForge ensures that every transaction is safe and trustworthy through verified
              listings, secure payment gateways, and clear communication between parties.
            </p>
          </motion.div>

          {/* Card 3 */}
          <motion.div
            whileHover={{ scale: 1.03 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-6 shadow-lg shadow-black/30"
          >
            <h2 className="text-2xl md:text-3xl font-semibold text-white mb-3">
              Why Choose BidForge?
            </h2>
            <span className="block h-1 w-16 bg-amber-500 rounded mb-4"></span>
            <ul className="grid grid-cols-1 gap-y-2 list-disc list-inside">
              <li>Real-time online bidding system</li>
              <li>Wide range of spare parts categories</li>
              <li>Verified sellers and buyers</li>
              <li>Transparent auction process</li>
              <li>Easy-to-use interface for quick navigation</li>
            </ul>
          </motion.div>
        </div>

        {/* Divider Line */}
        <div className="h-0.5 bg-amber-500 rounded my-14"></div>

        {/* Join Section (motion + hover via whileHover) */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          viewport={{ once: true }}
        >
          <h3 className="text-xl md:text-2xl font-semibold text-white mb-1">
            Join the BidForge Community
          </h3>
          <span className="block h-1 w-60 bg-amber-500 rounded mx-auto mb-5"></span>

          <p className="text-gray-200 max-w-3xl mx-auto leading-relaxed">
            Explore the power of global connections and competitive bidding. Whether you’re a buyer
            seeking rare components or a seller expanding your reach, BidForge is your trusted
            partner in the world of spare parts.
          </p>
        </motion.div>
      </motion.section>

      {/* --- Footer --- */}
      <footer className="bg-white text-black py-6 text-center font-semibold tracking-wide">
        Empowering Spare Parts Connections – © 2025 BidForge
      </footer>
    </motion.div>
  );
}
