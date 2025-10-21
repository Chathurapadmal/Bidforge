"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type NewAuctionResponse = {
  id: string;
  message?: string;
};

export default function NewAuctionPage() {
  const router = useRouter();

  // form state
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Vehicles");
  const [startingPrice, setStartingPrice] = useState<string>("");
  const [reservePrice, setReservePrice] = useState<string>("");
  const [startAt, setStartAt] = useState<string>(""); // ISO-local (datetime-local)
  const [endAt, setEndAt] = useState<string>("");
  const [location, setLocation] = useState<string>("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement | null>(null);

  // computed helpers
  const startDate = useMemo(() => (startAt ? new Date(startAt) : null), [startAt]);
  const endDate = useMemo(() => (endAt ? new Date(endAt) : null), [endAt]);

  function onPickFiles(files: FileList | null) {
    if (!files) return;
    const arr = Array.from(files).slice(0, 6); // max 6
    setImages((prev) => {
      const next = [...prev, ...arr].slice(0, 6);
      return next;
    });
  }

  function onDrop(e: React.DragEvent<HTMLLabelElement>) {
    e.preventDefault();
    onPickFiles(e.dataTransfer.files);
  }

  function removeImage(idx: number) {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  }

  function validate(): string | null {
    if (!title.trim()) return "Please enter a title.";
    if (!startingPrice || Number.isNaN(Number(startingPrice)) || Number(startingPrice) <= 0)
      return "Starting price must be a positive number.";
    if (reservePrice && (Number.isNaN(Number(reservePrice)) || Number(reservePrice) < 0))
      return "Reserve price must be a valid number.";
    if (!startDate) return "Please choose a start date/time.";
    if (!endDate) return "Please choose an end date/time.";
    if (startDate.getTime() < Date.now() - 60_000)
      return "Start time must be in the future.";
    if (endDate.getTime() <= startDate.getTime())
      return "End time must be after the start time.";
    if (!location.trim()) return "Please add a pickup/location.";
    if (!description.trim() || description.trim().length < 20)
      return "Description must be at least 20 characters.";
    if (images.length === 0) return "Please add at least one image.";
    return null;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    const v = validate();
    if (v) {
      setErr(v);
      return;
    }
    setSubmitting(true);

    try {
      // Build multipart form data (works with .NET, Node, etc.)
      const fd = new FormData();
      fd.append("title", title.trim());
      fd.append("category", category);
      fd.append("startingPrice", String(Number(startingPrice)));
      if (reservePrice) fd.append("reservePrice", String(Number(reservePrice)));
      fd.append("startAt", new Date(startAt).toISOString());
      fd.append("endAt", new Date(endAt).toISOString());
      fd.append("location", location.trim());
      fd.append("description", description.trim());
      images.forEach((f, i) => fd.append("images", f, f.name || `image-${i + 1}.jpg`));

      // If you have a backend, put its URL in NEXT_PUBLIC_API_URL
      const base = process.env.NEXT_PUBLIC_API_URL ?? "";
      const url =
        base
          ? `${base.replace(/\/+$/, "")}/api/seller/auctions`
          : "/api/seller/auctions"; // fallback (you can create this route later)

      // Frontend-only demo fallback: simulate success if no API exists
      const actuallyCallApi = !!process.env.NEXT_PUBLIC_API_URL;

      let resJson: NewAuctionResponse;
      if (actuallyCallApi) {
        const res = await fetch(url, { method: "POST", body: fd });
        if (!res.ok) throw new Error(await res.text());
        resJson = (await res.json()) as NewAuctionResponse;
      } else {
        // Simulate 900ms network delay + fake id
        await new Promise((r) => setTimeout(r, 900));
        resJson = { id: Math.random().toString(36).slice(2) };
      }

      setOk("Auction created successfully.");
      // Go back to seller dashboard after a short delay
      setTimeout(() => router.push("/seller"), 800);
    } catch (e: any) {
      setErr(e?.message || "Failed to create auction.");
    } finally {
      setSubmitting(false);
    }
  }

  // Better UX: set default start/end times (now + 30min, + 3 days)
  useEffect(() => {
    if (!startAt) {
      const d = new Date();
      d.setMinutes(d.getMinutes() + 30);
      setStartAt(toLocalDatetimeInputValue(d));
    }
    if (!endAt) {
      const d2 = new Date();
      d2.setDate(d2.getDate() + 3);
      setEndAt(toLocalDatetimeInputValue(d2));
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#f5f5f5] flex flex-col items-center justify-start p-10">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl ring-1 ring-gray-200 p-8 space-y-8">
        <header className="flex items-center justify-between border-b border-gray-200 pb-5">
          <h1 className="text-2xl md:text-3xl font-semibold text-gray-900">Add Auction</h1>
        </header>

        {err && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded">
            {err}
          </div>
        )}
        {ok && (
          <div className="bg-green-50 border border-green-200 text-green-700 text-sm p-3 rounded">
            {ok}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-8">
          {/* Basic info */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Field label="Title" required>
              <input
                className="input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Toyota Allion 260 (2017)"
                required
              />
            </Field>

            <Field label="Category" required>
              <select
                className="input"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
              >
                <option>Vehicles</option>
                <option>Electronics</option>
                <option>Real Estate</option>
                <option>Home & Garden</option>
                <option>Collectibles</option>
                <option>Other</option>
              </select>
            </Field>

            <Field label="Starting price (LKR)" required>
              <input
                type="number"
                inputMode="decimal"
                className="input"
                value={startingPrice}
                onChange={(e) => setStartingPrice(e.target.value)}
                placeholder="400000.00"
                min={0}
                required
              />
            </Field>

            <Field label="Reserve price (optional)">
              <input
                type="number"
                inputMode="decimal"
                className="input"
                value={reservePrice}
                onChange={(e) => setReservePrice(e.target.value)}
                placeholder="450000.00"
                min={0}
              />
            </Field>
          </section>

          {/* Timing & location */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Field label="Starts at" required>
              <input
                type="datetime-local"
                className="input"
                value={startAt}
                onChange={(e) => setStartAt(e.target.value)}
                required
              />
            </Field>
            <Field label="Ends at" required>
              <input
                type="datetime-local"
                className="input"
                value={endAt}
                onChange={(e) => setEndAt(e.target.value)}
                required
              />
            </Field>
            <Field label="Pickup / Location" required>
              <input
                className="input"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Colombo, Sri Lanka"
                required
              />
            </Field>
          </section>

          {/* Description */}
          <section>
            <Field label="Description" required>
              <textarea
                className="input min-h-[120px]"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the item clearly (condition, mileage, defects, accessories…)."
                required
              />
            </Field>
          </section>

          {/* Images */}
          <section>
            <p className="text-sm font-medium text-gray-700 mb-2">
              Photos <span className="text-red-500">*</span>{" "}
              <span className="text-gray-500 font-normal">(up to 6)</span>
            </p>

            <label
              onDragOver={(e) => e.preventDefault()}
              onDrop={onDrop}
              className="block border-2 border-dashed border-gray-300 rounded-xl p-6 text-center text-gray-600 hover:border-gray-400 cursor-pointer"
            >
              <input
                ref={inputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => onPickFiles(e.target.files)}
              />
              <div>
                <div className="text-sm">
                  Drag & drop images here, or{" "}
                  <span
                    className="text-[#0b2b23] font-semibold underline"
                    onClick={(e) => {
                      e.preventDefault();
                      inputRef.current?.click();
                    }}
                  >
                    browse
                  </span>
                </div>
                <div className="text-xs text-gray-500">PNG / JPG, up to 6 images</div>
              </div>
            </label>

            {images.length > 0 && (
              <ul className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-4">
                {images.map((f, i) => {
                  const url = URL.createObjectURL(f);
                  return (
                    <li key={i} className="relative group">
                      <img
                        src={url}
                        alt={f.name}
                        className="h-36 w-full object-cover rounded-lg border border-gray-200"
                        onLoad={() => URL.revokeObjectURL(url)}
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(i)}
                        className="absolute top-2 right-2 text-xs px-2 py-1 rounded-md bg-white/90 border border-gray-300 shadow hover:bg-red-50 hover:border-red-400"
                        aria-label="Remove image"
                      >
                        Remove
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => router.push("/seller")}
              className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-lg bg-[#0b2b23] text-white font-semibold hover:bg-[#134c3a] disabled:opacity-60"
            >
              {submitting ? "Creating…" : "Create auction"}
            </button>
          </div>
        </form>
      </div>

      <footer className="text-gray-500 text-sm mt-6">
        © 2025 BidForge. All Rights Reserved.
      </footer>
    </div>
  );
}

/** ---------- small UI helpers ---------- */

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </span>
      {/* apply Tailwind 'input' class if you use it globally; otherwise these styles: */}
      <div className="[&>input.input]:w-full [&>select.input]:w-full [&>textarea.input]:w-full" />
      {children}
    </label>
  );
}

// If you don't have a global .input class, you can add this to globals.css:
// .input { @apply w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-green-600 outline-none text-sm; }

/** Convert a Date to the value accepted by <input type="datetime-local"> in local tz */
function toLocalDatetimeInputValue(d: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  const yyyy = d.getFullYear();
  const mm = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const hh = pad(d.getHours());
  const min = pad(d.getMinutes());
  return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
}
