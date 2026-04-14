"use client";

import type { Exoplanet } from "@/lib/types";
import {
  formatRadius,
  formatMass,
  formatTemp,
  formatPeriod,
  getTempColor,
  getPlanetSizeCategory,
} from "@/lib/utils";
import SaveButton from "./SaveButton";

export default function PlanetCard({
  planet,
  isSaved,
  onSaveToggle,
  onClick,
}: {
  planet: Exoplanet;
  isSaved: boolean;
  onSaveToggle: () => void;
  onClick: () => void;
}) {
  const tempColor = getTempColor(planet.pl_eqt);
  const sizeCategory = getPlanetSizeCategory(planet.pl_rade);

  return (
    <div
      onClick={onClick}
      className="group relative cursor-pointer overflow-hidden rounded-2xl border border-border bg-card backdrop-blur-md transition-all hover:-translate-y-1 hover:border-border-hover hover:bg-card-hover"
    >
      {/* Temperature color strip */}
      <div
        className="absolute left-0 top-0 h-full w-1 rounded-l-2xl"
        style={{ backgroundColor: tempColor }}
      />

      <div className="p-5 pl-6">
        {/* Header */}
        <div className="mb-3 flex items-start justify-between">
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-lg font-semibold">{planet.pl_name}</h3>
            <p className="truncate text-sm text-foreground/50">
              {planet.hostname}
              {planet.sy_pnum && planet.sy_pnum > 1
                ? ` \u00B7 ${planet.sy_pnum} planets`
                : ""}
            </p>
          </div>
          <SaveButton
            planetName={planet.pl_name}
            isSaved={isSaved}
            onToggle={onSaveToggle}
          />
        </div>

        {/* Size category badge */}
        <div className="mb-3">
          <span
            className="inline-block rounded-full px-2.5 py-0.5 text-xs font-medium"
            style={{
              backgroundColor: `${tempColor}20`,
              color: tempColor,
            }}
          >
            {sizeCategory}
          </span>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <Stat label="Radius" value={formatRadius(planet.pl_rade)} />
          <Stat label="Mass" value={formatMass(planet.pl_bmasse)} />
          <Stat label="Temp" value={formatTemp(planet.pl_eqt)} />
          <Stat label="Period" value={formatPeriod(planet.pl_orbper)} />
        </div>

        {/* Footer */}
        <div className="mt-3 flex items-center justify-between text-xs text-foreground/40">
          <span>{planet.discoverymethod}</span>
          <span>{planet.disc_year}</span>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-foreground/40">{label}</p>
      <p className="font-mono font-medium">{value}</p>
    </div>
  );
}
