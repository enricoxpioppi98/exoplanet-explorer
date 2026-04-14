"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import StarField from "@/components/StarField";
import PlanetImage from "@/components/PlanetImage";
import {
  getHabitabilityScore,
  getHabitabilityColor,
  formatTemp,
  formatRadius,
  formatMass,
  formatPeriod,
  getSurfaceGravity,
  getStarColor,
  getPlanetSizeCategory,
} from "@/lib/utils";

export default function PlanetBuilderPage() {
  const [radius, setRadius] = useState(1.0);
  const [temp, setTemp] = useState(288);
  const [mass, setMass] = useState(1.0);
  const [period, setPeriod] = useState(365);
  const [distance, setDistance] = useState(10);
  const [starTemp, setStarTemp] = useState(5778);
  const [name, setName] = useState("My Planet");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const { isSignedIn } = useAuth();
  const router = useRouter();

  async function handleSave() {
    if (!isSignedIn) {
      router.push("/sign-in");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pl_name: `[Custom] ${name}`,
          hostname: `${name} Star`,
          pl_rade: radius,
          pl_bmasse: mass,
          pl_eqt: temp,
          pl_orbper: period,
          discoverymethod: "Planet Builder",
          sy_dist: distance,
          st_teff: starTemp,
          st_rad: null,
          st_mass: null,
          st_spectype: null,
          disc_year: new Date().getFullYear(),
          disc_facility: "Exoplanet Explorer",
          sy_pnum: 1,
        }),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch {
      /* ignore */
    } finally {
      setSaving(false);
    }
  }

  const planet = {
    pl_rade: radius,
    pl_eqt: temp,
    pl_bmasse: mass,
    pl_orbper: period,
    sy_dist: distance,
    st_teff: starTemp,
  };

  const score = getHabitabilityScore(planet);
  const scoreColor = getHabitabilityColor(score);
  const gravity = getSurfaceGravity(mass, radius);
  const starColor = getStarColor(starTemp);
  const sizeCategory = getPlanetSizeCategory(radius);

  const waterState =
    temp < 200 ? "Frozen solid" :
    temp < 273 ? "Mostly ice" :
    temp <= 373 ? "Liquid water!" :
    temp <= 500 ? "Steam atmosphere" :
    "Vaporized";

  const yourWeight = gravity != null ? Math.round(70 * gravity) : null;
  const yourAge = period > 0 ? ((25 * 365.25) / period).toFixed(1) : "0";

  return (
    <div className="relative min-h-screen">
      <StarField />

      <div className="relative z-10 mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-10">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Planet Builder
          </h1>
          <p className="mt-2 text-sm text-foreground/40">
            Design your dream planet and see if it could support life
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
          {/* Sliders */}
          <div className="space-y-6">
            {/* Name */}
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-widest text-foreground/40">
                Planet Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-border bg-card/50 px-4 py-2.5 text-sm outline-none focus:border-accent/50"
                maxLength={30}
              />
            </div>

            <Slider
              label="Radius"
              value={radius}
              onChange={setRadius}
              min={0.3}
              max={20}
              step={0.1}
              display={`${radius.toFixed(1)} R\u2295 (${sizeCategory})`}
            />
            <Slider
              label="Surface Temperature"
              value={temp}
              onChange={setTemp}
              min={50}
              max={3000}
              step={10}
              display={formatTemp(temp)}
            />
            <Slider
              label="Mass"
              value={mass}
              onChange={setMass}
              min={0.1}
              max={500}
              step={0.1}
              display={formatMass(mass)}
            />
            <Slider
              label="Orbital Period"
              value={period}
              onChange={setPeriod}
              min={0.1}
              max={5000}
              step={1}
              display={formatPeriod(period)}
            />
            <Slider
              label="Distance from Earth"
              value={distance}
              onChange={setDistance}
              min={1}
              max={1000}
              step={1}
              display={`${distance} parsecs (${(distance * 3.26).toFixed(0)} ly)`}
            />
            <Slider
              label="Host Star Temperature"
              value={starTemp}
              onChange={setStarTemp}
              min={2000}
              max={10000}
              step={100}
              display={`${starTemp} K`}
              detail={
                <span className="flex items-center gap-2">
                  {starColor.label}
                  <span
                    className="inline-block h-2.5 w-8 rounded-full"
                    style={{
                      background: `linear-gradient(90deg, transparent, ${starColor.color}, transparent)`,
                    }}
                  />
                </span>
              }
            />
          </div>

          {/* Preview panel */}
          <div className="lg:sticky lg:top-24">
            <div className="space-y-5 rounded-2xl border border-border bg-card/50 p-6 backdrop-blur-md">
              {/* Planet visual */}
              <PlanetImage
                planetName={name || "custom"}
                temperature={temp}
                radius={radius}
                size="lg"
                className="rounded-xl"
              />

              {/* Habitability Score */}
              <div className="text-center">
                <p className="text-xs font-semibold uppercase tracking-widest text-foreground/30">
                  Habitability Score
                </p>
                <p
                  className="mt-1 text-5xl font-black tabular-nums"
                  style={{ color: scoreColor }}
                >
                  {score}
                </p>
                <div className="mx-auto mt-2 h-2 w-full max-w-48 overflow-hidden rounded-full bg-white/5">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${score}%`, backgroundColor: scoreColor }}
                  />
                </div>
                <p className="mt-2 text-xs text-foreground/30">
                  {score >= 80 ? "Excellent candidate for life!" :
                   score >= 60 ? "Promising conditions" :
                   score >= 40 ? "Challenging but possible" :
                   score >= 20 ? "Harsh environment" :
                   "Uninhabitable"}
                </p>
              </div>

              {/* Save button */}
              <button
                onClick={handleSave}
                disabled={saving || !name.trim()}
                className={`w-full rounded-xl py-2.5 text-sm font-semibold transition-all ${
                  saved
                    ? "bg-temp-habitable/20 text-temp-habitable"
                    : "bg-accent/20 text-accent hover:bg-accent/30"
                } disabled:opacity-40`}
              >
                {saved ? "Saved to Favorites!" : saving ? "Saving..." : isSignedIn ? "Save to My Collection" : "Sign In to Save"}
              </button>

              {/* Quick stats */}
              <div className="grid grid-cols-2 gap-2">
                <MiniStat label="Water" value={waterState} />
                <MiniStat label="Gravity" value={gravity ? `${gravity.toFixed(1)}x Earth` : "?"} />
                <MiniStat label="Your weight" value={yourWeight ? `${yourWeight} kg` : "?"} />
                <MiniStat label="Your age" value={`${yourAge} yrs`} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Slider({
  label,
  value,
  onChange,
  min,
  max,
  step,
  display,
  detail,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step: number;
  display: string;
  detail?: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <label className="text-xs font-semibold uppercase tracking-widest text-foreground/40">
          {label}
        </label>
        <span className="font-mono text-sm font-medium">{display}</span>
      </div>
      {detail && (
        <div className="mb-2 text-xs text-foreground/30">{detail}</div>
      )}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-accent"
      />
      <div className="mt-1 flex justify-between text-[10px] text-foreground/20">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-white/[0.03] px-3 py-2">
      <p className="text-[10px] text-foreground/30">{label}</p>
      <p className="text-xs font-semibold">{value}</p>
    </div>
  );
}
