"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@clerk/nextjs";
import type { Exoplanet, FilterState } from "@/lib/types";
import { defaultFilters } from "@/lib/types";
import StarField from "@/components/StarField";
import SearchFilters from "@/components/SearchFilters";
import FilterPresets from "@/components/FilterPresets";
import PlanetCard from "@/components/PlanetCard";
import PlanetDetailModal from "@/components/PlanetDetailModal";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import EmptyState from "@/components/EmptyState";

export default function ExplorePage() {
  const { isSignedIn } = useAuth();
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [planets, setPlanets] = useState<Exoplanet[]>([]);
  const [savedNames, setSavedNames] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [selectedPlanet, setSelectedPlanet] = useState<Exoplanet | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

  const fetchPlanets = useCallback(async (f: FilterState) => {
    setLoading(true);
    const params = new URLSearchParams();
    if (f.search) params.set("search", f.search);
    if (f.method) params.set("method", f.method);
    if (f.yearMin) params.set("yearMin", f.yearMin);
    if (f.yearMax) params.set("yearMax", f.yearMax);
    if (f.radiusMin) params.set("radiusMin", f.radiusMin);
    if (f.radiusMax) params.set("radiusMax", f.radiusMax);
    if (f.tempMin) params.set("tempMin", f.tempMin);
    if (f.tempMax) params.set("tempMax", f.tempMax);
    if (f.preset) params.set("preset", f.preset);

    try {
      const res = await fetch(`/api/exoplanets?${params}`);
      const data = await res.json();
      setPlanets(Array.isArray(data) ? data : []);
    } catch {
      setPlanets([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSaved = useCallback(async () => {
    if (!isSignedIn) return;
    try {
      const res = await fetch("/api/favorites");
      const data = await res.json();
      if (Array.isArray(data)) {
        setSavedNames(new Set(data.map((p: { pl_name: string }) => p.pl_name)));
      }
    } catch {
      /* ignore */
    }
  }, [isSignedIn]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchPlanets(filters);
    }, filters.search ? 400 : 50);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [filters, fetchPlanets]);

  useEffect(() => {
    fetchSaved();
  }, [fetchSaved]);

  async function toggleSave(planet: Exoplanet) {
    const isSaved = savedNames.has(planet.pl_name);
    // Optimistic update
    setSavedNames((prev) => {
      const next = new Set(prev);
      if (isSaved) next.delete(planet.pl_name);
      else next.add(planet.pl_name);
      return next;
    });

    try {
      if (isSaved) {
        await fetch("/api/favorites", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pl_name: planet.pl_name }),
        });
      } else {
        await fetch("/api/favorites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(planet),
        });
      }
    } catch {
      // Revert on error
      setSavedNames((prev) => {
        const next = new Set(prev);
        if (isSaved) next.add(planet.pl_name);
        else next.delete(planet.pl_name);
        return next;
      });
    }
  }

  return (
    <div className="relative min-h-screen">
      <StarField />

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {/* Search bar */}
        <div className="mb-6">
          <div className="relative">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-foreground/40"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <input
              type="text"
              placeholder="Search planets by name (e.g. TRAPPIST, Kepler, Proxima)..."
              value={filters.search}
              onChange={(e) =>
                setFilters((f) => ({ ...f, search: e.target.value, preset: null }))
              }
              className="w-full rounded-xl border border-border bg-card py-3 pl-12 pr-4 text-sm outline-none transition-colors placeholder:text-foreground/30 focus:border-accent"
            />
          </div>
        </div>

        {/* Presets */}
        <div className="mb-6">
          <FilterPresets
            activePreset={filters.preset}
            onSelect={setFilters}
          />
        </div>

        <div className="flex gap-6">
          {/* Sidebar filters (desktop) */}
          <aside className="hidden w-64 shrink-0 lg:block">
            <div className="sticky top-24 rounded-2xl border border-border bg-card p-4 backdrop-blur-md">
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-foreground/40">
                Filters
              </h3>
              <SearchFilters
                filters={filters}
                onChange={setFilters}
                onClear={() => setFilters(defaultFilters)}
              />
            </div>
          </aside>

          {/* Mobile filter toggle */}
          <div className="lg:hidden fixed bottom-6 right-6 z-40">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="rounded-full bg-accent px-5 py-3 text-sm font-medium text-white shadow-lg shadow-accent/30 transition-all hover:bg-accent/80"
            >
              {showFilters ? "Close" : "Filters"}
            </button>
          </div>

          {/* Mobile filter drawer */}
          {showFilters && (
            <div className="fixed inset-0 z-30 lg:hidden" onClick={() => setShowFilters(false)}>
              <div className="absolute inset-0 bg-black/50" />
              <div
                className="absolute bottom-0 left-0 right-0 max-h-[70vh] overflow-y-auto rounded-t-2xl border-t border-border bg-background p-6"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-foreground/40">
                  Filters
                </h3>
                <SearchFilters
                  filters={filters}
                  onChange={(f) => {
                    setFilters(f);
                    setShowFilters(false);
                  }}
                  onClear={() => {
                    setFilters(defaultFilters);
                    setShowFilters(false);
                  }}
                />
              </div>
            </div>
          )}

          {/* Results */}
          <div className="flex-1">
            {!loading && (
              <p className="mb-4 text-sm text-foreground/40">
                {planets.length} planet{planets.length !== 1 ? "s" : ""} found
              </p>
            )}

            {loading ? (
              <LoadingSkeleton />
            ) : planets.length === 0 ? (
              <EmptyState
                title="No planets found"
                description="Try adjusting your filters or search for a different planet name."
              />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {planets.map((planet) => (
                  <PlanetCard
                    key={planet.pl_name}
                    planet={planet}
                    isSaved={savedNames.has(planet.pl_name)}
                    onSaveToggle={() => toggleSave(planet)}
                    onClick={() => setSelectedPlanet(planet)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedPlanet && (
        <PlanetDetailModal
          planet={selectedPlanet}
          isSaved={savedNames.has(selectedPlanet.pl_name)}
          onSaveToggle={() => toggleSave(selectedPlanet)}
          onClose={() => setSelectedPlanet(null)}
        />
      )}
    </div>
  );
}
