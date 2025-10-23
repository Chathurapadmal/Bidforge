// src/app/payment/success/page.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

export default function PaymentSuccess() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-6 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="bg-white shadow-lg rounded-2xl p-8 max-w-md w-full"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="flex justify-center mb-4"
        >
          <Image
            src="/bidf.png"
            alt="Bidforge Logo"
            width={80}
            height={80}
            className="h-12 w-auto"
          />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-2xl font-bold text-green-700 mb-2"
        >
          Payment Successful 🎉
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-gray-700 mb-4"
        >
          Your bill has been sent to your registered email.
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-gray-600 mb-6"
        >
          Thank you for using{" "}
          <span className="font-semibold text-green-700">Bidforge</span>!
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Link
            href="/"
            className="bg-green-600 text-white px-6 py-2 rounded-full hover:bg-green-700 transition-all"
          >
            Go to Home
          </Link>
        </motion.div>
      </motion.div>
    </main>
  );
}
