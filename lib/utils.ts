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
