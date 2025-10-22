// Defensive patch: make String.prototype.repeat tolerant to negative or non-finite counts.
// This avoids uncaught RangeError: Invalid count value in environments where a library
// might pass a negative computed value to repeat.
const globalAny: any =
  typeof globalThis !== "undefined"
    ? globalThis
    : typeof window !== "undefined"
      ? window
      : global;

if (globalAny && !globalAny.__stringRepeatPatched) {
  const orig = String.prototype.repeat;

  function safeRepeat(this: string, count?: number) {
    // Coerce to number and clamp to 0 for invalid/negative values
    const n = Number(count ?? 0);
    if (!Number.isFinite(n) || n <= 0) return "";
    // floor to integer like native repeat behavior for non-integers
    const intCount = Math.floor(n);
    return orig.call(this, intCount);
  }

  try {
    // replace only if not already replaced
    if (String.prototype.repeat !== safeRepeat) {
      // @ts-ignore - we intentionally overwrite the builtin
      String.prototype.repeat = safeRepeat as any;
      globalAny.__stringRepeatPatched = true;
    }
  } catch (e) {
    // If we can't overwrite (unlikely), ignore silently.
    // The original error will persist elsewhere.
  }
}

export {};
