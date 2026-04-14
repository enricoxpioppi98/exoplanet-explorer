"use client";

import { DISCOVERY_METHODS } from "@/lib/constants";
import type { FilterState } from "@/lib/types";

export default function SearchFilters({
  filters,
  onChange,
  onClear,
}: {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  onClear: () => void;
}) {
  function update(partial: Partial<FilterState>) {
    onChange({ ...filters, ...partial, preset: null });
  }

  const hasFilters =
    filters.method ||
    filters.yearMin ||
    filters.yearMax ||
    filters.radiusMin ||
    filters.radiusMax ||
    filters.tempMin ||
    filters.tempMax ||
    filters.habitMin;

  return (
    <div className="space-y-4">
      {/* Discovery Method */}
      <div>
        <label className="mb-1.5 block text-xs font-medium text-foreground/50">
          Discovery Method
        </label>
        <select
          value={filters.method}
          onChange={(e) => update({ method: e.target.value })}
          className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm outline-none transition-colors focus:border-accent"
        >
          <option value="">All methods</option>
          {DISCOVERY_METHODS.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </div>

      {/* Year Range */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-foreground/50">
            Year Min
          </label>
          <input
            type="number"
            placeholder="1992"
            value={filters.yearMin}
            onChange={(e) => update({ yearMin: e.target.value })}
            className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm outline-none transition-colors focus:border-accent"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-foreground/50">
            Year Max
          </label>
          <input
            type="number"
            placeholder="2026"
            value={filters.yearMax}
            onChange={(e) => update({ yearMax: e.target.value })}
            className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm outline-none transition-colors focus:border-accent"
          />
        </div>
      </div>

      {/* Radius Range */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-foreground/50">
            Radius Min (R&#8853;)
          </label>
          <input
            type="number"
            step="0.1"
            placeholder="0.3"
            value={filters.radiusMin}
            onChange={(e) => update({ radiusMin: e.target.value })}
            className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm outline-none transition-colors focus:border-accent"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-foreground/50">
            Radius Max (R&#8853;)
          </label>
          <input
            type="number"
            step="0.1"
            placeholder="87"
            value={filters.radiusMax}
            onChange={(e) => update({ radiusMax: e.target.value })}
            className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm outline-none transition-colors focus:border-accent"
          />
        </div>
      </div>

      {/* Temperature Range */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-foreground/50">
            Temp Min (K)
          </label>
          <input
            type="number"
            placeholder="34"
            value={filters.tempMin}
            onChange={(e) => update({ tempMin: e.target.value })}
            className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm outline-none transition-colors focus:border-accent"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-foreground/50">
            Temp Max (K)
          </label>
          <input
            type="number"
            placeholder="4050"
            value={filters.tempMax}
            onChange={(e) => update({ tempMax: e.target.value })}
            className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm outline-none transition-colors focus:border-accent"
          />
        </div>
      </div>

      {/* Habitability Score */}
      <div>
        <label className="mb-1.5 block text-xs font-medium text-foreground/50">
          Min Habitability Score
        </label>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min="0"
            max="90"
            step="10"
            value={filters.habitMin || "0"}
            onChange={(e) =>
              update({ habitMin: e.target.value === "0" ? "" : e.target.value })
            }
            className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-accent"
          />
          <span className="w-8 text-right font-mono text-xs text-foreground/60">
            {filters.habitMin || "0"}
          </span>
        </div>
      </div>

      {hasFilters && (
        <button
          onClick={onClear}
          className="w-full rounded-lg border border-border px-3 py-2 text-sm text-foreground/50 transition-colors hover:bg-white/5 hover:text-foreground"
        >
          Clear Filters
        </button>
      )}
    </div>
  );
}
