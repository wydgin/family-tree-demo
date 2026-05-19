import {
  MIGRATION_PLACES,
  PHILIPPINES_CENTER,
  PHILIPPINES_ZOOM,
  WORLD_ZOOM,
  type MigrationPlace,
} from '../data/migrationPlaces';
import type { LifeMilestones } from '../data/familyProfileTypes';

export type MapMarker = {
  place: MigrationPlace;
  role: 'route' | 'current' | 'migration';
  order: number;
};

export type MigrationMapView = {
  markers: MapMarker[];
  route: MigrationPlace[];
  center: [number, number];
  zoom: number;
  international: boolean;
};

function matchPlace(text: string): MigrationPlace | null {
  const lower = text.toLowerCase();
  let best: MigrationPlace | null = null;
  let bestLen = 0;
  for (const place of MIGRATION_PLACES) {
    for (const alias of place.aliases) {
      if (lower.includes(alias) && alias.length > bestLen) {
        best = place;
        bestLen = alias.length;
      }
    }
  }
  return best;
}

function parseChain(text: string): MigrationPlace[] {
  const segments = text.split(/\s*(?:→|->|—|–|,)\s*/).map((s) => s.trim());
  const seen = new Set<string>();
  const places: MigrationPlace[] = [];
  for (const segment of segments) {
    if (!segment) continue;
    const place = matchPlace(segment);
    if (place && !seen.has(place.id)) {
      seen.add(place.id);
      places.push(place);
    }
  }
  return places;
}

function collectFromText(text: string | undefined, out: MigrationPlace[], seen: Set<string>) {
  if (!text) return;
  const place = matchPlace(text);
  if (place && !seen.has(place.id)) {
    seen.add(place.id);
    out.push(place);
  }
  for (const p of parseChain(text)) {
    if (!seen.has(p.id)) {
      seen.add(p.id);
      out.push(p);
    }
  }
}

/** Build map markers and route from milestone text fields. */
export function buildMigrationMapView(milestones: LifeMilestones): MigrationMapView | null {
  const route: MigrationPlace[] = [];
  const seen = new Set<string>();

  if (milestones.lifetimeMigration) {
    for (const p of parseChain(milestones.lifetimeMigration)) {
      if (!seen.has(p.id)) {
        seen.add(p.id);
        route.push(p);
      }
    }
  }

  collectFromText(milestones.firstMigrationDescription, route, seen);

  const extras: MigrationPlace[] = [];
  const extraSeen = new Set(seen);
  collectFromText(milestones.currentResidence, extras, extraSeen);

  const allPlaces = [...route, ...extras];
  if (allPlaces.length === 0) return null;

  const international = allPlaces.some(
    (p) => p.id === 'calgary' || p.id === 'toronto' || p.id === 'california' || p.id === 'usa',
  );

  const currentId =
    extras.length > 0 ? extras[extras.length - 1].id : route[route.length - 1]?.id;

  const markers: MapMarker[] = [];
  let order = 0;
  for (const place of route) {
    markers.push({
      place,
      role: place.id === currentId ? 'current' : 'route',
      order: order++,
    });
  }
  for (const place of extras) {
    if (!route.some((r) => r.id === place.id)) {
      markers.push({ place, role: 'current', order: order++ });
    }
  }

  if (markers.length === 0) return null;

  const lats = allPlaces.map((p) => p.lat);
  const lngs = allPlaces.map((p) => p.lng);
  const center: [number, number] = [
    (Math.min(...lats) + Math.max(...lats)) / 2,
    (Math.min(...lngs) + Math.max(...lngs)) / 2,
  ];

  return {
    markers,
    route,
    center,
    zoom: international ? WORLD_ZOOM : PHILIPPINES_ZOOM,
    international,
  };
}

export function defaultMapCenter(international: boolean): [number, number] {
  return international ? [20, 0] : PHILIPPINES_CENTER;
}
