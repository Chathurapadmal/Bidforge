// File: src/app/admin/page.tsx
"use client";

import Link from "next/link";

export default function AdminPage() {
  const links = [
    { href: "/", label: "Home" },
    { href: "/buy", label: "Browse Auctions" },
    { href: "/sell", label: "Sell an Item" },
    { href: "/profile", label: "Your Profile" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
  ];

  return (
    <main className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold">Bidforge — Quick Links</h1>
      <p className="mt-3 text-gray-700">
        This page is now a simple public links hub. No login, no admin checks,
        no API calls.
      </p>

      <ul className="mt-6 grid sm:grid-cols-2 gap-3">
        {links.map((l) => (
          <li key={l.href}>
            <Link
              href={l.href}
              className="block border rounded-lg px-4 py-3 hover:shadow-sm transition"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>

      <section className="mt-8 border rounded-lg p-4 bg-white">
        <h2 className="text-lg font-semibold">Notes</h2>
        <ul className="list-disc ml-5 mt-2 text-sm text-gray-600">
          <li>
            All authentication, role checks, and admin endpoints were removed.
          </li>
          <li>
            If you later want to restore admin features, you can bring back the
            previous code.
          </li>
        </ul>
      </section>
    </main>
  );
}
