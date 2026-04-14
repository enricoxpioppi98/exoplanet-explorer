"use client";

import { useState } from "react";
import type { Exoplanet } from "@/lib/types";
import { formatRadius, formatTemp, formatDistance, getHabitabilityScore } from "@/lib/utils";

export default function ShareButton({ planet }: { planet: Exoplanet }) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const score = getHabitabilityScore(planet);
    const text = [
      `${planet.pl_name} — an exoplanet orbiting ${planet.hostname}`,
      `Radius: ${formatRadius(planet.pl_rade)} | Temp: ${formatTemp(planet.pl_eqt)} | Distance: ${formatDistance(planet.sy_dist)}`,
      `Habitability Score: ${score}/100`,
      `Discovered in ${planet.disc_year} via ${planet.discoverymethod}`,
      "",
      "Explore it on Exoplanet Explorer",
    ].join("\n");

    if (navigator.share) {
      try {
        await navigator.share({ title: planet.pl_name, text });
        return;
      } catch {
        // Fallback to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Ignore
    }
  }

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        handleShare();
      }}
      className="rounded-full p-2 text-foreground/40 transition-colors hover:bg-white/10 hover:text-foreground"
      title="Share this planet"
    >
      {copied ? (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4 text-temp-habitable">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z" />
        </svg>
      )}
    </button>
  );
}
