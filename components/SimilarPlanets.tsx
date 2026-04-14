"use client";

import { useState, useEffect } from "react";
import type { Exoplanet } from "@/lib/types";
import {
  formatRadius,
  formatTemp,
  getTempColor,
  getHabitabilityScore,
  getHabitabilityColor,
  getPlanetColors,
} from "@/lib/utils";

export default function SimilarPlanets({
  planet,
  onSelect,
}: {
  planet: Exoplanet;
  onSelect: (p: Exoplanet) => void;
}) {
  const [similar, setSimilar] = useState<Exoplanet[]>([]);

  useEffect(() => {
    const params = new URLSearchParams({ limit: "200" });
    if (planet.pl_rade != null) {
      const min = Math.max(0.1, planet.pl_rade * 0.5);
      const max = planet.pl_rade * 2;
      params.set("radiusMin", String(min));
      params.set("radiusMax", String(max));
    }
    fetch(`/api/exoplanets?${params}`)
      .then((r) => r.json())
      .then((data) => {
        if (!Array.isArray(data)) return;
        const tRad = planet.pl_rade ?? 1;
        const tTemp = planet.pl_eqt ?? 300;
        const scored = data
          .filter((p: Exoplanet) => p.pl_name !== planet.pl_name)
          .map((p: Exoplanet) => {
            const radDiff = Math.abs((p.pl_rade ?? 1) - tRad) / Math.max(tRad, 0.1);
            const tempDiff = Math.abs((p.pl_eqt ?? 300) - tTemp) / Math.max(tTemp, 1);
            return { p, score: radDiff + tempDiff };
          })
          .sort((a: { score: number }, b: { score: number }) => a.score - b.score)
          .slice(0, 4)
          .map((x: { p: Exoplanet }) => x.p);
        setSimilar(scored);
      })
      .catch(() => {});
  }, [planet]);

  if (similar.length === 0) return null;

  return (
    <div>
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-foreground/30">
        Similar Planets
      </h3>
      <div className="grid gap-2 sm:grid-cols-2">
        {similar.map((p) => {
          const [c1] = getPlanetColors(p.pl_name, p.pl_eqt, p.pl_rade);
          const score = getHabitabilityScore(p);
          const scoreColor = getHabitabilityColor(score);
          return (
            <button
              key={p.pl_name}
              onClick={() => onSelect(p)}
              className="flex items-center gap-3 rounded-xl bg-white/[0.03] px-4 py-3 text-left transition-all hover:bg-white/[0.06]"
            >
              <div
                className="h-8 w-8 shrink-0 rounded-full"
                style={{
                  background: `radial-gradient(circle at 35% 35%, ${c1}dd, ${c1}44, transparent)`,
                }}
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{p.pl_name}</p>
                <p className="text-[11px] text-foreground/35">
                  {formatRadius(p.pl_rade)} · {formatTemp(p.pl_eqt)}
                </p>
              </div>
              <span className="text-xs font-bold" style={{ color: scoreColor }}>
                {score}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
