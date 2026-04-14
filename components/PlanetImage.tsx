"use client";

import { useState, useEffect } from "react";
import { getTempColor } from "@/lib/utils";

interface PlanetImageData {
  imageUrl: string;
  title: string;
  source: string;
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
  const [data, setData] = useState<PlanetImageData | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  const tempColor = getTempColor(temperature);

  useEffect(() => {
    const params = new URLSearchParams({
      name: planetName,
      temp: String(temperature ?? 300),
      radius: String(radius ?? 1),
    });

    fetch(`/api/planet-image?${params}`)
      .then((r) => r.json())
      .then((d) => setData(d))
      .catch(() => setError(true));
  }, [planetName, temperature, radius]);

  const sizeClasses = {
    sm: "h-32",
    md: "h-48",
    lg: "h-64",
  };

  return (
    <div
      className={`relative overflow-hidden rounded-xl ${sizeClasses[size]} ${className ?? ""}`}
      style={{
        background: `radial-gradient(ellipse at 30% 30%, ${tempColor}30, ${tempColor}10, transparent)`,
      }}
    >
      {/* Gradient fallback always visible behind */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(135deg, ${tempColor}15 0%, transparent 60%), linear-gradient(225deg, ${tempColor}08 0%, transparent 40%)`,
        }}
      />

      {data && !error && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={data.imageUrl}
          alt={data.title}
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
          className={`relative h-full w-full object-cover transition-opacity duration-500 ${
            loaded ? "opacity-100" : "opacity-0"
          }`}
        />
      )}

      {/* Loading shimmer */}
      {!loaded && !error && (
        <div className="absolute inset-0 skeleton" />
      )}

      {/* NASA credit overlay */}
      {loaded && data && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-3 py-2">
          <p className="truncate text-[10px] text-white/50">
            {data.source === "nasa" ? "NASA/JPL-Caltech" : "NASA Artist\u2019s Concept"}
          </p>
        </div>
      )}
    </div>
  );
}
