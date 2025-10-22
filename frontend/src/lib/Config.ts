// src/lib/config.ts
const ORIGIN = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "")
  .trim()
  .replace(/\/+$/, "");

export const API_BASE = ORIGIN || "";

// helper from earlier if you also need images
export function toImageSrc(img?: string | null): string {
  const PH = "/placeholder.png";
  if (!img) return PH;
  let s = String(img).trim();
  if (!s) return PH;
  try {
    s = decodeURIComponent(s);
  } catch {}
  if (/^https?:\/\//i.test(s)) return s;
  return ORIGIN ? (s.startsWith("/") ? `${ORIGIN}${s}` : `${ORIGIN}/${s}`) : s;
}
