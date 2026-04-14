"use client";

import { FILTER_PRESETS } from "@/lib/constants";
import type { FilterState } from "@/lib/types";
import { defaultFilters } from "@/lib/types";

export default function FilterPresets({
  activePreset,
  onSelect,
}: {
  activePreset: string | null;
  onSelect: (filters: FilterState) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {Object.entries(FILTER_PRESETS).map(([key, preset]) => {
        const isActive = activePreset === key;
        return (
          <button
            key={key}
            onClick={() => {
              if (isActive) {
                onSelect({ ...defaultFilters });
              } else {
                onSelect({
                  ...defaultFilters,
                  ...preset.params,
                  preset: key,
                });
              }
            }}
            className={`rounded-full border px-4 py-1.5 text-sm transition-all ${
              isActive
                ? "border-accent bg-accent/20 text-accent shadow-[0_0_12px_rgba(59,130,246,0.2)]"
                : "border-border text-foreground/60 hover:border-border-hover hover:text-foreground"
            }`}
            title={preset.description}
          >
            {preset.label}
          </button>
        );
      })}
    </div>
  );
}
