"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Adbar from "./components/AdBar"; 
import Navbar from "./components/navbar";
import Footer from "./components/Footer"; // ensure this exists
import AdBar from "./components/AdBar";

export default function LayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || "";
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const inAuth = pathname.startsWith("/auth") || pathname.startsWith("/authx");

  // ✅ Show navbar everywhere (including login/register)
  const showNavbar = true;

  return (
    <>
      {mounted && showNavbar && <Navbar />}
      {children}
      <AdBar />
      <Footer />
    </>
  );
}
