"use client";

import { getTempColor } from "@/lib/utils";

// Deterministic hash from planet name
function hash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

// Generate unique planet visual based on its properties
function getPlanetStyle(
  name: string,
  temperature: number | null,
  radius: number | null
) {
  const seed = hash(name);
  const rng = seededRandom(seed);
  const temp = temperature ?? 300;
  const rad = radius ?? 1;

  // Base palette from temperature
  let colors: string[];
  if (rad > 4) {
    // Gas giant
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

  // Shuffle colors slightly with seed
  const c1 = colors[Math.floor(rng() * colors.length)];
  const c2 = colors[Math.floor(rng() * colors.length)];
  const c3 = colors[Math.floor(rng() * colors.length)];
  const c4 = colors[Math.floor(rng() * colors.length)];

  // Unique positioning for each planet
  const x1 = 20 + rng() * 40;
  const y1 = 20 + rng() * 40;
  const x2 = 40 + rng() * 30;
  const y2 = 50 + rng() * 30;
  const x3 = rng() * 60 + 20;
  const y3 = rng() * 60 + 20;

  // Planet sphere size
  const sphereSize = rad > 10 ? 70 : rad > 4 ? 60 : rad > 2 ? 50 : 40;

  // Glow color
  const glowColor = getTempColor(temperature);

  return {
    background: `
      radial-gradient(circle at ${x1}% ${y1}%, ${c1}dd 0%, transparent ${sphereSize}%),
      radial-gradient(circle at ${x2}% ${y2}%, ${c2}aa 0%, transparent ${sphereSize * 0.8}%),
      radial-gradient(circle at ${x3}% ${y3}%, ${c3}66 0%, transparent ${sphereSize * 1.2}%),
      radial-gradient(circle at 50% 50%, ${c4}40 0%, transparent ${sphereSize * 0.6}%),
      radial-gradient(circle at 50% 50%, ${c1}20 0%, ${c2}08 60%, transparent 70%),
      radial-gradient(ellipse at 50% 50%, #0a0a1a 0%, #050510 100%)
    `.trim(),
    boxShadow: `inset 0 0 ${sphereSize}px ${glowColor}15, 0 0 ${sphereSize / 2}px ${glowColor}10`,
  };
}

export default function PlanetImage({
  planetName,
  temperature,
  radius,
  size = "md",
  className,
}: {
  planetName: string;
  temperature: number | null;
  radius: number | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const style = getPlanetStyle(planetName, temperature, radius);

  const sizeClasses = {
    sm: "h-28",
    md: "h-44",
    lg: "h-56",
  };

  return (
    <div
      className={`relative overflow-hidden rounded-xl ${sizeClasses[size]} ${className ?? ""}`}
      style={style}
    >
      {/* Highlight arc — simulates light source */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 35% 30%, rgba(255,255,255,0.08) 0%, transparent 40%)",
        }}
      />
      {/* Subtle noise texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
}
