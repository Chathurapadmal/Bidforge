"use client";

import { useState } from "react";
import Image from "next/image";

export default function PaymentPage() {
  // Shipping address state
  const [fullName, setFullName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setRegion] = useState("");
  const [postal, setPostal] = useState("");
  const [country, setCountry] = useState("");
  const [phone, setPhone] = useState("");

  // Card validation states
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");

  const [error, setError] = useState<string | null>(null);

  function validateShipping() {
    if (!fullName || !address || !city || !state || !postal || !country || !phone) {
      return "❌ Please complete all required shipping fields.";
    }
    // very light phone check
    if (!/^[0-9+\-\s()]{6,}$/.test(phone)) {
      return "❌ Enter a valid phone number.";
    }
    return null;
  }

  function validateCardDetails() {
    const cleanNumber = cardNumber.replace(/\s+/g, "");
    if (cleanNumber.length < 13 || cleanNumber.length > 19)
      return "❌ Invalid card number length (must be 13–19 digits)";
    if (!/^\d{2}\/\d{2}$/.test(expiry))
      return "❌ Expiry must be in MM/YY format";
    if (!/^\d{3,4}$/.test(cvc))
      return "❌ Invalid CVC (must be 3 or 4 digits)";
    return null;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const shipErr = validateShipping();
    if (shipErr) {
      setError(shipErr);
      return;
    }

    const cardErr = validateCardDetails();
    if (cardErr) {
      setError(cardErr);
      return;
    }

    setError(null);
    alert("✅ Shipping + Card details look valid (frontend checks)");
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
      <h1 className="text-4xl font-bold text-gray-900 mb-2">Card payment</h1>
      <h2 className="text-2xl font-semibold text-gray-800 mb-8">Checkout form</h2>

      {/* Middle container with strong shadow */}
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl ring-1 ring-black/5 overflow-hidden"
      >
        {/* Shipping Address (top section) */}
        <section className="p-8 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Shipping Address</h3>

          {error && (
            <p className="bg-red-100 text-red-700 border border-red-200 p-2 rounded mb-4 text-sm">
              {error}
            </p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <LabelledInput
              label="Full name"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
            <LabelledInput
              label="Phone number"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <LabelledInput
              label="Address line"
              required
              colSpan={2}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
            <LabelledInput
              label="Address line 2"
              required
              colSpan={2}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
            <LabelledInput
              label="City"
              required
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
            <LabelledInput
              label="State / Region"
              required
              value={state}
              onChange={(e) => setRegion(e.target.value)}
            />
            <LabelledInput
              label="Postal code"
              required
              value={postal}
              onChange={(e) => setPostal(e.target.value)}
            />
            <LabelledInput
              label="Country"
              required
              value={country}
              onChange={(e) => setCountry(e.target.value)}
            />
          </div>
        </section>

        {/* Payment Gateway (bottom section) */}
        <section className="flex flex-col md:flex-row">
          {/* Left Summary */}
          <div className="bg-white p-8 md:w-1/2 border-r border-gray-200">
            <h3 className="text-2xl font-semibold mb-4 text-gray-900">Amount</h3>
           <div className="mt-6 text-gray-700 space-y-2">
  <div className="flex justify-between">
    <span>Item purchased</span>
    <span>$96.00</span>
  </div>
  <div className="flex justify-between">
    <span>Shipping</span>
    <span>Free</span>
  </div>

  <div className="flex justify-between">
    <span>Tax</span>
    <span>$0.00</span>
  </div>

  <hr className="my-4 border-gray-300" />
  <div className="flex justify-between font-semibold text-gray-900">
    <span>Total payable</span>
    <span>$96.00</span>
  </div>
</div>

          </div>

          {/* Right Form */}
          <div className="p-8 md:w-1/2">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">
              Complete payment
            </h3>

            {/* Payment methods */}
            <div className="mb-6">
              <p className="text-sm font-semibold mb-2 text-gray-700">Payment methods</p>
              <div className="flex items-center gap-3">
                <Image src="/visa.png" alt="Visa" width={40} height={25} />
                <Image src="/mastercard.png" alt="Mastercard" width={40} height={25} />
              </div>
            </div>

            {/* Card details */}
            <div className="grid grid-cols-2 gap-4">
              <LabelledInput label="Cardholder name" required colSpan={2} />
              <LabelledInput
                label="Card number"
                required
                colSpan={2}
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
              />
              <LabelledInput
                label="Expiry (MM/YY)"
                required
                value={expiry}
                onChange={(e) => setExpiry(e.target.value)}
              />
              <LabelledInput
                label="CVC"
                required
                value={cvc}
                onChange={(e) => setCvc(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="mt-6 w-full bg-[#0b2b23] text-white py-3 rounded-lg font-semibold hover:bg-[#134c3a] transition-all"
            >
              Pay now
            </button>
          </div>
        </section>
      </form>

      <footer className="text-gray-500 text-sm mt-8">
        © 2025 All Rights Reserved. 
      </footer>
    </div>
  );
}

// Reusable input with label + asterisk + grid support
function LabelledInput({
  label,
  required = false,
  colSpan,
  value,
  onChange,
}: {
  label: string;
  required?: boolean;
  colSpan?: number;
  value?: string;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
}) {
  return (
    <label
      className={`text-sm font-medium text-gray-700 ${
        colSpan ? `md:col-span-${colSpan}` : ""
      }`}
    >
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={label}
        required={required}
        className="mt-1 w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-green-600 outline-none text-sm"
      />
    </label>
  );
}
