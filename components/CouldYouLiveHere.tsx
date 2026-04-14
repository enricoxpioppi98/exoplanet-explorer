"use client";

import type { Exoplanet } from "@/lib/types";
import { getSurfaceGravity, getStarColor, getTravelTime } from "@/lib/utils";

export default function CouldYouLiveHere({ planet }: { planet: Exoplanet }) {
  const gravity = getSurfaceGravity(planet.pl_bmasse, planet.pl_rade);
  const starColor = getStarColor(planet.st_teff);
  const travel = getTravelTime(planet.sy_dist);

  const earthWeight = 70;
  const earthAge = 25;

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
    <div className="space-y-5 rounded-2xl border border-accent/15 bg-gradient-to-b from-accent/[0.06] to-transparent p-6">
      <div>
        <h3 className="text-sm font-bold uppercase tracking-widest text-accent">
          Could You Live Here?
        </h3>
        <p className="mt-1 text-xs text-foreground/30">
          What life would feel like on {planet.pl_name}
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {yourWeight != null && (
          <StatItem
            emoji="&#9878;&#65039;"
            label="Your weight"
            value={`${yourWeight} kg`}
            detail={`vs ${earthWeight} kg on Earth`}
          />
        )}

        {yearFormatted != null && (
          <StatItem
            emoji="&#128197;"
            label="A year lasts"
            value={yearFormatted}
            detail={yearLength! < 1 ? "Happy birthday every day!" : undefined}
          />
        )}

        {yourAge != null && (
          <StatItem
            emoji="&#127874;"
            label="You'd be"
            value={`${yourAge} years old`}
            detail={`${earthAge} Earth years`}
          />
        )}

        <StatItem
          emoji="&#127749;"
          label="Sunrise color"
          value={starColor.label}
          detail={
            <span
              className="mt-1 inline-block h-2.5 w-12 rounded-full"
              style={{
                background: `linear-gradient(90deg, ${starColor.color}00, ${starColor.color}, ${starColor.color}00)`,
              }}
            />
          }
        />
      </div>

      {/* Travel Time */}
      {travel && (
        <div className="border-t border-white/5 pt-5">
          <h4 className="mb-3 text-xs font-semibold uppercase tracking-widest text-foreground/30">
            How Long to Get There?
          </h4>
          <div className="grid gap-2 sm:grid-cols-3">
            <TravelItem
              icon="&#9889;"
              label="Light speed"
              value={travel.light}
            />
            <TravelItem
              icon="&#128640;"
              label="Parker Probe"
              value={travel.probe}
              detail="Fastest spacecraft"
            />
            <TravelItem
              icon="&#128752;"
              label="Voyager 1"
              value={travel.voyager}
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
    <div className="flex items-start gap-3 rounded-xl bg-white/[0.03] px-4 py-3">
      <span className="mt-0.5 text-xl">{emoji}</span>
      <div>
        <p className="text-[11px] font-medium uppercase tracking-wider text-foreground/35">
          {label}
        </p>
        <p className="font-mono text-base font-semibold leading-tight">
          {value}
        </p>
        {detail && (
          <div className="mt-1 text-xs text-foreground/25">{detail}</div>
        )}
      </div>
    </div>
  );
}

function TravelItem({
  icon,
  label,
  value,
  detail,
}: {
  icon: string;
  label: string;
  value: string;
  detail?: string;
}) {
  return (
    <div className="rounded-xl bg-white/[0.03] px-4 py-3">
      <p className="text-[11px] text-foreground/35">
        {icon} {label}
      </p>
      <p className="font-mono text-sm font-bold leading-tight">{value}</p>
      {detail && <p className="mt-0.5 text-[10px] text-foreground/20">{detail}</p>}
    </div>
  );
}
