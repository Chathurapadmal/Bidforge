"use client";

import { usePathname } from "next/navigation";
import Navbar from "./components/navbar";
import Footer from "./components/Footer";
import AdBar from "./components/AdBar";

export default function LayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuth = pathname.startsWith("/auth") || pathname.startsWith("/payment");

  return (
    <>
      <Navbar />

      {children}

      {!isAuth && <AdBar />}
      {!isAuth && <Footer />}
    </>
  );
}
