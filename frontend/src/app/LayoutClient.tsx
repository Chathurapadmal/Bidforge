"use client";

import { usePathname } from "next/navigation";
import Footer from "./components/Footer";
import AdBar from "./components/AdBar";

export default function LayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const hideLayout =
    pathname.startsWith("/login") || pathname.startsWith("/register");

  return hideLayout ? (
    <>{children}</>
  ) : (
    <>
      {children}
      <AdBar />
      <Footer />
    </>
  );
}
