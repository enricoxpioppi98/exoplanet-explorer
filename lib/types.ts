export interface Exoplanet {
  pl_name: string;
  hostname: string;
  pl_rade: number | null;
  pl_bmasse: number | null;
  pl_eqt: number | null;
  pl_orbper: number | null;
  pl_orbsmax: number | null;
  pl_orbeccen: number | null;
  pl_insol: number | null;
  pl_dens: number | null;
  disc_year: number | null;
  discoverymethod: string | null;
  disc_facility: string | null;
  sy_dist: number | null;
  sy_pnum: number | null;
  st_teff: number | null;
  st_rad: number | null;
  st_mass: number | null;
  st_spectype: string | null;
}

export interface SavedPlanet {
  id: string;
  user_id: string;
  pl_name: string;
  hostname: string | null;
  pl_rade: number | null;
  pl_bmasse: number | null;
  pl_eqt: number | null;
  pl_orbper: number | null;
  pl_orbsmax: number | null;
  disc_year: number | null;
  disc_method: string | null;
  disc_facility: string | null;
  sy_dist: number | null;
  sy_pnum: number | null;
  st_teff: number | null;
  st_rad: number | null;
  st_mass: number | null;
  st_spectype: string | null;
  saved_at: string;
  notes?: string;
}

export interface FilterState {
  search: string;
  method: string;
  yearMin: string;
  yearMax: string;
  radiusMin: string;
  radiusMax: string;
  tempMin: string;
  tempMax: string;
  habitMin: string;
  preset: string | null;
}

export const defaultFilters: FilterState = {
  search: "",
  method: "",
  yearMin: "",
  yearMax: "",
  radiusMin: "",
  radiusMax: "",
  tempMin: "",
  tempMax: "",
  habitMin: "",
  preset: null,
};
