// src/app/lib/config.ts

// Prefer the browser-exposed env var. If missing (e.g. in dev),
// fall back to localhost:5184 which is what your API is listening on.
const fallback =
  typeof window !== "undefined"
    ? `${window.location.protocol}//${window.location.hostname}:5184`
    : "http://localhost:5184";

export const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://localhost:7168";
process.env.NEXT_PUBLIC_API_BASE_URL &&
process.env.NEXT_PUBLIC_API_BASE_URL.trim().length > 0
  ? process.env.NEXT_PUBLIC_API_BASE_URL
  : fallback;
