"use client";

import { useState, useEffect } from "react";

interface NasaImageResult {
  imageUrl: string;
  title: string;
}

export default function NasaImage({ planetName }: { planetName: string }) {
  const [image, setImage] = useState<NasaImageResult | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setImage(null);
    setLoaded(false);

    // Strip the trailing letter (e.g. "TRAPPIST-1 e" -> "TRAPPIST-1")
    const searchName = planetName.replace(/\s+[a-z]$/i, "").trim();
    if (!searchName) return;

    const controller = new AbortController();
    fetch(
      `https://images-api.nasa.gov/search?q=${encodeURIComponent(searchName + " exoplanet")}&media_type=image`,
      { signal: controller.signal }
    )
      .then((r) => r.json())
      .then((data) => {
        const items = data?.collection?.items;
        if (!Array.isArray(items) || items.length === 0) return;

        // Find the best image (prefer artist concepts)
        const best =
          items.find(
            (item: { data?: { title?: string }[] }) =>
              item.data?.[0]?.title?.toLowerCase().includes("artist") ||
              item.data?.[0]?.title?.toLowerCase().includes("concept")
          ) ?? items[0];

        const link = best?.links?.find(
          (l: { rel: string }) => l.rel === "preview"
        );
        if (link?.href) {
          setImage({
            imageUrl: link.href,
            title: best.data?.[0]?.title ?? "NASA Image",
          });
        }
      })
      .catch(() => {});

    return () => controller.abort();
  }, [planetName]);

  if (!image) return null;

  return (
    <div className="overflow-hidden rounded-xl">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={image.imageUrl}
        alt={image.title}
        onLoad={() => setLoaded(true)}
        className={`w-full object-cover transition-opacity duration-500 ${
          loaded ? "opacity-100" : "opacity-0"
        }`}
        style={{ maxHeight: 280 }}
      />
      {loaded && (
        <p className="bg-white/3 px-3 py-1.5 text-[10px] text-foreground/40">
          {image.title} — NASA/JPL-Caltech
        </p>
      )}
    </div>
  );
}
