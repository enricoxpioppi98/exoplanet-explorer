"use client";

import { useEffect } from "react";
import type { Exoplanet } from "@/lib/types";
import {
  formatRadius,
  formatMass,
  formatTemp,
  formatPeriod,
  formatDistance,
  getTempColor,
  getPlanetSizeCategory,
} from "@/lib/utils";
import SaveButton from "./SaveButton";
import SizeComparison from "./SizeComparison";
import PlanetImage from "./PlanetImage";
import NasaImage from "./NasaImage";
import CouldYouLiveHere from "./CouldYouLiveHere";
import { getHabitabilityScore, getHabitabilityColor } from "@/lib/utils";

export default function PlanetDetailModal({
  planet,
  isSaved,
  onSaveToggle,
  onClose,
}: {
  planet: Exoplanet;
  isSaved: boolean;
  onSaveToggle: () => void;
  onClose: () => void;
}) {
  const tempColor = getTempColor(planet.pl_eqt);
  const habitScore = getHabitabilityScore(planet);
  const habitColor = getHabitabilityColor(habitScore);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-border bg-background/95 backdrop-blur-md"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-start justify-between border-b border-border bg-background/95 p-6 backdrop-blur-md">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold">{planet.pl_name}</h2>
              <span
                className="rounded-full px-3 py-1 text-xs font-medium"
                style={{
                  backgroundColor: `${tempColor}20`,
                  color: tempColor,
                }}
              >
                {getPlanetSizeCategory(planet.pl_rade)}
              </span>
              <span
                className="rounded-full px-3 py-1 text-xs font-bold"
                style={{
                  backgroundColor: `${habitColor}20`,
                  color: habitColor,
                }}
              >
                Habitability: {habitScore}/100
              </span>
            </div>
            <p className="mt-1 text-foreground/50">
              Orbiting {planet.hostname}
              {planet.sy_dist ? ` \u00B7 ${formatDistance(planet.sy_dist)} away` : ""}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <SaveButton
              planetName={planet.pl_name}
              isSaved={isSaved}
              onToggle={onSaveToggle}
            />
            <button
              onClick={onClose}
              className="rounded-full p-2 transition-colors hover:bg-white/10"
              aria-label="Close"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="space-y-6 p-6">
          {/* Planet Visual + NASA Image */}
          <PlanetImage
            planetName={planet.pl_name}
            temperature={planet.pl_eqt}
            radius={planet.pl_rade}
            size="lg"
            className="rounded-xl"
          />
          <NasaImage planetName={planet.pl_name} />

          {/* Could You Live Here? + Travel Time */}
          <CouldYouLiveHere planet={planet} />

          {/* Size Comparison */}
          <SizeComparison
            planetRadius={planet.pl_rade}
            planetName={planet.pl_name}
            temperature={planet.pl_eqt}
          />

          {/* Planet Properties */}
          <Section title="Planet Properties">
            <DetailRow label="Radius" value={formatRadius(planet.pl_rade)} />
            <DetailRow label="Mass" value={formatMass(planet.pl_bmasse)} />
            <DetailRow label="Temperature" value={formatTemp(planet.pl_eqt)} />
            <DetailRow label="Density" value={planet.pl_dens != null ? `${planet.pl_dens.toFixed(2)} g/cm\u00B3` : "Unknown"} />
            <DetailRow label="Insolation" value={planet.pl_insol != null ? `${planet.pl_insol.toFixed(2)} Earth flux` : "Unknown"} />
          </Section>

          {/* Orbital Properties */}
          <Section title="Orbital Properties">
            <DetailRow label="Period" value={formatPeriod(planet.pl_orbper)} />
            <DetailRow label="Semi-major Axis" value={planet.pl_orbsmax != null ? `${planet.pl_orbsmax.toFixed(4)} AU` : "Unknown"} />
            <DetailRow label="Eccentricity" value={planet.pl_orbeccen != null ? planet.pl_orbeccen.toFixed(4) : "Unknown"} />
          </Section>

          {/* Discovery */}
          <Section title="Discovery">
            <DetailRow label="Year" value={planet.disc_year?.toString() ?? "Unknown"} />
            <DetailRow label="Method" value={planet.discoverymethod ?? "Unknown"} />
            <DetailRow label="Facility" value={planet.disc_facility ?? "Unknown"} />
          </Section>

          {/* Host Star */}
          <Section title="Host Star">
            <DetailRow label="Name" value={planet.hostname} />
            <DetailRow label="Temperature" value={planet.st_teff != null ? `${Math.round(planet.st_teff)} K` : "Unknown"} />
            <DetailRow label="Radius" value={planet.st_rad != null ? `${planet.st_rad.toFixed(3)} R\u2609` : "Unknown"} />
            <DetailRow label="Mass" value={planet.st_mass != null ? `${planet.st_mass.toFixed(3)} M\u2609` : "Unknown"} />
            <DetailRow label="Spectral Type" value={planet.st_spectype ?? "Unknown"} />
          </Section>

          {/* System */}
          <Section title="System">
            <DetailRow label="Distance" value={formatDistance(planet.sy_dist)} />
            <DetailRow label="Planets in System" value={planet.sy_pnum?.toString() ?? "Unknown"} />
          </Section>
        </div>
      </div>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-foreground/40">
        {title}
      </h3>
      <div className="grid gap-2 sm:grid-cols-2">{children}</div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-white/3 px-3 py-2">
      <span className="text-sm text-foreground/50">{label}</span>
      <span className="font-mono text-sm font-medium">{value}</span>
    </div>
  );
}
