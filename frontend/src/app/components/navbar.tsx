"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useSession } from "../../lib/session";
import { API_BASE } from "../../lib/Config"; // <-- fixed lowercase

type CookieUser = {
  id: string;
  userName?: string | null;
  email?: string | null;
  fullName?: string | null;
};

export default function Navbar() {
  // ---- state
  const [isOpen, setIsOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [cookieUser, setCookieUser] = useState<CookieUser | null>(null);
  const [cookieLoading, setCookieLoading] = useState(false);

  // session from context
  const { user, loading, signOut } = useSession();

  // ---- routing
  const pathname = usePathname();
  const router = useRouter();
  const search = useSearchParams();
  const nextParam = useMemo(
    () => search?.get("next") || pathname || "/",
    [search, pathname]
  );
  const menuRef = useRef<HTMLDivElement | null>(null);

  // ---- close profile dropdown on outside click
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  // ---- bootstrap from server session (no redirect)
  useEffect(() => {
    // If global session already loaded & present, skip
    if (user || loading) return;

    let aborted = false;
    (async () => {
      setCookieLoading(true);
      try {
        const res = await fetch(`${API_BASE}/api/auth/session`, {
          method: "GET",
          credentials: "include",
          headers: { Accept: "application/json" },
        });
        if (aborted) return;

        if (res.ok) {
          const data = await res.json().catch(() => null);
          if (data?.user) setCookieUser(data.user as CookieUser);
        }
      } catch {
        // ignore
      } finally {
        if (!aborted) setCookieLoading(false);
      }
    })();

    return () => {
      aborted = true;
    };
  }, [user, loading]);

  const authedUser = user ?? cookieUser;
  const isAuthed = !!authedUser;

  const linkClasses = (path: string) =>
    `block px-2.5 py-1 transition-all duration-100 font-signika rounded-md ${
      pathname === path
        ? "text-black font-semibold border-b-2 border-black bg-white dark:bg-neutral-800 rounded-b-none"
        : "text-gray-600 text-sm font-allan hover:font-medium hover:scale-105 hover:text-gray-700 hover:shadow-lg"
    }`;

  const doSignOut = async () => {
    try {
      await signOut();
      setCookieUser(null); // clear local shadow session too
    } finally {
      router.refresh();
    }
  };

  // go to sell (guarded)
  const goSell = (e?: React.MouseEvent) => {
    e?.preventDefault?.();
    if (isAuthed) router.push("/sell");
    else router.push("/auth/login?next=/sell");
  };

  return (
    <nav className="bg-white border-b border-gray-200 shadow-md relative z-50">
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

          {/* Services dropdown */}
          <div className="relative group">
            <button
              className={`${linkClasses("/services")} inline-flex items-center`}
              type="button"
            >
              Services
            </button>
            <div className="absolute left-0 top-full hidden group-hover:block bg-gray-50 border mt-1 rounded w-32 z-50 before:content-[''] before:absolute before:-top-2 before:left-0 before:w-full before:h-2">
              <Link
                href="/services/buy"
                className="block px-2 py-1 text-gray-700 hover:text-blue-400 hover:scale-105 hover:shadow-lg rounded-md transition-all duration-200"
              >
                Buy
              </Link>
              {/* Sell respects auth: route to /sell if authed, else login with next */}
              <a
                href={isAuthed ? "/sell" : "/auth/login?next=/sell"}
                onClick={goSell}
                className="block px-2 py-1 text-gray-700 hover:text-blue-400 hover:scale-105 hover:shadow-lg rounded-md transition-all duration-200"
              >
                Sell
              </a>
            </div>
          </div>

          <Link href="/about" className={linkClasses("/about")}>
            About Us
          </Link>
          <Link href="/contact" className={linkClasses("/contact")}>
            Contact Us
          </Link>

          {/* Direct "Sell" in main row (guarded) */}
          <a
            href={isAuthed ? "/sell" : "/auth/login?next=/sell"}
            onClick={goSell}
            className="ml-2 px-3 py-1.5 rounded-md border border-indigo-600 text-indigo-600 hover:bg-indigo-50 transition"
          >
            Sell
          </a>

          {/* Profile / Auth */}
          <div className="relative ml-1" ref={menuRef}>
            <button
              className="flex items-center gap-1 text-gray-500 rounded-md px-2 py-1 hover:text-gray-100 hover:bg-gray-500"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Open profile menu"
              aria-expanded={menuOpen}
              aria-haspopup="menu"
              type="button"
            >
              <span className="material-symbols-outlined text-lg">
                account_circle
              </span>
              {/* hide the name while loading to avoid flicker */}
              {!loading && !cookieLoading && isAuthed && (
                <span className="ml-1 text-sm text-gray-700">
                  {authedUser?.userName || authedUser?.email || "Account"}
                </span>
              )}
            </button>

            {menuOpen && (
              <div
                className="absolute right-0 mt-2 w-48 rounded-lg border bg-white shadow-lg p-1 z-50"
                role="menu"
              >
                {isAuthed ? (
                  <>
                    <Link
                      href="/profile"
                      className="block px-3 py-2 rounded hover:bg-gray-100 text-gray-800"
                      role="menuitem"
                    >
                      Profile
                    </Link>
                    <button
                      onClick={doSignOut}
                      className="w-full text-left px-3 py-2 rounded hover:bg-gray-100 text-red-600"
                      role="menuitem"
                      type="button"
                    >
                      Sign out
                    </button>
                  </>
                ) : (
                  <div className="flex items-center justify-between gap-2 px-2 py-2">
                    <Link
                      href={`/auth/login?next=${encodeURIComponent(nextParam)}`}
                      className="text-blue-600 hover:underline"
                      role="menuitem"
                    >
                      Login
                    </Link>
                    <Link
                      href={`/auth/register?next=${encodeURIComponent(nextParam)}`}
                      className="px-3 py-1.5 rounded bg-blue-600 text-white hover:bg-blue-700"
                      role="menuitem"
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
            aria-expanded={isOpen}
            aria-controls="mobile-menu"
            type="button"
          >
            {isOpen ? "✖" : "☰"}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        id="mobile-menu"
        className={`md:hidden bg-gray-50 border-t ${
          isOpen ? "block" : "hidden"
        } rounded-md mx-4 mt-2 p-2`}
      >
        <Link href="/" className={linkClasses("/")}>
          Home
        </Link>
        <Link href="/buy" className={linkClasses("/buy")}>
          Auctions
        </Link>

        {/* Services on mobile */}
        <Link href="/services/buy" className={linkClasses("/services/buy")}>
          Buy
        </Link>
        <a
          href={isAuthed ? "/sell" : "/auth/login?next=/sell"}
          onClick={goSell}
          className={linkClasses("/sell")}
        >
          Sell
        </a>

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
                onClick={doSignOut}
                className="px-3 py-1.5 rounded border border-gray-300 hover:bg-gray-100 text-gray-700"
                type="button"
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
