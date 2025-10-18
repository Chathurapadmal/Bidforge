"use client";

import React from "react";
import PhotoSlider from "../components/slider"; // import your slider

export default function AboutPage() {
  return (
    <div className="container mx-auto py-12 px-4">
      <h1 className="text-4xl font-bold mb-6 text-center">About Us</h1>

      <div className="px-6 mx-auto text-center">
        <p className="text-lg leading-relaxed text-gray-300 mb-8">
          <strong>BidForge</strong> is a specialized online auction platform dedicated to connecting
          buyers and sellers of spare parts from around the world. Whether you’re searching for
          automotive components, machinery spares, industrial equipment parts, or rare replacement
          items, BidForge provides a secure, transparent, and competitive marketplace where every
          transaction is built on trust. Our platform is designed to make it easier for sellers to
          reach a wide audience and for buyers to find the exact parts they need at the right price.
          With real-time bidding, detailed product listings, and a commitment to quality, BidForge
          is where deals are forged and spare parts find their new home.
        </p>

        {/* --- Slider directly below the paragraph --- */}
        <div className="mt-6">
          <PhotoSlider
            images={[
              "slide1.jpg",
              "slide2.jpg",
              "slide3.jpg",
            ]}
            autoPlayMs={3000}
          />
        </div>

        {/* --- Info sections --- */}
        <div className="mt-10  space-y-10 text-left">
          <div>
            <h2 className="text-2xl p-2 font-semibold text-white-400 mb-2">
               Connecting the World of Spare Parts
            </h2>
            <p className="text-gray-300">
              We bridge the gap between buyers and sellers by offering a global auction experience
              that ensures fair pricing, transparency, and efficiency. Our intuitive platform
              enables smooth participation for businesses and individuals alike.
            </p>
          </div>

          <div>
            <h2 className="text-2xl p-2 font-semibold text-white-400 mb-2">
               Secure, Transparent, and Reliable
            </h2>
            <p className="text-gray-300">
              BidForge ensures that every transaction is safe and trustworthy through verified
              listings, secure payment gateways, and clear communication between parties.
            </p>
          </div>

          <div>
            <h2 className="text-2xl p-2 font-semibold text-white-400 mb-2">
              Why Choose BidForge?
            </h2>
           <ul className="grid grid-cols-3 gap-y-2 text-gray-300 list-disc list-inside">
  <li>Real-time online bidding system</li>
  <li>Wide range of spare parts categories</li>
  <li>Verified sellers and buyers</li>
  <li>Transparent auction process</li>
  <li>Easy-to-use interface for quick navigation</li>
</ul>

          </div>

          <div className="text-center mt-10">
            <h3 className="text-xl font-semibold text-white-400 mb-2">
              Join the BidForge Community
            </h3>
            <p className="text-gray-300">
              Explore the power of global connections and competitive bidding. Whether you’re a
              buyer seeking rare components or a seller expanding your reach, BidForge is your
              trusted partner in the world of spare parts.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
