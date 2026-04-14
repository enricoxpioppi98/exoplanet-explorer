import { NextRequest } from "next/server";

const NASA_IMAGE_API = "https://images-api.nasa.gov/search";

// Curated fallback images by planet type (NASA image IDs)
const FALLBACK_IMAGES: Record<string, string[]> = {
  habitable: [
    "https://images-assets.nasa.gov/image/PIA17999/PIA17999~small.jpg",
    "https://images-assets.nasa.gov/image/PIA14883/PIA14883~small.jpg",
    "https://images-assets.nasa.gov/image/PIA19830/PIA19830~small.jpg",
  ],
  hot: [
    "https://images-assets.nasa.gov/image/PIA20687/PIA20687~small.jpg",
    "https://images-assets.nasa.gov/image/PIA22082/PIA22082~small.jpg",
  ],
  rocky: [
    "https://images-assets.nasa.gov/image/PIA19833/PIA19833~small.jpg",
    "https://images-assets.nasa.gov/image/PIA22069/PIA22069~small.jpg",
  ],
  gas: [
    "https://images-assets.nasa.gov/image/PIA22082/PIA22082~small.jpg",
    "https://images-assets.nasa.gov/image/PIA20687/PIA20687~small.jpg",
  ],
  frozen: [
    "https://images-assets.nasa.gov/image/PIA21061/PIA21061~small.jpg",
    "https://images-assets.nasa.gov/image/PIA17999/PIA17999~small.jpg",
  ],
  default: [
    "https://images-assets.nasa.gov/image/PIA21422/PIA21422~small.jpg",
    "https://images-assets.nasa.gov/image/PIA17999/PIA17999~small.jpg",
  ],
};

function classifyForImage(temp: number | null, radius: number | null): string {
  const t = temp ?? 300;
  const r = radius ?? 1;
  if (r > 4) return "gas";
  if (t < 200) return "frozen";
  if (t <= 320) return "habitable";
  if (t <= 800) return "rocky";
  return "hot";
}

function getTypeSearchQuery(type: string): string {
  switch (type) {
    case "habitable": return "habitable exoplanet artist concept";
    case "hot": return "hot jupiter exoplanet";
    case "rocky": return "rocky exoplanet artist concept";
    case "gas": return "gas giant exoplanet";
    case "frozen": return "exoplanet ice cold";
    default: return "exoplanet artist concept";
  }
}

// Simple hash to pick a deterministic fallback
function hashName(name: string): number {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) | 0;
  return Math.abs(h);
}

interface NasaImageItem {
  links?: { href: string; rel: string }[];
  data?: { title?: string; nasa_id?: string; description?: string }[];
}

function extractImageUrl(item: NasaImageItem): string | null {
  const link = item.links?.find(
    (l) => l.rel === "preview" || l.rel === "alternate"
  );
  return link?.href ?? null;
}

function isExoplanetImage(item: NasaImageItem): boolean {
  const desc = (
    (item.data?.[0]?.description ?? "") +
    " " +
    (item.data?.[0]?.title ?? "")
  ).toLowerCase();
  return (
    desc.includes("exoplanet") ||
    desc.includes("artist") ||
    desc.includes("planet") ||
    desc.includes("world")
  );
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const name = params.get("name") ?? "";
  const temp = parseFloat(params.get("temp") ?? "300");
  const radius = parseFloat(params.get("radius") ?? "1");

  const type = classifyForImage(temp, radius);

  // Strategy 1: Search by planet name
  if (name) {
    try {
      const nameQuery = name.replace(/\s+[a-z]$/, ""); // "TRAPPIST-1 e" -> "TRAPPIST-1"
      const res = await fetch(
        `${NASA_IMAGE_API}?q=${encodeURIComponent(nameQuery)}&media_type=image`,
        { next: { revalidate: 86400 } }
      );
      if (res.ok) {
        const data = await res.json();
        const items: NasaImageItem[] = data?.collection?.items ?? [];
        const exoImages = items.filter(isExoplanetImage);
        if (exoImages.length > 0) {
          const pick = exoImages[hashName(name) % exoImages.length];
          const url = extractImageUrl(pick);
          if (url) {
            return Response.json({
              imageUrl: url,
              title: pick.data?.[0]?.title ?? name,
              source: "nasa",
            });
          }
        }
      }
    } catch {
      /* fall through */
    }
  }

  // Strategy 2: Search by planet type
  try {
    const typeQuery = getTypeSearchQuery(type);
    const res = await fetch(
      `${NASA_IMAGE_API}?q=${encodeURIComponent(typeQuery)}&media_type=image`,
      { next: { revalidate: 86400 } }
    );
    if (res.ok) {
      const data = await res.json();
      const items: NasaImageItem[] = data?.collection?.items ?? [];
      const exoImages = items.filter(isExoplanetImage);
      if (exoImages.length > 0) {
        const pick = exoImages[hashName(name || "default") % exoImages.length];
        const url = extractImageUrl(pick);
        if (url) {
          return Response.json({
            imageUrl: url,
            title: pick.data?.[0]?.title ?? "Artist's Concept",
            source: "nasa-type",
          });
        }
      }
    }
  } catch {
    /* fall through */
  }

  // Strategy 3: Curated fallback
  const fallbacks = FALLBACK_IMAGES[type] ?? FALLBACK_IMAGES.default;
  const fallbackUrl = fallbacks[hashName(name || "x") % fallbacks.length];

  return Response.json({
    imageUrl: fallbackUrl,
    title: "Artist's Concept",
    source: "fallback",
  });
}
