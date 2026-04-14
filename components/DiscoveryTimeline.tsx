"use client";

import { useState, useEffect } from "react";

export default function DiscoveryTimeline() {
  const [data, setData] = useState<{ year: number; count: number }[]>([]);

  useEffect(() => {
    fetch("/api/exoplanets?limit=200")
      .then((r) => r.json())
      .then((planets) => {
        if (!Array.isArray(planets)) return;
        const counts = new Map<number, number>();
        for (const p of planets) {
          const y = p.disc_year;
          if (y != null) counts.set(y, (counts.get(y) ?? 0) + 1);
        }
        const sorted = Array.from(counts.entries())
          .map(([year, count]) => ({ year, count }))
          .sort((a, b) => a.year - b.year);
        setData(sorted);
      })
      .catch(() => {});
  }, []);

  if (data.length === 0) return null;

  const maxCount = Math.max(...data.map((d) => d.count));

  return (
    <div>
      <div className="mb-4 text-center">
        <h2 className="text-2xl font-bold">Discovery Timeline</h2>
        <p className="mt-2 text-sm text-foreground/40">
          Exoplanet discoveries by year
        </p>
      </div>
      <div className="rounded-2xl border border-border bg-card/50 p-6 backdrop-blur-md">
        <div className="flex items-end gap-[3px] sm:gap-1" style={{ height: 160 }}>
          {data.map((d) => {
            const height = (d.count / maxCount) * 100;
            return (
              <div
                key={d.year}
                className="group relative flex-1 cursor-default"
                style={{ height: "100%" }}
              >
                <div
                  className="absolute bottom-0 w-full rounded-t-sm bg-accent/60 transition-all duration-300 hover:bg-accent"
                  style={{ height: `${height}%`, minHeight: 2 }}
                />
                {/* Tooltip */}
                <div className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 rounded-lg bg-background/95 px-2.5 py-1.5 text-center opacity-0 shadow-lg ring-1 ring-white/10 transition-opacity group-hover:opacity-100">
                  <p className="text-xs font-bold">{d.count}</p>
                  <p className="text-[10px] text-foreground/40">{d.year}</p>
                </div>
              </div>
            );
          })}
        </div>
        {/* X-axis labels */}
        <div className="mt-2 flex justify-between text-[10px] text-foreground/25">
          <span>{data[0]?.year}</span>
          <span>{data[Math.floor(data.length / 2)]?.year}</span>
          <span>{data[data.length - 1]?.year}</span>
        </div>
      </div>
    </div>
  );
}
