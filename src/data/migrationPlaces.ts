export type MigrationPlace = {
  id: string;
  label: string;
  lat: number;
  lng: number;
  /** Match substrings in profile text (lowercase). */
  aliases: string[];
};

/** Known coordinates — OpenStreetMap tiles used for display only. */
export const MIGRATION_PLACES: MigrationPlace[] = [
  {
    id: 'iloilo',
    label: 'Iloilo',
    lat: 10.7202,
    lng: 122.5621,
    aliases: ['iloilo'],
  },
  {
    id: 'tarlac',
    label: 'Tarlac',
    lat: 15.4758,
    lng: 120.596,
    aliases: ['tarlac'],
  },
  {
    id: 'bulacan',
    label: 'Bulacan',
    lat: 14.7942,
    lng: 120.8799,
    aliases: ['bulacan'],
  },
  {
    id: 'pulilan',
    label: 'Pulilan, Bulacan',
    lat: 14.8978,
    lng: 120.8492,
    aliases: ['pulilan'],
  },
  {
    id: 'quezon-city',
    label: 'Quezon City',
    lat: 14.676,
    lng: 121.0437,
    aliases: ['quezon city', 'quezon'],
  },
  {
    id: 'manila',
    label: 'Manila City',
    lat: 14.5995,
    lng: 120.9842,
    aliases: ['manila', 'sampaloc', 'dos castillas', 'metro manila'],
  },
  {
    id: 'calgary',
    label: 'Calgary, Canada',
    lat: 51.0447,
    lng: -114.0719,
    aliases: ['calgary', 'alberta'],
  },
  {
    id: 'toronto',
    label: 'Toronto, Canada',
    lat: 43.6532,
    lng: -79.3832,
    aliases: ['toronto'],
  },
  {
    id: 'california',
    label: 'California, USA',
    lat: 36.7783,
    lng: -119.4179,
    aliases: ['california'],
  },
  {
    id: 'usa',
    label: 'United States',
    lat: 38.9072,
    lng: -77.0369,
    aliases: ['united states', ' u.s.', ' usa', 'america'],
  },
];

export const PHILIPPINES_CENTER: [number, number] = [12.5, 122];
export const PHILIPPINES_ZOOM = 6;
export const WORLD_CENTER: [number, number] = [20, 10];
export const WORLD_ZOOM = 2;

/** Approximate bounding box for fitting the Philippine archipelago. */
export const PHILIPPINES_BOUNDS: [[number, number], [number, number]] = [
  [4.6, 116.0],
  [21.2, 127.5],
];

export function isInPhilippines(lat: number, lng: number): boolean {
  return lat >= 4.6 && lat <= 21.2 && lng >= 116 && lng <= 127.5;
}
