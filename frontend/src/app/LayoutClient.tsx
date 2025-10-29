// src/app/LayoutClient.tsx
"use client";

import "../lib/patchRepeat";
import React from "react";
import Navbar from "./components/navbar";
import Footer from "./components/Footer";

export default function LayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  );
}
