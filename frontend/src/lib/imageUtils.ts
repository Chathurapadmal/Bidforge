// src/lib/imageUtils.ts (or inline above your component)
export const PLACEHOLDER = "/placeholder.png";

export function toImageSrc(img?: string | null): string {
  if (!img) return PLACEHOLDER;
  let s = img.trim();
  if (!s) return PLACEHOLDER;

  try {
    s = decodeURIComponent(s);
  } catch {}

  // already absolute (http/https) — leave as-is
  if (/^https?:\/\//i.test(s)) return s;

  // already a server path
  if (s.startsWith("/images/")) return s;

  // "images/foo.jpg" → "/images/foo.jpg"
  if (s.startsWith("images/")) return `/${s}`;

  // bare filename → "/images/<filename>"
  return `/images/${encodeURIComponent(s)}`;
}
