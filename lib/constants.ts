export const DISCOVERY_METHODS = [
  "Transit",
  "Radial Velocity",
  "Microlensing",
  "Imaging",
  "Transit Timing Variations",
  "Eclipse Timing Variations",
  "Orbital Brightness Modulation",
  "Pulsar Timing",
  "Astrometry",
  "Pulsation Timing Variations",
  "Disk Kinematics",
] as const;

export const FILTER_PRESETS = {
  habitable: {
    label: "Habitable Zone",
    description: "Earth-sized planets at comfortable temperatures",
    params: {
      radiusMin: "0.5",
      radiusMax: "1.5",
      tempMin: "200",
      tempMax: "320",
    },
  },
  hotJupiters: {
    label: "Hot Jupiters",
    description: "Massive gas giants orbiting close to their stars",
    params: {
      radiusMin: "10",
      tempMin: "1000",
    },
  },
  recent: {
    label: "Recent Discoveries",
    description: "Planets discovered in the last few years",
    params: {
      yearMin: "2023",
    },
  },
  mostHabitable: {
    label: "Most Habitable",
    description: "Planets with the highest habitability scores",
    params: {
      habitMin: "50",
    },
  },
  nearby: {
    label: "Nearby Stars",
    description: "Planets within 30 parsecs of Earth",
    params: {
      distMax: "30",
    },
  },
} as const;

export const NASA_TAP_URL =
  "https://exoplanetarchive.ipac.caltech.edu/TAP/sync";

export const EXOPLANET_COLUMNS = [
  "pl_name",
  "hostname",
  "pl_rade",
  "pl_bmasse",
  "pl_eqt",
  "pl_orbper",
  "pl_orbsmax",
  "pl_orbeccen",
  "pl_insol",
  "pl_dens",
  "disc_year",
  "discoverymethod",
  "disc_facility",
  "sy_dist",
  "sy_pnum",
  "st_teff",
  "st_rad",
  "st_mass",
  "st_spectype",
].join(",");
