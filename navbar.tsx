// @ts-nocheck
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export default function Navbar() {
  // ---- state
  const [isOpen, setIsOpen] = useState(false); // mobile menu
  const [menuOpen, setMenuOpen] = useState(false); // profile dropdown
  const [user, setUser] = useState(null); // session user (if any)
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  // ---- routing
  const pathname = usePathname();
  const router = useRouter();
  const search = useSearchParams();
  const nextParam = useMemo(
    () => search?.get("next") || pathname || "/",
    [search, pathname]
  );
  const menuRef = useRef(null);

  // ---- load session from Better Auth (cookie-based)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/auth/session", {
          credentials: "include",
        });
        if (!res.ok) throw new Error(`session ${res.status}`);
        const data = await res.json();
        const u = data?.user ?? data?.session?.user ?? data?.data?.user ?? null;
        if (!cancelled) setUser(u);
      } catch (e) {
        if (!cancelled) setErr(String(e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // ---- close profile dropdown on outside click
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  const isAuthed = !!user;

  const linkClasses = (path: string) =>
    `block px-2.5 py-1 transition-all duration-100 font-signika rounded-md ${
      pathname === path
        ? "text-black font-semibold border-b-2 border-black bg-white dark:bg-neutral-800 rounded-b-none"
        : "text-gray-600 text-sm font-allan hover:font-medium hover:scale-105 hover:text-gray-700 hover:shadow-lg"
    }`;

  const signOut = async () => {
    try {
      await fetch("/api/auth/sign-out", {
        method: "POST",
        credentials: "include",
      });
    } catch {}
    setUser(null);
    router.refresh();
  };

  return (
    <nav className="bg-white border-b border-gray-200 shadow-md relative z-50 pt-1">
      <div className="mx-auto px-3 py-1 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center">
          <img src="/bidf.png" alt="Logo" className="h-10 w-auto" />
        </div>

        {/* Desktop links */}
        <div className="hidden md:flex gap-2 items-center h-8">
          <Link href="/" className={linkClasses("/")}>
            Home
          </Link>
          <Link href="/buy" className={linkClasses("/buy")}>
            Auctions
          </Link>

          {/* Services dropdown (login-gated) */}
          <div className="relative group">
            <button
              className={`${linkClasses("/services")} inline-flex items-center`}
            >
              Services
            </button>
            <div className="absolute left-0 top-full hidden group-hover:block bg-gray-50 border mt-1 rounded w-32 z-50 before:content-[''] before:absolute before:-top-2 before:left-0 before:w-full before:h-2">
              {isAuthed ? (
                <>
                  <Link
                    href="/services/buy"
                    className="block px-2 py-1 text-gray-700 hover:text-blue-400 hover:scale-105 hover:shadow-lg rounded-md transition-all duration-200"
                  >
                    Buy
                  </Link>
                  <Link
                    href="/services/sell"
                    className="block px-2 py-1 text-gray-700 hover:text-blue-400 hover:scale-105 hover:shadow-lg rounded-md transition-all duration-200"
                  >
                    Sell
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href={`/auth/login?next=${encodeURIComponent("/services/buy")}`}
                    className="block px-2 py-1 text-gray-700 hover:text-blue-400 hover:scale-105 hover:shadow-lg rounded-md transition-all duration-200"
                  >
                    Buy
                  </Link>
                  <Link
                    href={`/auth/login?next=${encodeURIComponent("/services/sell")}`}
                    className="block px-2 py-1 text-gray-700 hover:text-blue-400 hover:scale-105 hover:shadow-lg rounded-md transition-all duration-200"
                  >
                    Sell
                  </Link>
                </>
              )}
            </div>
          </div>

          <Link href="/about" className={linkClasses("/about")}>
            About Us
          </Link>
          <Link href="/contact" className={linkClasses("/contact")}>
            Contact Us
          </Link>

          {/* Profile / Auth */}
          <div className="relative" ref={menuRef}>
            <button
              className="flex items-center gap-1 rounded-md px-2 py-1 hover:bg-gray-100"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Open profile menu"
            >
              <span className="material-symbols-outlined text-lg">
                account_circle
              </span>
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-2 w-48 rounded-lg border bg-white shadow-lg p-1 z-50">
                {isAuthed ? (
                  <>
                    <Link
                      href="/profile"
                      className="block px-3 py-2 rounded hover:bg-gray-100 text-gray-800"
                    >
                      Profile
                    </Link>
                    <button
                      onClick={signOut}
                      className="w-full text-left px-3 py-2 rounded hover:bg-gray-100 text-red-600"
                    >
                      Sign out
                    </button>
                  </>
                ) : (
                  <div className="flex items-center justify-between gap-2 px-2 py-2">
                    <Link
                      href={`/auth/login?next=${encodeURIComponent(nextParam)}`}
                      className="text-blue-600 hover:underline"
                    >
                      Login
                    </Link>
                    <Link
                      href={`/auth/register?next=${encodeURIComponent(nextParam)}`}
                      className="px-3 py-1.5 rounded bg-blue-600 text-white hover:bg-blue-700"
                    >
                      Sign up
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Mobile hamburger */}
        <div className="md:hidden">
          <button
            className="bg-gray-300 text-gray-700 px-3 py-2 rounded-md hover:bg-gray-400 transition"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? "✖" : "☰"}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={`md:hidden bg-gray-50 border-t ${isOpen ? "block" : "hidden"} rounded-md mx-4 mt-2 p-2`}
      >
        <Link href="/" className={linkClasses("/")}>
          Home
        </Link>
        <Link href="/auctions" className={linkClasses("/auctions")}>
          Auctions
        </Link>

        {isAuthed ? (
          <>
            <Link href="/services/buy" className={linkClasses("/services/buy")}>
              Buy
            </Link>
            <Link
              href="/services/sell"
              className={linkClasses("/services/sell")}
            >
              Sell
            </Link>
          </>
        ) : (
          <>
            <Link
              href={`/auth/login?next=${encodeURIComponent("/services/buy")}`}
              className={linkClasses("/services/buy")}
            >
              Buy (login)
            </Link>
            <Link
              href={`/auth/login?next=${encodeURIComponent("/services/sell")}`}
              className={linkClasses("/services/sell")}
            >
              Sell (login)
            </Link>
          </>
        )}

        <Link href="/about" className={linkClasses("/about")}>
          About Us
        </Link>
        <Link href="/contact" className={linkClasses("/contact")}>
          Contact Us
        </Link>

        <div className="mt-2">
          {isAuthed ? (
            <div className="flex items-center justify-between px-2 py-1">
              <Link href="/profile" className="text-gray-700 hover:underline">
                Profile
              </Link>
              <button
                onClick={signOut}
                className="px-3 py-1.5 rounded border border-gray-300 hover:bg-gray-100 text-gray-700"
              >
                Sign out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3 px-2 py-1">
              <Link
                href={`/auth/login?next=${encodeURIComponent(nextParam)}`}
                className="text-blue-600 hover:underline"
              >
                Login
              </Link>
              <Link
                href={`/auth/register?next=${encodeURIComponent(nextParam)}`}
                className="px-3 py-1.5 rounded bg-blue-600 text-white hover:bg-blue-700"
              >
                Sign up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
