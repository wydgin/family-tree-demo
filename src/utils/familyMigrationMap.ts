import type { PersonProfile } from '../data/familyProfiles';
import type { MigrationPlace } from '../data/migrationPlaces';
import { buildMigrationMapView } from './migrationMapData';

export type PlaceCluster = {
  place: MigrationPlace;
  people: { id: string; name: string; note: string }[];
};

export type PersonRoute = {
  personId: string;
  personName: string;
  positions: [number, number][];
  color: string;
};

const ROUTE_COLORS = [
  '#7c3aed',
  '#2563eb',
  '#059669',
  '#d97706',
  '#db2777',
  '#0891b2',
  '#4f46e5',
  '#ca8a04',
];

function routeColor(index: number): string {
  return ROUTE_COLORS[index % ROUTE_COLORS.length];
}

export type FamilyMigrationMapData = {
  clusters: PlaceCluster[];
  routes: PersonRoute[];
  allPositions: [number, number][];
  hasInternational: boolean;
};

export function buildFamilyMigrationMapData(
  profiles: PersonProfile[],
): FamilyMigrationMapData {
  const clusterMap = new Map<string, PlaceCluster>();
  const routes: PersonRoute[] = [];
  const allPositions: [number, number][] = [];
  let hasInternational = false;
  let routeIndex = 0;

  for (const profile of profiles) {
    const view = buildMigrationMapView(profile.milestones);
    if (!view) continue;

    if (view.international) hasInternational = true;

    if (view.route.length > 1) {
      const positions: [number, number][] = view.route.map((p) => {
        allPositions.push([p.lat, p.lng]);
        return [p.lat, p.lng];
      });
      routes.push({
        personId: profile.id,
        personName: profile.name,
        positions,
        color: routeColor(routeIndex++),
      });
    }

    for (const marker of view.markers) {
      allPositions.push([marker.place.lat, marker.place.lng]);
      const existing = clusterMap.get(marker.place.id);
      const note =
        marker.role === 'current'
          ? 'current residence'
          : marker.order === 0
            ? 'migration origin'
            : 'migration stop';
      const entry = { id: profile.id, name: profile.name, note };
      if (existing) {
        if (!existing.people.some((p) => p.id === profile.id)) {
          existing.people.push(entry);
        }
      } else {
        clusterMap.set(marker.place.id, { place: marker.place, people: [entry] });
      }
    }
  }

  return {
    clusters: [...clusterMap.values()],
    routes,
    allPositions,
    hasInternational,
  };
}
