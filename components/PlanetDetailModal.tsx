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
  getHabitabilityScore,
  getHabitabilityColor,
} from "@/lib/utils";
import SaveButton from "./SaveButton";
import SizeComparison from "./SizeComparison";
import PlanetImage from "./PlanetImage";
import NasaImage from "./NasaImage";
import CouldYouLiveHere from "./CouldYouLiveHere";
import SimilarPlanets from "./SimilarPlanets";
import ShareButton from "./ShareButton";
import EarthComparison from "./EarthComparison";
import OrbitSimulator from "./OrbitSimulator";
import SystemView from "./SystemView";

export default function PlanetDetailModal({
  planet,
  isSaved,
  onSaveToggle,
  onClose,
  onSelectPlanet,
  onCompare,
}: {
  planet: Exoplanet;
  isSaved: boolean;
  onSaveToggle: () => void;
  onClose: () => void;
  onSelectPlanet?: (p: Exoplanet) => void;
  onCompare?: (p: Exoplanet) => void;
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-border bg-background/95 shadow-2xl shadow-black/50 backdrop-blur-md"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 border-b border-white/5 bg-background/95 px-6 py-5 backdrop-blur-md sm:px-8">
          <div className="flex items-start justify-between">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2.5">
                <h2 className="text-2xl font-bold tracking-tight">{planet.pl_name}</h2>
                <span
                  className="shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-medium"
                  style={{ backgroundColor: `${tempColor}15`, color: tempColor }}
                >
                  {getPlanetSizeCategory(planet.pl_rade)}
                </span>
                <span
                  className="shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-bold"
                  style={{ backgroundColor: `${habitColor}15`, color: habitColor }}
                >
                  {habitScore}/100
                </span>
              </div>
              <p className="mt-1.5 text-sm text-foreground/40">
                Orbiting {planet.hostname}
                {planet.sy_dist ? ` \u00B7 ${formatDistance(planet.sy_dist)} away` : ""}
              </p>
            </div>
            <div className="ml-4 flex shrink-0 items-center gap-1">
              <ShareButton planet={planet} />
              {onCompare && (
                <button
                  onClick={() => onCompare(planet)}
                  className="rounded-full p-2 text-foreground/40 transition-colors hover:bg-white/10 hover:text-foreground"
                  title="Compare with another planet"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
                  </svg>
                </button>
              )}
              <SaveButton
                planetName={planet.pl_name}
                isSaved={isSaved}
                onToggle={onSaveToggle}
              />
              <button
                onClick={onClose}
                className="rounded-full p-2 text-foreground/40 transition-colors hover:bg-white/10 hover:text-foreground"
                aria-label="Close"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-8 px-6 py-6 sm:px-8">
          {/* Planet Visual */}
          <PlanetImage
            planetName={planet.pl_name}
            temperature={planet.pl_eqt}
            radius={planet.pl_rade}
            size="lg"
            className="rounded-2xl"
          />

          {/* NASA Image (if available) */}
          <NasaImage planetName={planet.pl_name} />

          {/* Could You Live Here? + Travel Time */}
          <CouldYouLiveHere planet={planet} />

          {/* Size Comparison */}
          <SizeComparison
            planetRadius={planet.pl_rade}
            planetName={planet.pl_name}
            temperature={planet.pl_eqt}
          />

          {/* Orbit Simulator */}
          <OrbitSimulator planet={planet} />

          {/* System View (for multi-planet systems) */}
          {onSelectPlanet && (
            <SystemView
              hostname={planet.hostname}
              currentPlanet={planet.pl_name}
              onSelect={onSelectPlanet}
            />
          )}

          {/* What if Earth Was Here? */}
          <EarthComparison planet={planet} />

          {/* Similar Planets */}
          {onSelectPlanet && (
            <SimilarPlanets planet={planet} onSelect={onSelectPlanet} />
          )}

          {/* Data Sections */}
          <div className="space-y-6">
            <Section title="Planet Properties">
              <DetailRow label="Radius" value={formatRadius(planet.pl_rade)} />
              <DetailRow label="Mass" value={formatMass(planet.pl_bmasse)} />
              <DetailRow label="Temperature" value={formatTemp(planet.pl_eqt)} />
              <DetailRow label="Density" value={planet.pl_dens != null ? `${planet.pl_dens.toFixed(2)} g/cm\u00B3` : "Unknown"} />
              <DetailRow label="Insolation" value={planet.pl_insol != null ? `${planet.pl_insol.toFixed(2)} Earth flux` : "Unknown"} />
            </Section>

            <Section title="Orbital Properties">
              <DetailRow label="Period" value={formatPeriod(planet.pl_orbper)} />
              <DetailRow label="Semi-major Axis" value={planet.pl_orbsmax != null ? `${planet.pl_orbsmax.toFixed(4)} AU` : "Unknown"} />
              <DetailRow label="Eccentricity" value={planet.pl_orbeccen != null ? planet.pl_orbeccen.toFixed(4) : "Unknown"} />
            </Section>

            <Section title="Discovery">
              <DetailRow label="Year" value={planet.disc_year?.toString() ?? "Unknown"} />
              <DetailRow label="Method" value={planet.discoverymethod ?? "Unknown"} />
              <DetailRow label="Facility" value={planet.disc_facility ?? "Unknown"} />
            </Section>

            <Section title="Host Star">
              <DetailRow label="Name" value={planet.hostname} />
              <DetailRow label="Temperature" value={planet.st_teff != null ? `${Math.round(planet.st_teff)} K` : "Unknown"} />
              <DetailRow label="Radius" value={planet.st_rad != null ? `${planet.st_rad.toFixed(3)} R\u2609` : "Unknown"} />
              <DetailRow label="Mass" value={planet.st_mass != null ? `${planet.st_mass.toFixed(3)} M\u2609` : "Unknown"} />
              <DetailRow label="Spectral Type" value={planet.st_spectype ?? "Unknown"} />
            </Section>

            <Section title="System">
              <DetailRow label="Distance" value={formatDistance(planet.sy_dist)} />
              <DetailRow label="Planets in System" value={planet.sy_pnum?.toString() ?? "Unknown"} />
            </Section>
          </div>
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
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-foreground/30">
        {title}
      </h3>
      <div className="grid gap-1.5 sm:grid-cols-2">{children}</div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-white/[0.03] px-4 py-2.5">
      <span className="text-sm text-foreground/40">{label}</span>
      <span className="font-mono text-sm font-medium">{value}</span>
    </div>
  );
}
