"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type SliderProps = {
  images: string[];
  autoPlayMs?: number;
};

export default function PhotoSlider({ images, autoPlayMs = 3000 }: SliderProps) {
  const [[index, direction], setIndex] = useState([0, 0]);
  const [ratios, setRatios] = useState<number[]>([]);

  // Preload images and compute their aspect ratios
  useEffect(() => {
    const loadImages = async () => {
      const ratioArray: number[] = await Promise.all(
        images.map(
          (src) =>
            new Promise<number>((resolve) => {
              const img = new Image();
              img.src = src;
              img.onload = () => resolve(img.height / img.width);
              img.onerror = () => resolve(0.2); // fallback ratio (5:1)
            })
        )
      );
      setRatios(ratioArray);
    };
    loadImages();
  }, [images]);

  useEffect(() => {
    if (!autoPlayMs) return;
    const interval = setInterval(() => {
      next();
    }, autoPlayMs);
    return () => clearInterval(interval);
  }, [index]);

  function next() {
    setIndex(([prev]) => [(prev + 1) % images.length, 1]);
  }

  function prev() {
    setIndex(([prev]) => [(prev - 1 + images.length) % images.length, -1]);
  }

  const currentRatio = ratios[index] || 0.2; // fallback 5:1 if ratio not loaded

  return (
    <div
      className="relative w-full overflow-hidden rounded-lg shadow"
      style={{ paddingBottom: `${currentRatio * 100}%` }}
    >
      <AnimatePresence initial={false} custom={direction}>
        <motion.img
          key={index}
          src={images[index]}
          alt={`Slide ${index + 1}`}
          className="absolute left-0 top-0 w-full h-full object-contain bg-black"
          custom={direction}
          initial={{ x: direction > 0 ? 80 : -80, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: direction > 0 ? -80 : 80, opacity: 0 }}
          transition={{ type: "spring", stiffness: 220, damping: 26 }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.9}
          onDragEnd={(_, { offset, velocity }) => {
            const power = Math.abs(offset.x) * velocity.x;
            if (power < -6000) next();
            else if (power > 6000) prev();
          }}
        />
      </AnimatePresence>

      {/* Arrows */}
      <button
        onClick={prev}
        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 text-white p-2 rounded-full hover:bg-black/60"
      >
        ‹
      </button>
      <button
        onClick={next}
        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 text-white p-2 rounded-full hover:bg-black/60"
      >
        ›
      </button>

      {/* Dots */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
        {images.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex([i, i > index ? 1 : -1])}
            className={`h-2 w-2 rounded-full ${
              i === index ? "bg-white" : "bg-gray-400"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
