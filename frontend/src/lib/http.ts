// src/lib/http.ts
export async function getJSON<T>(
  url: string,
  init?: RequestInit
): Promise<T | null> {
  const res = await fetch(url, init);
  const text = await res.text(); // read raw once

  // Non-2xx? include body preview (so we can see server errors in the UI console)
  if (!res.ok) {
    const preview = text.slice(0, 600);
    throw new Error(`${res.status} ${res.statusText} from ${url}\n${preview}`);
  }

  // Empty body is valid for 204/HEAD; just return null so callers don't call JSON on nothing
  if (!text) return null;

  try {
    return JSON.parse(text) as T;
  } catch {
    // If server returned HTML or garbage, show first part
    const preview = text.slice(0, 200);
    throw new Error(`Invalid JSON from ${url}. First 200 chars:\n${preview}`);
  }
}

// Convenience: for DELETE endpoints that return 204
export async function del(url: string, init?: RequestInit) {
  const res = await fetch(url, { method: "DELETE", ...init });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${res.status} ${res.statusText}\n${text.slice(0, 600)}`);
  }
}
