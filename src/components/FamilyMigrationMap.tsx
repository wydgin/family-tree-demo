import { useEffect, useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import L from 'leaflet';
import { MapContainer, Marker, Polyline, Popup, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

import { getAllProfiles } from '../data/familyProfiles';
import {
  PHILIPPINES_BOUNDS,
  WORLD_CENTER,
  WORLD_ZOOM,
  isInPhilippines,
} from '../data/migrationPlaces';
import { buildFamilyMigrationMapData } from '../utils/familyMigrationMap';
import { PillNavGroup } from './PillNavGroup';

import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const defaultIcon = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

L.Marker.prototype.options.icon = defaultIcon;

export type MapViewMode = 'world' | 'philippines';

const MAP_VIEW_ITEMS = [
  { value: 'philippines' as const, label: 'Philippines' },
  { value: 'world' as const, label: 'World' },
];

function MapViewport({
  mode,
  allPositions,
  phPositions,
}: {
  mode: MapViewMode;
  allPositions: [number, number][];
  phPositions: [number, number][];
}) {
  const map = useMap();

  useEffect(() => {
    if (mode === 'philippines') {
      if (phPositions.length > 0) {
        map.fitBounds(L.latLngBounds(phPositions), { padding: [40, 40], maxZoom: 8 });
      } else {
        map.fitBounds(PHILIPPINES_BOUNDS, { padding: [24, 24] });
      }
      return;
    }

    if (allPositions.length > 0) {
      map.fitBounds(L.latLngBounds(allPositions), { padding: [48, 48], maxZoom: 4 });
    } else {
      map.setView(WORLD_CENTER, WORLD_ZOOM);
    }
  }, [map, mode, allPositions, phPositions]);

  return null;
}

export type FamilyMigrationMapProps = {
  onSelectPerson?: (personId: string) => void;
};

export function FamilyMigrationMap({ onSelectPerson }: FamilyMigrationMapProps) {
  const [viewMode, setViewMode] = useState<MapViewMode>('philippines');
  const data = useMemo(() => buildFamilyMigrationMapData(getAllProfiles()), []);

  const phPositions = useMemo(
    () => data.allPositions.filter(([lat, lng]) => isInPhilippines(lat, lng)),
    [data.allPositions],
  );

  const visibleClusters = useMemo(
    () =>
      viewMode === 'philippines'
        ? data.clusters.filter((c) => isInPhilippines(c.place.lat, c.place.lng))
        : data.clusters,
    [data.clusters, viewMode],
  );

  const visibleRoutes = useMemo(
    () =>
      viewMode === 'philippines'
        ? data.routes.filter((route) =>
            route.positions.some(([lat, lng]) => isInPhilippines(lat, lng)),
          )
        : data.routes,
    [data.routes, viewMode],
  );

  if (data.clusters.length === 0) {
    return (
      <Box
        sx={{
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: 1,
          color: 'text.secondary',
          px: 3,
        }}
      >
        <Typography variant="h6" color="text.primary">
          No migration data yet
        </Typography>
        <Typography variant="body2" textAlign="center">
          Add migration details to family profiles to see them on the map.
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        position: 'relative',
        height: '100%',
        width: '100%',
        '& .leaflet-container': { height: '100%', width: '100%' },
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: 16,
          right: 16,
          zIndex: 1000,
        }}
      >
        <PillNavGroup
          aria-label="Map region"
          value={viewMode}
          items={MAP_VIEW_ITEMS}
          onChange={setViewMode}
        />
      </Box>

      <MapContainer
        center={WORLD_CENTER}
        zoom={WORLD_ZOOM}
        scrollWheelZoom
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapViewport
          mode={viewMode}
          allPositions={data.allPositions}
          phPositions={phPositions}
        />
        {visibleRoutes.map((route) => (
          <Polyline
            key={route.personId}
            positions={route.positions}
            pathOptions={{
              color: route.color,
              weight: 2,
              opacity: 0.55,
              dashArray: '5 7',
            }}
          />
        ))}
        {visibleClusters.map((cluster) => (
          <Marker key={cluster.place.id} position={[cluster.place.lat, cluster.place.lng]}>
            <Popup maxWidth={280}>
              <Typography component="strong" variant="subtitle2" sx={{ display: 'block', mb: 0.5 }}>
                {cluster.place.label}
              </Typography>
              <Box component="ul" sx={{ m: 0, pl: 2.25 }}>
                {cluster.people.map((person) => (
                  <Box component="li" key={person.id} sx={{ mb: 0.5 }}>
                    {onSelectPerson ? (
                      <Box
                        component="button"
                        type="button"
                        onClick={() => onSelectPerson(person.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          padding: 0,
                          color: '#7c3aed',
                          cursor: 'pointer',
                          textDecoration: 'underline',
                          font: 'inherit',
                        }}
                      >
                        {person.name}
                      </Box>
                    ) : (
                      person.name
                    )}
                    <Typography component="span" variant="caption" color="text.secondary">
                      {' '}
                      · {person.note}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </Box>
  );
}
