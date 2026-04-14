import { NextRequest } from "next/server";
import { sanitizeInput } from "@/lib/utils";
import type { Exoplanet } from "@/lib/types";
import fallbackData from "@/lib/fallback-exoplanet-data.json";

// Pre-map fallback data once at module load
const allPlanets: Exoplanet[] = (
  fallbackData as unknown as Record<string, unknown>[]
).map((p) => ({
  pl_name: p.pl_name as string,
  hostname: (p.hostname as string) ?? "",
  pl_rade: (p.pl_rade as number) ?? null,
  pl_bmasse: (p.pl_bmasse as number) ?? null,
  pl_eqt: (p.pl_eqt as number) ?? null,
  pl_orbper: (p.pl_orbper as number) ?? null,
  pl_orbsmax: null,
  pl_orbeccen: null,
  pl_insol: null,
  pl_dens: null,
  disc_year: (p.disc_year as number) ?? null,
  discoverymethod: (p.discoverymethod as string) ?? null,
  disc_facility: null,
  sy_dist: (p.sy_dist as number) ?? null,
  sy_pnum: null,
  st_teff: (p.st_teff as number) ?? null,
  st_rad: (p.st_rad as number) ?? null,
  st_mass: (p.st_mass as number) ?? null,
  st_spectype: null,
}));

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  let results = allPlanets;

  const search = params.get("search");
  if (search) {
    const clean = sanitizeInput(search).toLowerCase();
    results = results.filter((p) => p.pl_name.toLowerCase().includes(clean));
  }

  const method = params.get("method");
  if (method) {
    const clean = sanitizeInput(method);
    results = results.filter((p) => p.discoverymethod === clean);
  }

  const yearMin = params.get("yearMin");
  if (yearMin)
    results = results.filter(
      (p) => p.disc_year != null && p.disc_year >= parseInt(yearMin)
    );

  const yearMax = params.get("yearMax");
  if (yearMax)
    results = results.filter(
      (p) => p.disc_year != null && p.disc_year <= parseInt(yearMax)
    );

  const radiusMin = params.get("radiusMin");
  if (radiusMin)
    results = results.filter(
      (p) => p.pl_rade != null && p.pl_rade >= parseFloat(radiusMin)
    );

  const radiusMax = params.get("radiusMax");
  if (radiusMax)
    results = results.filter(
      (p) => p.pl_rade != null && p.pl_rade <= parseFloat(radiusMax)
    );

  const tempMin = params.get("tempMin");
  if (tempMin)
    results = results.filter(
      (p) => p.pl_eqt != null && p.pl_eqt >= parseFloat(tempMin)
    );

  const tempMax = params.get("tempMax");
  if (tempMax)
    results = results.filter(
      (p) => p.pl_eqt != null && p.pl_eqt <= parseFloat(tempMax)
    );

  const distMax = params.get("distMax");
  if (distMax)
    results = results.filter(
      (p) => p.sy_dist != null && p.sy_dist <= parseFloat(distMax)
    );

  const preset = params.get("preset");
  if (preset === "habitable") {
    results = results.filter(
      (p) =>
        p.pl_rade != null &&
        p.pl_rade >= 0.5 &&
        p.pl_rade <= 1.5 &&
        p.pl_eqt != null &&
        p.pl_eqt >= 200 &&
        p.pl_eqt <= 320
    );
  }

  const limit = Math.min(parseInt(params.get("limit") || "50"), 200);
  return Response.json(results.slice(0, limit));
}
