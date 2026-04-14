"use client";

import { getTempColor } from "@/lib/utils";

export default function SizeComparison({
  planetRadius,
  planetName,
  temperature,
}: {
  planetRadius: number | null;
  planetName: string;
  temperature: number | null;
}) {
  if (planetRadius == null) return null;

  const tempColor = getTempColor(temperature);

  // Scale: Earth = 32px diameter, planet scales relative to that
  // Clamp display between 8px and 160px for visual clarity
  const earthDiameter = 32;
  const planetDiameter = Math.max(8, Math.min(160, earthDiameter * planetRadius));
  const containerHeight = Math.max(80, planetDiameter + 40);

  const comparison =
    planetRadius < 0.9
      ? `${(planetRadius * 100).toFixed(0)}% the size of Earth`
      : planetRadius <= 1.1
        ? "Similar in size to Earth"
        : planetRadius < 2
          ? `${planetRadius.toFixed(1)}x the size of Earth`
          : `${planetRadius.toFixed(1)}x the size of Earth`;

  return (
    <div className="rounded-xl border border-border bg-white/3 p-4">
      <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-foreground/40">
        Size Comparison
      </h4>
      <div
        className="flex items-center justify-center gap-6"
        style={{ minHeight: containerHeight }}
      >
        {/* Earth */}
        <div className="flex flex-col items-center gap-2">
          <div
            className="rounded-full"
            style={{
              width: earthDiameter,
              height: earthDiameter,
              background: "radial-gradient(circle at 35% 35%, #4da6ff, #1a5276, #0a2840)",
              boxShadow: "0 0 8px rgba(77, 166, 255, 0.3)",
            }}
          />
          <span className="text-xs text-foreground/40">Earth</span>
        </div>

        {/* VS divider */}
        <span className="text-xs font-medium text-foreground/20">vs</span>

        {/* Planet */}
        <div className="flex flex-col items-center gap-2">
          <div
            className="rounded-full transition-all"
            style={{
              width: planetDiameter,
              height: planetDiameter,
              background: `radial-gradient(circle at 35% 35%, ${tempColor}, ${tempColor}88, ${tempColor}33)`,
              boxShadow: `0 0 ${Math.max(6, planetDiameter / 4)}px ${tempColor}40`,
            }}
          />
          <span className="max-w-24 truncate text-xs text-foreground/40">
            {planetName}
          </span>
        </div>
      </div>
      <p className="mt-2 text-center text-xs text-foreground/50">{comparison}</p>
    </div>
  );
}
