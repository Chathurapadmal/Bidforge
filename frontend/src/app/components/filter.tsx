"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export type BuyFilterState = {
  q: string;
  min: string;
  max: string;
  status: "all" | "active" | "ending" | "ended";
  badge: string;            // free text or preset
  sort: "latest" | "endingSoon" | "priceAsc" | "priceDesc";
};

export type BuyFiltersProps = {
  initial?: Partial<BuyFilterState>;
  onChange: (state: BuyFilterState) => void;
  /** Control whether we sync to the URL */
  syncToUrl?: boolean;
};

const DEFAULTS: BuyFilterState = {
  q: "",
  min: "",
  max: "",
  status: "all",
  badge: "",
  sort: "latest",
};

export default function BuyFilters({ initial, onChange, syncToUrl = true }: BuyFiltersProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  // Hydrate from URL if enabled; initial props as fallback; then defaults
  const hydrated = useMemo<BuyFilterState>(() => {
    const sp = (k: string, fallback: string) => (searchParams?.get(k) ?? fallback);
    const stParam = (searchParams?.get("status") as BuyFilterState["status"]) ?? (initial?.status ?? DEFAULTS.status);
    const sortParam = (searchParams?.get("sort") as BuyFilterState["sort"]) ?? (initial?.sort ?? DEFAULTS.sort);
    return {
      q: sp("q", initial?.q ?? DEFAULTS.q),
      min: sp("min", initial?.min ?? DEFAULTS.min),
      max: sp("max", initial?.max ?? DEFAULTS.max),
      status: stParam,
      badge: sp("badge", initial?.badge ?? DEFAULTS.badge),
      sort: sortParam,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // only run once on mount

  const [state, setState] = useState<BuyFilterState>(hydrated);

  // Debounce emit to parent (+ URL sync)
  useEffect(() => {
    const t = setTimeout(() => {
      onChange(state);
      if (!syncToUrl) return;

      const sp = new URLSearchParams();
      if (state.q) sp.set("q", state.q);
      if (state.min) sp.set("min", state.min);
      if (state.max) sp.set("max", state.max);
      if (state.badge) sp.set("badge", state.badge);
      if (state.status !== DEFAULTS.status) sp.set("status", state.status);
      if (state.sort !== DEFAULTS.sort) sp.set("sort", state.sort);

      const qs = sp.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    }, 250);
    return () => clearTimeout(t);
  }, [state, pathname, router, onChange, syncToUrl]);

  return (
    <form
      className="mb-6 grid gap-3 rounded-xl border border-gray-200 bg-white p-4 md:grid-cols-4 lg:grid-cols-6"
      onSubmit={(e) => e.preventDefault()}
    >
      {/* Search */}
      <label className="flex flex-col gap-1">
        <span className="text-xs font-medium text-gray-600">Search</span>
        <input
          className="rounded-md border border-gray-300 px-2 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Title or description…"
          value={state.q}
          onChange={(e) => setState((s) => ({ ...s, q: e.target.value }))}
        />
      </label>

      {/* Price Min */}
      <label className="flex flex-col gap-1">
        <span className="text-xs font-medium text-gray-600">Min (LKR)</span>
        <input
          className="rounded-md border border-gray-300 px-2 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
          type="number"
          min="0"
          step="1"
          placeholder="0"
          value={state.min}
          onChange={(e) => setState((s) => ({ ...s, min: e.target.value }))}
        />
      </label>

      {/* Price Max */}
      <label className="flex flex-col gap-1">
        <span className="text-xs font-medium text-gray-600">Max (LKR)</span>
        <input
          className="rounded-md border border-gray-300 px-2 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
          type="number"
          min="0"
          step="1"
          placeholder="100000"
          value={state.max}
          onChange={(e) => setState((s) => ({ ...s, max: e.target.value }))}
        />
      </label>

      {/* Status */}
      <label className="flex flex-col gap-1">
        <span className="text-xs font-medium text-gray-600">Status</span>
        <select
          className="rounded-md border border-gray-300 px-2 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
          value={state.status}
          onChange={(e) => setState((s) => ({ ...s, status: e.target.value as BuyFilterState["status"] }))}
        >
          <option value="all">All</option>
          <option value="active">Active</option>
          <option value="ending">Ending Soon</option>
          <option value="ended">Ended</option>
        </select>
      </label>

      {/* Badge (free text OR quick presets) */}
      <label className="flex flex-col gap-1">
        <span className="text-xs font-medium text-gray-600">Badge</span>
        <input
          className="rounded-md border border-gray-300 px-2 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="New / Hot / Featured"
          value={state.badge}
          onChange={(e) => setState((s) => ({ ...s, badge: e.target.value }))}
          list="badge-presets"
        />
        <datalist id="badge-presets">
          <option value="New" />
          <option value="Hot" />
          <option value="Featured" />
        </datalist>
      </label>

      {/* Sort */}
      <label className="flex flex-col gap-1 lg:col-span-2">
        <span className="text-xs font-medium text-gray-600">Sort</span>
        <select
          className="rounded-md border border-gray-300 px-2 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
          value={state.sort}
          onChange={(e) => setState((s) => ({ ...s, sort: e.target.value as BuyFilterState["sort"] }))}
        >
          <option value="latest">Latest</option>
          <option value="endingSoon">Ending Soon</option>
          <option value="priceAsc">Price: Low → High</option>
          <option value="priceDesc">Price: High → Low</option>
        </select>
      </label>

      {/* Reset */}
      <div className="md:col-span-2 lg:col-span-6">
        <button
          type="button"
          className="rounded-md border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50"
          onClick={() => setState(DEFAULTS)}
        >
          Reset Filters
        </button>
      </div>
    </form>
  );
}
