"use client";

import PhotoSlider from "./components/slider";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white dark:bg-neutral-900">
      {/* Slider at the top */}
      <section className="pt-1 pb-1 w-full h-[400px] relative">
        <PhotoSlider
          images={["/slide1.jpg", "/slide2.jpg", "/slide3.jpg"]}
          autoPlayMs={3000}
        />
      </section>

      {/* Example extra content */}
      <section className="p-8 text-center">
        <h1 className="text-3xl text-gray-900 dark:text-gray-100 font-bold mb-4">Welcome to Bidforge</h1>
        <p className="text-gray-600">
          Your one-stop marketplace for smart bidding.
        </p>
      </section>
    </main>
  );
}
