"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import type { SavedPlanet, Exoplanet } from "@/lib/types";
import StarField from "@/components/StarField";
import PlanetCard from "@/components/PlanetCard";
import PlanetDetailModal from "@/components/PlanetDetailModal";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import EmptyState from "@/components/EmptyState";

type SortKey = "saved_at" | "pl_name" | "disc_year" | "pl_eqt";

export default function FavoritesPage() {
  const [planets, setPlanets] = useState<SavedPlanet[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortKey>("saved_at");
  const [selectedPlanet, setSelectedPlanet] = useState<Exoplanet | null>(null);

  const fetchFavorites = useCallback(async () => {
    try {
      const res = await fetch("/api/favorites");
      const data = await res.json();
      if (Array.isArray(data)) {
        setPlanets(data);
      }
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  async function unsave(plName: string) {
    // Optimistic update
    setPlanets((prev) => prev.filter((p) => p.pl_name !== plName));
    try {
      await fetch("/api/favorites", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pl_name: plName }),
      });
    } catch {
      fetchFavorites();
    }
  }

  function toExoplanet(saved: SavedPlanet): Exoplanet {
    return {
      pl_name: saved.pl_name,
      hostname: saved.hostname ?? "",
      pl_rade: saved.pl_rade,
      pl_bmasse: saved.pl_bmasse,
      pl_eqt: saved.pl_eqt,
      pl_orbper: saved.pl_orbper,
      pl_orbsmax: saved.pl_orbsmax,
      pl_orbeccen: null,
      pl_insol: null,
      pl_dens: null,
      disc_year: saved.disc_year,
      discoverymethod: saved.disc_method,
      disc_facility: saved.disc_facility,
      sy_dist: saved.sy_dist,
      sy_pnum: saved.sy_pnum,
      st_teff: saved.st_teff,
      st_rad: saved.st_rad,
      st_mass: saved.st_mass,
      st_spectype: saved.st_spectype,
    };
  }

  const sorted = [...planets].sort((a, b) => {
    switch (sortBy) {
      case "pl_name":
        return a.pl_name.localeCompare(b.pl_name);
      case "disc_year":
        return (b.disc_year ?? 0) - (a.disc_year ?? 0);
      case "pl_eqt":
        return (a.pl_eqt ?? 9999) - (b.pl_eqt ?? 9999);
      case "saved_at":
      default:
        return new Date(b.saved_at).getTime() - new Date(a.saved_at).getTime();
    }
  });

  return (
    <div className="relative min-h-screen">
      <StarField />

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Your Saved Planets</h1>
            {!loading && (
              <p className="mt-1 text-sm text-foreground/50">
                {planets.length} planet{planets.length !== 1 ? "s" : ""} in your
                collection
              </p>
            )}
          </div>

          {planets.length > 0 && (
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortKey)}
              className="rounded-lg border border-border bg-card px-3 py-2 text-sm outline-none transition-colors focus:border-accent"
            >
              <option value="saved_at">Recently Saved</option>
              <option value="pl_name">Name (A-Z)</option>
              <option value="disc_year">Discovery Year</option>
              <option value="pl_eqt">Temperature</option>
            </select>
          )}
        </div>

        {/* Content */}
        {loading ? (
          <LoadingSkeleton />
        ) : planets.length === 0 ? (
          <EmptyState
            title="No saved planets yet"
            description="Start exploring the archive and save planets that interest you."
            action={
              <Link
                href="/explore"
                className="rounded-full bg-accent px-6 py-2.5 text-sm font-medium text-white transition-all hover:bg-accent/80"
              >
                Start Exploring
              </Link>
            }
          />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {sorted.map((planet) => (
              <PlanetCard
                key={planet.pl_name}
                planet={toExoplanet(planet)}
                isSaved={true}
                onSaveToggle={() => unsave(planet.pl_name)}
                onClick={() => setSelectedPlanet(toExoplanet(planet))}
              />
            ))}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedPlanet && (
        <PlanetDetailModal
          planet={selectedPlanet}
          isSaved={true}
          onSaveToggle={() => unsave(selectedPlanet.pl_name)}
          onClose={() => setSelectedPlanet(null)}
        />
      )}
    </div>
  );
}
