"use client";

import PhotoSlider from "./components/slider";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gray-100">
      {/* Slider at the top */}
      <section className="w-full h-[400px] relative">
        <PhotoSlider
          images={["/slide1.jpg", "/slide2.jpg", "/slide3.jpg"]}
          autoPlayMs={3000}
        />
      </section>

      {/* Example extra content */}
      <section className="p-8 text-center">
        <h1 className="text-3xl font-bold mb-4">Welcome to Bidforge</h1>
        <p className="text-gray-600">
          Your one-stop marketplace for smart bidding.
        </p>
      </section>
    </main>
  );
}
