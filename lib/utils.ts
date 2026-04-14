export function formatDistance(parsecs: number | null): string {
  if (parsecs == null) return "Unknown";
  const lightYears = parsecs * 3.26156;
  if (lightYears < 100) return `${lightYears.toFixed(1)} ly`;
  return `${Math.round(lightYears).toLocaleString()} ly`;
}

export function formatRadius(earthRadii: number | null): string {
  if (earthRadii == null) return "Unknown";
  return `${earthRadii.toFixed(2)} R\u2295`;
}

export function formatMass(earthMasses: number | null): string {
  if (earthMasses == null) return "Unknown";
  if (earthMasses > 100) return `${(earthMasses / 317.8).toFixed(2)} M\u2C7C`;
  return `${earthMasses.toFixed(2)} M\u2295`;
}

export function formatTemp(kelvin: number | null): string {
  if (kelvin == null) return "Unknown";
  const c = Math.round(kelvin - 273.15);
  const f = Math.round((kelvin - 273.15) * 9 / 5 + 32);
  return `${Math.round(kelvin)} K (${c}\u00B0C / ${f}\u00B0F)`;
}

export function formatPeriod(days: number | null): string {
  if (days == null) return "Unknown";
  if (days < 1) return `${(days * 24).toFixed(1)} hours`;
  if (days > 365) return `${(days / 365.25).toFixed(1)} years`;
  return `${days.toFixed(1)} days`;
}

export function getTempColor(kelvin: number | null): string {
  if (kelvin == null) return "#6B7280";
  if (kelvin < 200) return "#60A5FA";
  if (kelvin <= 320) return "#34D399";
  if (kelvin <= 1000) return "#FBBF24";
  return "#EF4444";
}

export function getPlanetSizeCategory(earthRadii: number | null): string {
  if (earthRadii == null) return "Unknown";
  if (earthRadii < 1) return "Sub-Earth";
  if (earthRadii < 1.5) return "Earth-like";
  if (earthRadii < 2) return "Super-Earth";
  if (earthRadii < 4) return "Mini-Neptune";
  if (earthRadii < 10) return "Neptune-like";
  return "Gas Giant";
}

export function sanitizeInput(input: string): string {
  return input.replace(/[^a-zA-Z0-9 \-_.]/g, "");
}

// Habitability score 0-100
export function getHabitabilityScore(planet: {
  pl_rade: number | null;
  pl_eqt: number | null;
  pl_bmasse: number | null;
  pl_orbper: number | null;
  sy_dist: number | null;
}): number {
  let score = 0;

  // Radius similarity to Earth (1.0): 30 pts max
  if (planet.pl_rade != null) {
    const diff = Math.abs(planet.pl_rade - 1.0);
    score += Math.max(0, 30 - diff * 20);
  }

  // Temperature similarity to 288K: 30 pts max
  if (planet.pl_eqt != null) {
    const diff = Math.abs(planet.pl_eqt - 288);
    score += Math.max(0, 30 - diff * 0.2);
  }

  // Has known mass: 10 pts
  if (planet.pl_bmasse != null) score += 10;

  // Atmosphere potential (radius > 0.5 Earth): 10 pts
  if (planet.pl_rade != null && planet.pl_rade >= 0.5) score += 10;

  // Not tidally locked (period > 1 day): 10 pts
  if (planet.pl_orbper != null && planet.pl_orbper > 1) score += 10;

  // Reachable (< 100 parsecs): 10 pts
  if (planet.sy_dist != null && planet.sy_dist < 100) score += 10;

  return Math.round(Math.min(100, Math.max(0, score)));
}

export function getHabitabilityColor(score: number): string {
  if (score >= 70) return "#34D399";
  if (score >= 40) return "#FBBF24";
  return "#EF4444";
}

// Surface gravity relative to Earth
export function getSurfaceGravity(
  mass: number | null,
  radius: number | null
): number | null {
  if (mass == null || radius == null || radius === 0) return null;
  return mass / (radius * radius);
}

