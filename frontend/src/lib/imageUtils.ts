export const PLACEHOLDER = "/placeholder.png";

export function toImageSrc(img?: string | null): string {
  if (!img) return PLACEHOLDER;
  let s = img.trim();
  if (!s) return PLACEHOLDER;
  try {
    s = decodeURIComponent(s);
  } catch {}

  // absolute URL → return as-is
  if (/^https?:\/\//i.test(s)) {
    try {
      const u = new URL(s);
      if (u.pathname.startsWith("/images/")) return u.pathname; // prefer relative for rewrite
      return s;
    } catch {
      return s;
    }
  }

  // relative or filename
  if (s.startsWith("/images/")) return s;
  if (s.startsWith("images/")) return `/${s}`;
  return `/images/${encodeURIComponent(s)}`;
}
