"use client";

import type { Exoplanet } from "@/lib/types";
import {
  formatRadius,
  formatMass,
  formatTemp,
  formatPeriod,
  getTempColor,
  getPlanetSizeCategory,
  getHabitabilityScore,
  getHabitabilityColor,
} from "@/lib/utils";
import SaveButton from "./SaveButton";
import PlanetImage from "./PlanetImage";

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
  const habitScore = getHabitabilityScore(planet);
  const habitColor = getHabitabilityColor(habitScore);
  const isCustom = planet.pl_name.startsWith("[Custom]");

  return (
    <div
      onClick={onClick}
      className={`group relative cursor-pointer overflow-hidden rounded-2xl border backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-border-hover hover:bg-card-hover ${
        isCustom
          ? "border-amber/20 bg-amber/[0.03] hover:shadow-[0_8px_30px_-12px_rgba(245,158,11,0.15)]"
          : "border-border bg-card/50 hover:shadow-[0_8px_30px_-12px_rgba(59,130,246,0.15)]"
      }`}
    >
      {/* Planet gradient visual */}
      <PlanetImage
        planetName={planet.pl_name}
        temperature={planet.pl_eqt}
        radius={planet.pl_rade}
        size="sm"
      />

      <div className="p-5">
        {/* Header */}
        <div className="mb-3 flex items-start justify-between">
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-base font-semibold leading-tight">
              {isCustom ? planet.pl_name.replace("[Custom] ", "") : planet.pl_name}
            </h3>
            <p className="mt-0.5 truncate text-xs text-foreground/40">
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

        {/* Badges */}
        <div className="mb-3 flex flex-wrap items-center gap-1.5">
          {isCustom && (
            <span className="inline-block rounded-full bg-amber/15 px-2.5 py-0.5 text-[11px] font-bold text-amber">
              Custom
            </span>
          )}
          <span
            className="inline-block rounded-full px-2.5 py-0.5 text-[11px] font-medium"
            style={{
              backgroundColor: `${tempColor}15`,
              color: tempColor,
            }}
          >
            {sizeCategory}
          </span>
          <span
            className="inline-block rounded-full px-2.5 py-0.5 text-[11px] font-bold"
            style={{
              backgroundColor: `${habitColor}15`,
              color: habitColor,
            }}
            title="Habitability Score"
          >
            {habitScore}/100
          </span>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
          <Stat label="Radius" value={formatRadius(planet.pl_rade)} />
          <Stat label="Mass" value={formatMass(planet.pl_bmasse)} />
          <Stat label="Temp" value={formatTemp(planet.pl_eqt)} />
          <Stat label="Period" value={formatPeriod(planet.pl_orbper)} />
        </div>

        {/* Footer divider + metadata */}
        <div className="mt-3 flex items-center justify-between border-t border-white/5 pt-3 text-[11px] text-foreground/30">
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
      <p className="text-[11px] text-foreground/35">{label}</p>
      <p className="font-mono text-xs font-medium leading-tight">{value}</p>
    </div>
  );
}
