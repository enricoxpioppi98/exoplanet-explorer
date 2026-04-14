"use client";

import type { Exoplanet } from "@/lib/types";

export default function EarthComparison({ planet }: { planet: Exoplanet }) {
  // What if Earth orbited this planet's star at this planet's distance?
  const starLum = planet.st_rad != null && planet.st_teff != null
    ? Math.pow(planet.st_rad, 2) * Math.pow(planet.st_teff / 5778, 4)
    : null;

  const orbitalPeriod = planet.pl_orbper;
  const starTemp = planet.st_teff;
  const dist = planet.sy_dist;

  // Earth's temperature at this orbit (simplified)
  // T_eq = T_star * sqrt(R_star / (2 * a)) for circular orbit
  // But simpler: use insolation ratio
  const earthTempHere = planet.pl_eqt != null
    ? Math.round(planet.pl_eqt * Math.pow(1.0 / (planet.pl_rade ?? 1), 0.5) * (planet.pl_rade != null ? 1 : 1))
    : null;

  // Simplified: what Earth's equilibrium temp would be at this insolation
  const insolation = starLum != null && planet.pl_orbsmax != null && planet.pl_orbsmax > 0
    ? starLum / Math.pow(planet.pl_orbsmax, 2)
    : null;

  const earthTempAtOrbit = insolation != null
    ? Math.round(255 * Math.pow(insolation, 0.25)) // 255K is Earth's bare equilibrium temp at 1 AU
    : null;

  const yearLength = orbitalPeriod != null
    ? orbitalPeriod < 1
      ? `${(orbitalPeriod * 24).toFixed(1)} hours`
      : orbitalPeriod < 365
        ? `${orbitalPeriod.toFixed(1)} days`
        : `${(orbitalPeriod / 365.25).toFixed(2)} years`
    : null;

  const skyColor = starTemp != null
    ? starTemp < 3500 ? "A permanent deep red twilight"
    : starTemp < 4500 ? "An orange-tinted sky"
    : starTemp < 6000 ? "Similar to Earth's blue sky"
    : starTemp < 7500 ? "A brighter, whiter sky"
    : "A brilliant blue-white sky"
    : null;

  const waterState = earthTempAtOrbit != null
    ? earthTempAtOrbit < 200 ? "Frozen solid"
    : earthTempAtOrbit < 273 ? "Mostly ice, some liquid"
    : earthTempAtOrbit < 373 ? "Liquid water possible!"
    : "Boiled away entirely"
    : null;

  if (!yearLength && !skyColor && !waterState) return null;

  return (
    <div className="rounded-2xl border border-temp-habitable/15 bg-gradient-to-b from-temp-habitable/[0.06] to-transparent p-6">
      <h3 className="text-sm font-bold uppercase tracking-widest text-temp-habitable">
        What if Earth Was Here?
      </h3>
      <p className="mt-1 mb-4 text-xs text-foreground/30">
        If Earth orbited {planet.hostname} at this planet&apos;s distance
      </p>

      <div className="grid gap-3 sm:grid-cols-2">
        {yearLength && (
          <Stat icon="&#128336;" label="A year would last" value={yearLength} />
        )}
        {skyColor && (
          <Stat icon="&#127748;" label="The sky would be" value={skyColor} />
        )}
        {waterState && (
          <Stat icon="&#128167;" label="Water on the surface" value={waterState} />
        )}
        {earthTempAtOrbit != null && (
          <Stat
            icon="&#127777;&#65039;"
            label="Earth's temperature"
            value={`${earthTempAtOrbit} K (${earthTempAtOrbit - 273}\u00B0C)`}
          />
        )}
      </div>
    </div>
  );
}

function Stat({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 rounded-xl bg-white/[0.03] px-4 py-3">
      <span className="mt-0.5 text-xl">{icon}</span>
      <div>
        <p className="text-[11px] font-medium uppercase tracking-wider text-foreground/35">{label}</p>
        <p className="text-sm font-medium leading-snug">{value}</p>
      </div>
    </div>
  );
}
