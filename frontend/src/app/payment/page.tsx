"use client";

import React from "react";
import Image from "next/image";

export default function PaymentPage() {
  return (
    <div className="min-h-screen bg-[#0b2b23] flex flex-col items-center justify-center p-6">
      <h1 className="text-4xl font-bold text-white mb-2">Card payment</h1>
      <h2 className="text-2xl font-semibold text-white mb-10">Checkout form</h2>

      <div className="bg-white rounded-3xl shadow-lg w-full max-w-5xl flex flex-col md:flex-row overflow-hidden">
        {/* Left Summary */}
        <div className="bg-white p-8 md:w-1/2 border-r border-gray-200">
          <h3 className="text-2xl font-semibold mb-4 text-gray-800">Payment gateway</h3>
          <div className="mt-6">
            <p className="text-sm text-gray-600">Subscription fee</p>
            <h2 className="text-4xl font-bold text-gray-900">$96.00 <span className="text-base font-normal text-gray-500">/month</span></h2>

            <div className="mt-6 text-gray-700 space-y-2">
              <div className="flex justify-between">
                <span>Platform basic (billed monthly)</span>
                <span>$96.00</span>
              </div>
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>$96.00</span>
              </div>
              <div className="flex justify-between">
                <span>Tax</span>
                <span>$0.00</span>
              </div>
              <hr className="my-4 border-gray-300" />
              <div className="flex justify-between font-semibold">
                <span>Total due today</span>
                <span>$96.00</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Form */}
        <div className="p-8 md:w-1/2">
          <h3 className="text-xl font-semibold text-gray-800 mb-6">Complete registration payment</h3>

          {/* Personal details */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <input type="text" placeholder="Address line" className="input" />
            <input type="text" placeholder="City" className="input" />
            <input type="text" placeholder="State" className="input" />
            <input type="text" placeholder="Postal code" className="input" />
          </div>

          {/* Payment methods */}
          <div className="mb-6">
            <p className="text-sm font-semibold mb-2 text-gray-700">Payment methods</p>
            <div className="flex items-center gap-3">
              <Image src="/visa.png" alt="Visa" width={40} height={25} />
              <Image src="/stripe.png" alt="Stripe" width={40} height={25} />
              <Image src="/paypal.png" alt="PayPal" width={40} height={25} />
              <Image src="/mastercard.png" alt="Mastercard" width={40} height={25} />
              <Image src="/gpay.png" alt="Google Pay" width={40} height={25} />
            </div>
          </div>

          {/* Card details */}
          <div className="grid grid-cols-2 gap-4">
            <input type="text" placeholder="Cardholder name" className="input col-span-2" />
            <input type="text" placeholder="Card number" className="input col-span-2" />
            <input type="text" placeholder="Expiry (MM/YY)" className="input" />
            <input type="text" placeholder="CVC" className="input" />
          </div>

          <button className="mt-6 w-full bg-[#0b2b23] text-white py-3 rounded-lg font-semibold hover:bg-[#134c3a] transition-all">
            Next
          </button>
        </div>
      </div>

      <footer className="text-gray-400 text-sm mt-8">
        © 2025 All Rights Reserved. Made by Switcher Aziz
      </footer>
    </div>
  );
}

// Tailwind custom input style
function Input({ placeholder }: { placeholder: string }) {
  return (
    <input
      type="text"
      placeholder={placeholder}
      className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-green-600 text-sm"
    />
  );
}