// Star color based on effective temperature
export function getStarColor(teff: number | null): {
  color: string;
  label: string;
} {
  if (teff == null) return { color: "#fff8e0", label: "Unknown" };
  if (teff < 3500) return { color: "#ff6030", label: "Deep red" };
  if (teff < 5000) return { color: "#ffa040", label: "Orange" };
  if (teff < 6000) return { color: "#fff4d0", label: "Yellow-white" };
  if (teff < 7500) return { color: "#f0f0ff", label: "White" };
  return { color: "#a0c0ff", label: "Blue-white" };
}

// Travel time in years given distance in parsecs
export function getTravelTime(
  distParsecs: number | null
): { light: string; probe: string; voyager: string } | null {
  if (distParsecs == null) return null;
  const distKm = distParsecs * 3.086e13;
  const lightSpeedKmH = 299792 * 3600;
  const parkerKmH = 635266;
  const voyagerKmH = 61500;

  const lightYears = distKm / lightSpeedKmH / 8766;
  const probeYears = distKm / parkerKmH / 8766;
  const voyagerYears = distKm / voyagerKmH / 8766;

  const fmt = (y: number) => {
    if (y < 1) return `${Math.round(y * 12)} months`;
    if (y < 1000) return `${y.toFixed(1)} years`;
    if (y < 1e6) return `${(y / 1000).toFixed(0)}K years`;
    if (y < 1e9) return `${(y / 1e6).toFixed(1)}M years`;
    return `${(y / 1e9).toFixed(1)}B years`;
  };

  return { light: fmt(lightYears), probe: fmt(probeYears), voyager: fmt(voyagerYears) };
}

// Find similar planets by radius + temperature
export function findSimilarPlanets(
  target: { pl_name: string; pl_rade: number | null; pl_eqt: number | null },
  allPlanets: { pl_name: string; pl_rade: number | null; pl_eqt: number | null }[],
  count: number = 4
): typeof allPlanets {
  const tRad = target.pl_rade ?? 1;
  const tTemp = target.pl_eqt ?? 300;

  return allPlanets
    .filter((p) => p.pl_name !== target.pl_name)
    .map((p) => {
      const radDiff = Math.abs((p.pl_rade ?? 1) - tRad) / Math.max(tRad, 0.1);
      const tempDiff = Math.abs((p.pl_eqt ?? 300) - tTemp) / Math.max(tTemp, 1);
      return { planet: p, score: radDiff + tempDiff };
    })
    .sort((a, b) => a.score - b.score)
    .slice(0, count)
    .map((x) => x.planet);
}

// Deterministic hash from string
export function hashString(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

export function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

// Returns [primary, secondary, tertiary] colors for a planet
export function getPlanetColors(
  name: string,
  temperature: number | null,
  radius: number | null
): [string, string, string] {
  const seed = hashString(name);
  const rng = seededRandom(seed);
  const temp = temperature ?? 300;
  const rad = radius ?? 1;

  let colors: string[];
  if (rad > 4) {
    if (temp > 800) {
      colors = ["#e85d3a", "#c94420", "#a03018", "#d47030", "#8b2010"];
    } else if (temp > 400) {
      colors = ["#c9935a", "#a07040", "#d4a870", "#8b6530", "#e0b878"];
    } else {
      colors = ["#3a6a9e", "#2850a0", "#5588cc", "#1a3870", "#4070b8"];
    }
  } else if (temp < 150) {
    colors = ["#a0c8e8", "#78a8d0", "#c0ddf0", "#5890b8", "#d8eaf5"];
  } else if (temp < 250) {
    colors = ["#4890c0", "#306890", "#68b0d8", "#2060a0", "#88c8e8"];
  } else if (temp <= 320) {
    colors = ["#2a7a50", "#1a5a38", "#3aaa68", "#104828", "#50c080"];
  } else if (temp <= 600) {
    colors = ["#c08040", "#a06830", "#d89848", "#885020", "#e8a850"];
  } else if (temp <= 1200) {
    colors = ["#b84020", "#902818", "#d05830", "#701810", "#e06838"];
  } else {
    colors = ["#d03010", "#ff5020", "#a02008", "#ff7040", "#800800"];
  }

  const c1 = colors[Math.floor(rng() * colors.length)];
  const c2 = colors[Math.floor(rng() * colors.length)];
  const c3 = colors[Math.floor(rng() * colors.length)];
  return [c1, c2, c3];
}
