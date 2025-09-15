// src/app/page.tsx
"use client";

import { useEffect, useState } from "react";

type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
};

async function getProducts(): Promise<Product[]> {
  try {
    const API_BASE = process.env.NEXT_PUBLIC_API_BASE;
    if (!API_BASE) throw new Error("API base URL is not defined");

    const res = await fetch(`${API_BASE}/api/products?skip=0&take=12`, {
      next: { revalidate: 60 },
    });

    if (!res.ok) throw new Error("Failed to fetch products");
    return res.json();
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
}

export default function Page() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    getProducts().then(setProducts);
  }, []);

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-6">Products</h1>
      {products.length === 0 ? (
        <p>No products found.</p>
      ) : (
        <ul className="grid gap-4 md:grid-cols-3">
          {products.map((p) => (
            <li
              key={p.id}
              className="border rounded-lg p-4 shadow hover:shadow-md transition"
            >
              <h2 className="text-lg font-semibold">{p.name}</h2>
              <p className="text-gray-600">{p.description}</p>
              <p className="font-bold mt-2">${p.price}</p>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
