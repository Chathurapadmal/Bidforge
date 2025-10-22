"use client";

import React, { useState } from "react";
import Image from "next/image";

export default function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", form);
  };

  return (
    <div className="container mx-auto py-8 px-4 bg-white text-gray-800">
      <h1 className="text-4xl font-bold mb-1 text-center text-black">
        Contact Us
      </h1>
      <span className="block h-0.5 w-32 bg-blue-500 rounded mx-auto mb-10"></span>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* LEFT SIDE */}
        <div className="contact-info space-y-8">
          <div>
            <a
              href="https://www.google.com/maps?q=Colombo+08+Sri+Lanka"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 transition-transform transform hover:scale-105 hover:opacity-80"
            >
              <Image src="/address.png" alt="Address" width={28} height={28} />
            </a>

            <h2 className="text-xl font-semibold mt-3 text-black">
              Head Office
            </h2>
            <p className="text-gray-700">
              6A, Fairfield Gardens, Colombo 08, Sri Lanka
            </p>
            <p className="text-gray-700">+94 11 2671465</p>
            <p className="text-gray-700">info@example.com</p>
            <p className="text-gray-600">
              Monday – Saturday, 10:00am – 5:00pm
            </p>
          </div>

          <div className="mt-6">
            <hr className="border-blue-300 mb-4" />
            <div className="flex flex-col items-start gap-4 text-gray-700">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 hover:text-blue-600 transition-transform transform hover:scale-105 hover:opacity-90"
              >
                <Image src="/facebook.png" alt="Facebook" width={28} height={28} />
                <span>Facebook</span>
              </a>

              <a
                href="https://wa.me/94771234567"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 hover:text-blue-600 transition-transform transform hover:scale-105 hover:opacity-90"
              >
                <Image src="/whatsapp.png" alt="WhatsApp" width={28} height={28} />
                <span>WhatsApp</span>
              </a>

              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 hover:text-blue-600 transition-transform transform hover:scale-105 hover:opacity-90"
              >
                <Image src="/instagram.png" alt="Instagram" width={28} height={28} />
                <span>Instagram</span>
              </a>

              <a
                href="https://linkedin.com/company/example"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 hover:text-blue-600 transition-transform transform hover:scale-105 hover:opacity-90"
              >
                <Image src="/linkedin.png" alt="LinkedIn" width={28} height={28} />
                <span>LinkedIn</span>
              </a>

              <a
                href="mailto:info@example.com"
                className="flex items-center gap-3 hover:text-blue-600 transition-transform transform hover:scale-105 hover:opacity-90"
              >
                <Image src="/email.png" alt="Email" width={28} height={28} />
                <span>Email</span>
              </a>

              <a
                href="tel:+94112671465"
                className="flex items-center gap-3 hover:text-blue-600 transition-transform transform hover:scale-105 hover:opacity-90"
              >
                <Image src="/phone.png" alt="Phone" width={28} height={28} />
                <span>Phone</span>
              </a>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE (Form) */}
        <div className="contact-form border border-gray-300 p-6 rounded-xl shadow-md bg-white hover:shadow-lg transition">
          <h2 className="text-2xl font-semibold mb-4 text-black">
            Send us a Message
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              name="name"
              placeholder="Name"
              value={form.name}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
              required
            />
            <input
              type="tel"
              name="phone"
              placeholder="Phone"
              value={form.phone}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
            />
            <input
              type="text"
              name="subject"
              placeholder="Subject"
              value={form.subject}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
            />
            <textarea
              name="message"
              placeholder="Message"
              rows={5}
              value={form.message}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
              required
            />
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-transform transform hover:scale-105"
            >
              Send Message
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
