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
    <div className="container mx-auto py-4 px-4">
      <h1 className="text-4xl font-bold mb-10">Contact Us..</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* LEFT SIDE */}
        <div className="contact-info space-y-6">

        
          <div>
            <a
                href="https://www.google.com/maps?q=Colombo+08+Sri+Lanka"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 transition-transform transform hover:scale-105 hover:opacity-80"
              >
                <Image src="/address.png" alt="Address" width={28} height={28} />
              
              </a>

            <h2 className="text-xl font-semibold">Head Office</h2>
            <p>6A, Fairfield Gardens, Colombo 08, Sri Lanka</p>
            <p>+94 11 2671465</p>
            <p>info@example.com</p>
            <p>Monday – Saturday, 10:00am – 5:00pm</p>
          </div>

          
          <div className="mt-6">
            <hr className="border-neutral-600 mb-4" />
            <div className="flex flex-col items-start gap-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 transition-transform transform hover:scale-105 hover:opacity-80"
              >
                <Image src="/facebook.png" alt="Facebook" width={28} height={28} />
                <span>Facebook</span>
              </a>

              <a
                href="https://wa.me/94771234567"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 transition-transform transform hover:scale-105 hover:opacity-80"
              >
                <Image src="/whatsapp.png" alt="WhatsApp" width={28} height={28} />
                <span>WhatsApp</span>
              </a>

              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 transition-transform transform hover:scale-105 hover:opacity-80"
              >
                <Image src="/instagram.png" alt="Instagram" width={28} height={28} />
                <span>Instagram</span>
              </a>
 <a
                href="https://linkedin.com/company/example"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 transition-transform transform hover:scale-105 hover:opacity-80"
              >
                <Image src="/linkedin.png" alt="LinkedIn" width={28} height={28} />
                <span>LinkedIn</span>
              </a>

              <a
                href="mailto:info@example.com"
                className="flex items-center gap-3 transition-transform transform hover:scale-105 hover:opacity-80"
              >
                <Image src="/email.png" alt="Email" width={28} height={28} />
                <span>Email</span>
              </a>

              
             
              <a
                href="tel:+94112671465"
                className="flex items-center gap-3 transition-transform transform hover:scale-105 hover:opacity-80"
              >
                <Image src="/phone.png" alt="Phone" width={28} height={28} />
                <span>Phone</span>
              </a>
            </div>
          </div>
        </div>
        


        {/* RIGHT SIDE (Form) */}
        <div className="contact-form border p-4 rounded-lg">
          <h2 className="text-2xl font-semibold mb-4">Send us a Message</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              name="name"
              placeholder="Name"
              value={form.name}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              required
            />
            <input
              type="tel"
              name="phone"
              placeholder="Phone"
              value={form.phone}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            />
            <input
              type="text"
              name="subject"
              placeholder="Subject"
              value={form.subject}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            />
            <textarea
              name="message"np
              placeholder="Message"
              rows={5}
              value={form.message}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              required
            />
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
