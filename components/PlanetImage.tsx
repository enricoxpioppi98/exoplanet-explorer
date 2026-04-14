"use client";

import { getPlanetColors, hashString, seededRandom } from "@/lib/utils";

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
  const [c1, c2, c3] = getPlanetColors(planetName, temperature, radius);
  const seed = hashString(planetName);
  const rng = seededRandom(seed);

  const x1 = 20 + rng() * 40;
  const y1 = 20 + rng() * 40;
  const x2 = 40 + rng() * 30;
  const y2 = 50 + rng() * 30;
  const x3 = rng() * 60 + 20;
  const y3 = rng() * 60 + 20;

  const rad = radius ?? 1;
  const sphereSize = rad > 10 ? 70 : rad > 4 ? 60 : rad > 2 ? 50 : 40;

  const style = {
    background: `
      radial-gradient(circle at ${x1}% ${y1}%, ${c1}dd 0%, transparent ${sphereSize}%),
      radial-gradient(circle at ${x2}% ${y2}%, ${c2}aa 0%, transparent ${sphereSize * 0.8}%),
      radial-gradient(circle at ${x3}% ${y3}%, ${c3}66 0%, transparent ${sphereSize * 1.2}%),
      radial-gradient(circle at 50% 50%, ${c1}20 0%, ${c2}08 60%, transparent 70%),
      radial-gradient(ellipse at 50% 50%, #0a0a1a 0%, #050510 100%)
    `.trim(),
    boxShadow: `inset 0 0 ${sphereSize}px ${c1}15, 0 0 ${sphereSize / 2}px ${c1}10`,
  };

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
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 35% 30%, rgba(255,255,255,0.08) 0%, transparent 40%)",
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
}
