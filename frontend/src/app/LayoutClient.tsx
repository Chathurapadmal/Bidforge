"use client";

import { usePathname } from "next/navigation";
import Navbar from "./components/navbar";
import Footer from "./components/Footer";
import AdBar from "./components/AdBar";



export default function LayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideLayout =
    pathname.startsWith("/login") || pathname.startsWith("/register");



  return hideLayout ? (
    <>{children}</>
  ) : (
    <>
      <Navbar />
      {children}
      <AdBar />
      <Footer />
    </>
  );
}


