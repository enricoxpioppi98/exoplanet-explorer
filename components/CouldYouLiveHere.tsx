"use client";

import type { Exoplanet } from "@/lib/types";
import { getSurfaceGravity, getStarColor, getTravelTime } from "@/lib/utils";

export default function CouldYouLiveHere({ planet }: { planet: Exoplanet }) {
  const gravity = getSurfaceGravity(planet.pl_bmasse, planet.pl_rade);
  const starColor = getStarColor(planet.st_teff);
  const travel = getTravelTime(planet.sy_dist);

  const earthWeight = 70; // kg
  const earthAge = 25; // years

  const yourWeight =
    gravity != null ? Math.round(earthWeight * gravity) : null;

  const yearLength = planet.pl_orbper;
  const yourAge =
    yearLength != null && yearLength > 0
      ? ((earthAge * 365.25) / yearLength).toFixed(1)
      : null;

  const yearFormatted =
    yearLength != null
      ? yearLength < 1
        ? `${(yearLength * 24).toFixed(1)} hours`
        : yearLength < 365
          ? `${yearLength.toFixed(1)} Earth days`
          : `${(yearLength / 365.25).toFixed(1)} Earth years`
      : null;

  return (
    <div className="rounded-xl border border-accent/20 bg-accent/5 p-5">
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-accent">
        Could You Live Here?
      </h3>

      <div className="grid gap-3 sm:grid-cols-2">
        {yourWeight != null && (
          <StatItem
            emoji="&#9878;&#65039;"
            label="Your weight"
            value={`${yourWeight} kg`}
            detail={`${earthWeight} kg on Earth`}
          />
        )}

        {yearFormatted != null && (
          <StatItem
            emoji="&#128197;"
            label="A year lasts"
            value={yearFormatted}
            detail={yearLength! < 1 ? "Better bring cake often" : undefined}
          />
        )}

        {yourAge != null && (
          <StatItem
            emoji="&#127874;"
            label="You'd be"
            value={`${yourAge} years old`}
            detail={`${earthAge} Earth years = ${yourAge} planet years`}
          />
        )}

        <StatItem
          emoji="&#127749;"
          label="Sunrise color"
          value={starColor.label}
          detail={
            <span
              className="inline-block h-3 w-8 rounded-full"
              style={{ backgroundColor: starColor.color }}
            />
          }
        />
      </div>

      {/* Travel Time */}
      {travel && (
        <div className="mt-4 border-t border-white/10 pt-4">
          <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-foreground/40">
            How Long to Get There?
          </h4>
          <div className="grid gap-2 sm:grid-cols-3">
            <TravelItem
              label="At light speed"
              value={travel.light}
            />
            <TravelItem
              label="Parker Solar Probe"
              value={travel.probe}
              detail="Fastest spacecraft ever"
            />
            <TravelItem
              label="Voyager 1"
              value={travel.voyager}
              detail="61,500 km/h"
            />
          </div>
        </div>
      )}
    </div>
  );
}

function StatItem({
  emoji,
  label,
  value,
  detail,
}: {
  emoji: string;
  label: string;
  value: string;
  detail?: React.ReactNode;
}) {
  return (
    <div className="rounded-lg bg-white/3 px-3 py-2.5">
      <div className="flex items-center gap-2">
        <span className="text-lg">{emoji}</span>
        <div>
          <p className="text-xs text-foreground/40">{label}</p>
          <p className="font-mono text-sm font-semibold">{value}</p>
          {detail && (
            <p className="mt-0.5 text-xs text-foreground/30">{detail}</p>
          )}
        </div>
      </div>
    </div>
  );
}

function TravelItem({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail?: string;
}) {
  return (
    <div className="rounded-lg bg-white/3 px-3 py-2">
      <p className="text-xs text-foreground/40">{label}</p>
      <p className="font-mono text-sm font-semibold">{value}</p>
      {detail && <p className="text-[10px] text-foreground/25">{detail}</p>}
    </div>
  );
}
