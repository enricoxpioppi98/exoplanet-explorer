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

const PAGE_SIZE = 50;

export default function ExplorePage() {
  const { isSignedIn } = useAuth();
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [planets, setPlanets] = useState<Exoplanet[]>([]);
  const [savedNames, setSavedNames] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [selectedPlanet, setSelectedPlanet] = useState<Exoplanet | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

  const buildParams = useCallback((f: FilterState, limit: number) => {
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
    params.set("limit", String(limit));
    return params;
  }, []);

  const fetchPlanets = useCallback(
    async (f: FilterState) => {
      setLoading(true);
      setHasMore(false);
      setError(null);
      try {
        const params = buildParams(f, PAGE_SIZE + 1);
        const res = await fetch(`/api/exoplanets?${params}`);
        const data = await res.json();
        if (Array.isArray(data)) {
          setHasMore(data.length > PAGE_SIZE);
          setPlanets(data.slice(0, PAGE_SIZE));
        } else if (data?.error) {
          setError(data.error);
          setPlanets([]);
        } else {
          setPlanets([]);
        }
      } catch {
        setError("Could not connect to the server. Please try again.");
        setPlanets([]);
      } finally {
        setLoading(false);
      }
    },
    [buildParams]
  );

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const nextLimit = planets.length + PAGE_SIZE + 1;
      const params = buildParams(filters, nextLimit);
      const res = await fetch(`/api/exoplanets?${params}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setHasMore(data.length > planets.length + PAGE_SIZE);
        setPlanets(data.slice(0, planets.length + PAGE_SIZE));
      }
    } catch {
      /* ignore */
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, hasMore, planets.length, buildParams, filters]);

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
    debounceRef.current = setTimeout(
      () => fetchPlanets(filters),
      filters.search ? 400 : 50
    );
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [filters, fetchPlanets]);

  useEffect(() => {
    fetchSaved();
  }, [fetchSaved]);

  async function toggleSave(planet: Exoplanet) {
    const wasSaved = savedNames.has(planet.pl_name);
    setSavedNames((prev) => {
      const next = new Set(prev);
      if (wasSaved) next.delete(planet.pl_name);
      else next.add(planet.pl_name);
      return next;
    });

    try {
      if (wasSaved) {
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
      setSavedNames((prev) => {
        const next = new Set(prev);
        if (wasSaved) next.add(planet.pl_name);
        else next.delete(planet.pl_name);
        return next;
      });
    }
  }

  return (
    <div className="relative min-h-screen">
      <StarField />

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Explore Exoplanets
          </h1>
          <p className="mt-2 text-sm text-foreground/40">
            Search 2,000+ confirmed worlds beyond our solar system
          </p>
        </div>

        {/* Search bar */}
        <div className="mb-6">
          <div className="relative">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-foreground/30"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <input
              type="text"
              placeholder="Search by name (e.g. TRAPPIST, Kepler, Proxima)..."
              value={filters.search}
              onChange={(e) =>
                setFilters((f) => ({
                  ...f,
                  search: e.target.value,
                  preset: null,
                }))
              }
              className="w-full rounded-2xl border border-border bg-card/50 py-3.5 pl-12 pr-4 text-sm outline-none transition-all placeholder:text-foreground/25 focus:border-accent/50 focus:bg-card focus:shadow-[0_0_20px_-6px_rgba(59,130,246,0.15)]"
            />
          </div>
        </div>

        {/* Presets + Surprise Me */}
        <div className="mb-8 flex flex-wrap items-center gap-2.5">
          <FilterPresets
            activePreset={filters.preset}
            onSelect={setFilters}
          />
          <button
            onClick={async () => {
              const res = await fetch("/api/exoplanets?limit=200");
              const data = await res.json();
              if (Array.isArray(data) && data.length > 0) {
                const random = data[Math.floor(Math.random() * data.length)];
                setSelectedPlanet(random);
              }
            }}
            className="rounded-full border border-amber/20 bg-amber/10 px-4 py-1.5 text-sm font-medium text-amber transition-all hover:bg-amber/20 hover:shadow-[0_0_16px_-4px_rgba(245,158,11,0.3)]"
          >
            &#10024; Surprise Me
          </button>
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
          <div className="fixed bottom-6 right-6 z-40 lg:hidden">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="rounded-full bg-accent px-5 py-3 text-sm font-medium text-white shadow-lg shadow-accent/30 transition-all hover:bg-accent/80"
            >
              {showFilters ? "Close" : "Filters"}
            </button>
          </div>

          {/* Mobile filter drawer */}
          {showFilters && (
            <div
              className="fixed inset-0 z-30 lg:hidden"
              onClick={() => setShowFilters(false)}
            >
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
            {!loading && !error && planets.length > 0 && (
              <p className="mb-5 text-xs font-medium uppercase tracking-wider text-foreground/30">
                {planets.length} planet{planets.length !== 1 ? "s" : ""}
                {hasMore ? " +" : ""}
              </p>
            )}

            {loading ? (
              <LoadingSkeleton />
            ) : error ? (
              <EmptyState
                title="NASA API is slow right now"
                description={error}
                action={
                  <button
                    onClick={() => fetchPlanets(filters)}
                    className="rounded-full bg-accent px-6 py-2.5 text-sm font-medium text-white transition-all hover:bg-accent/80"
                  >
                    Try Again
                  </button>
                }
              />
            ) : planets.length === 0 ? (
              <EmptyState
                title="No planets found"
                description="Try adjusting your filters or search for a different planet name."
              />
            ) : (
              <>
                <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
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

                {/* Load More */}
                {hasMore && (
                  <div className="mt-8 flex justify-center">
                    <button
                      onClick={loadMore}
                      disabled={loadingMore}
                      className="rounded-full border border-border px-8 py-3 text-sm font-medium transition-all hover:bg-white/5 hover:border-border-hover disabled:opacity-50"
                    >
                      {loadingMore ? "Loading..." : "Load More Planets"}
                    </button>
                  </div>
                )}
              </>
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
