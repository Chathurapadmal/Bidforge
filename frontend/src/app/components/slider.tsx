"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function PhotoSlider({
  images,
  autoPlayMs = 3500,
  showDots = true,
  showArrows = true,
  className = "",
}: {
  images: string[];
  autoPlayMs?: number;
  showDots?: boolean;
  showArrows?: boolean;
  className?: string;
}) {
  const [index, setIndex] = React.useState(0);
  const [direction, setDirection] = React.useState<1 | -1>(1);
  const [paused, setPaused] = React.useState(false);

  const count = images.length;

  const next = React.useCallback(() => {
    setDirection(1);
    setIndex((i) => (i + 1) % count);
  }, [count]);

  const prev = React.useCallback(() => {
    setDirection(-1);
    setIndex((i) => (i - 1 + count) % count);
  }, [count]);

  React.useEffect(() => {
    if (paused || count <= 1) return;
    const t = setInterval(next, autoPlayMs);
    return () => clearInterval(t);
  }, [next, autoPlayMs, paused, count]);

  const swipeConfidenceThreshold = 6000;
  const swipePower = (offset: number, velocity: number) => {
    return Math.abs(offset) * velocity;
  };

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border bg-white dark:bg-neutral-900 ${className}`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="relative h-64 w-full sm:h-80 md:h-96">
        <AnimatePresence initial={false} custom={direction}>
          <motion.img
            key={index}
            src={images[index]}
            alt={`Slide ${index + 1}`}
            className="absolute left-0 top-0 h-full w-full object-cover"
            custom={direction}
            initial={{ x: direction > 0 ? 80 : -80, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: direction > 0 ? -80 : 80, opacity: 0 }}
            transition={{ type: "spring", stiffness: 220, damping: 26 }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.9}
            onDragEnd={(_, { offset, velocity }) => {
              const power = swipePower(offset.x, velocity.x);
              if (power < -swipeConfidenceThreshold) {
                next();
              } else if (power > swipeConfidenceThreshold) {
                prev();
              }
            }}
          />
        </AnimatePresence>
      </div>

      {showArrows && count > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full border bg-white/70 p-2 backdrop-blur hover:bg-white dark:border-neutral-800 dark:bg-neutral-900/70"
          >
            ‹
          </button>
          <button
            onClick={next}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full border bg-white/70 p-2 backdrop-blur hover:bg-white dark:border-neutral-800 dark:bg-neutral-900/70"
          >
            ›
          </button>
        </>
      )}

      {showDots && count > 1 && (
        <div className="absolute inset-x-0 bottom-2 flex items-center justify-center gap-2">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                setDirection(i > index ? 1 : -1);
                setIndex(i);
              }}
              className={`h-2.5 w-2.5 rounded-full transition-[width] ${
                i === index
                  ? "w-6 bg-white shadow ring-1 ring-black/10 dark:bg-neutral-200"
                  : "bg-white/60 hover:bg-white"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

