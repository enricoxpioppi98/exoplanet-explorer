"use client";

import type { Exoplanet } from "@/lib/types";
import {
  formatRadius,
  formatMass,
  formatTemp,
  formatPeriod,
  formatDistance,
  getHabitabilityScore,
  getHabitabilityColor,
  getTempColor,
  getPlanetColors,
} from "@/lib/utils";

export default function PlanetComparison({
  planetA,
  planetB,
  onClose,
}: {
  planetA: Exoplanet;
  planetB: Exoplanet;
  onClose: () => void;
}) {
  const rows: { label: string; a: string; b: string }[] = [
    { label: "Radius", a: formatRadius(planetA.pl_rade), b: formatRadius(planetB.pl_rade) },
    { label: "Mass", a: formatMass(planetA.pl_bmasse), b: formatMass(planetB.pl_bmasse) },
    { label: "Temperature", a: formatTemp(planetA.pl_eqt), b: formatTemp(planetB.pl_eqt) },
    { label: "Orbital Period", a: formatPeriod(planetA.pl_orbper), b: formatPeriod(planetB.pl_orbper) },
    { label: "Distance", a: formatDistance(planetA.sy_dist), b: formatDistance(planetB.sy_dist) },
    { label: "Discovery", a: `${planetA.disc_year ?? "?"} (${planetA.discoverymethod ?? "?"})`, b: `${planetB.disc_year ?? "?"} (${planetB.discoverymethod ?? "?"})` },
    { label: "Host Star", a: planetA.hostname, b: planetB.hostname },
  ];

  const scoreA = getHabitabilityScore(planetA);
  const scoreB = getHabitabilityScore(planetB);
  const colorA = getHabitabilityColor(scoreA);
  const colorB = getHabitabilityColor(scoreB);
  const [cA1] = getPlanetColors(planetA.pl_name, planetA.pl_eqt, planetA.pl_rade);
  const [cB1] = getPlanetColors(planetB.pl_name, planetB.pl_eqt, planetB.pl_rade);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
      <div
        className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-border bg-background/95 shadow-2xl backdrop-blur-md"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/5 px-6 py-5">
          <h2 className="text-lg font-bold">Planet Comparison</h2>
          <button onClick={onClose} className="rounded-full p-2 text-foreground/40 hover:bg-white/10 hover:text-foreground">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-6 py-6">
          {/* Planet headers */}
          <div className="mb-6 grid grid-cols-[1fr_1fr] gap-4">
            <PlanetHeader name={planetA.pl_name} color={cA1} score={scoreA} scoreColor={colorA} />
            <PlanetHeader name={planetB.pl_name} color={cB1} score={scoreB} scoreColor={colorB} />
          </div>

          {/* Comparison rows */}
          <div className="space-y-1.5">
            {rows.map((row) => (
              <div key={row.label} className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 rounded-lg bg-white/[0.02] px-4 py-2.5">
                <span className="text-right font-mono text-sm">{row.a}</span>
                <span className="text-[11px] font-medium uppercase tracking-wider text-foreground/30">{row.label}</span>
                <span className="font-mono text-sm">{row.b}</span>
              </div>
            ))}
          </div>

          {/* Habitability comparison bar */}
          <div className="mt-6 rounded-xl bg-white/[0.03] p-5">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-foreground/30">
              Habitability Score
            </h3>
            <div className="space-y-3">
              <ScoreBar name={planetA.pl_name} score={scoreA} color={colorA} />
              <ScoreBar name={planetB.pl_name} score={scoreB} color={colorB} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PlanetHeader({ name, color, score, scoreColor }: { name: string; color: string; score: number; scoreColor: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-white/[0.03] px-4 py-3">
      <div className="h-10 w-10 shrink-0 rounded-full" style={{
        background: `radial-gradient(circle at 35% 35%, ${color}dd, ${color}44, transparent)`,
      }} />
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold">{name}</p>
        <p className="text-xs font-bold" style={{ color: scoreColor }}>{score}/100</p>
      </div>
    </div>
  );
}

function ScoreBar({ name, score, color }: { name: string; score: number; color: string }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="text-foreground/40">{name}</span>
        <span className="font-bold" style={{ color }}>{score}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/5">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${score}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}
