import { NextRequest } from "next/server";
import { NASA_TAP_URL, EXOPLANET_COLUMNS } from "@/lib/constants";
import { sanitizeInput } from "@/lib/utils";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const conditions: string[] = [];

  const search = params.get("search");
  if (search) {
    const clean = sanitizeInput(search);
    conditions.push(`pl_name like '%${clean}%'`);
  }

  const method = params.get("method");
  if (method) {
    const clean = sanitizeInput(method);
    conditions.push(`discoverymethod = '${clean}'`);
  }

  const yearMin = params.get("yearMin");
  const yearMax = params.get("yearMax");
  if (yearMin) conditions.push(`disc_year >= ${parseInt(yearMin)}`);
  if (yearMax) conditions.push(`disc_year <= ${parseInt(yearMax)}`);

  const radiusMin = params.get("radiusMin");
  const radiusMax = params.get("radiusMax");
  if (radiusMin) conditions.push(`pl_rade >= ${parseFloat(radiusMin)}`);
  if (radiusMax) conditions.push(`pl_rade <= ${parseFloat(radiusMax)}`);

  const tempMin = params.get("tempMin");
  const tempMax = params.get("tempMax");
  if (tempMin) conditions.push(`pl_eqt >= ${parseFloat(tempMin)}`);
  if (tempMax) conditions.push(`pl_eqt <= ${parseFloat(tempMax)}`);

  const distMax = params.get("distMax");
  if (distMax) conditions.push(`sy_dist <= ${parseFloat(distMax)}`);

  const preset = params.get("preset");
  if (preset === "habitable") {
    conditions.push(
      "pl_rade >= 0.5",
      "pl_rade <= 1.5",
      "pl_eqt >= 200",
      "pl_eqt <= 320"
    );
  }

  const limit = Math.min(parseInt(params.get("limit") || "50"), 200);

  const whereClause =
    conditions.length > 0 ? `+where+${conditions.join("+and+")}` : "";

  const query = `select+top+${limit}+${EXOPLANET_COLUMNS}+from+pscomppars${whereClause}+order+by+disc_year+desc`;
  const url = `${NASA_TAP_URL}?query=${query}&format=json`;

  try {
    const response = await fetch(url, { next: { revalidate: 3600 } });

    if (!response.ok) {
      return Response.json(
        { error: "NASA API request failed" },
        { status: 502 }
      );
    }

    const data = await response.json();
    return Response.json(data);
  } catch {
    return Response.json(
      { error: "Failed to fetch exoplanet data" },
      { status: 500 }
    );
  }
}
