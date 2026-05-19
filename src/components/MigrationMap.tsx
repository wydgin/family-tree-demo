import { useEffect, useMemo } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import L from 'leaflet';
import {
  MapContainer,
  Marker,
  Polyline,
  Popup,
  TileLayer,
  useMap,
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

import type { LifeMilestones } from '../data/familyProfileTypes';
import { buildMigrationMapView } from '../utils/migrationMapData';

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

const currentIcon = L.icon({
  ...defaultIcon.options,
  className: 'migration-marker migration-marker--current',
});

L.Marker.prototype.options.icon = defaultIcon;

type MigrationMapProps = {
  milestones: LifeMilestones;
  personName: string;
};

function FitBounds({ positions }: { positions: [number, number][] }) {
  const map = useMap();

  useEffect(() => {
    if (positions.length === 0) return;
    if (positions.length === 1) {
      map.setView(positions[0], 8);
      return;
    }
    map.fitBounds(L.latLngBounds(positions), { padding: [28, 28], maxZoom: 10 });
  }, [map, positions]);

  return null;
}

export function MigrationMap({ milestones, personName }: MigrationMapProps) {
  const view = useMemo(() => buildMigrationMapView(milestones), [milestones]);

  if (!view) return null;

  const positions: [number, number][] = view.markers.map((m) => [m.place.lat, m.place.lng]);
  const routePositions: [number, number][] = view.route.map((p) => [p.lat, p.lng]);

  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.75 }}>
        Migration map (OpenStreetMap)
      </Typography>
      <Box
        sx={{
          height: 220,
          borderRadius: 1,
          overflow: 'hidden',
          border: 1,
          borderColor: 'divider',
          '& .leaflet-container': {
            height: '100%',
            width: '100%',
            font: 'inherit',
          },
        }}
      >
        <MapContainer
          center={view.center}
          zoom={view.zoom}
          scrollWheelZoom={false}
          attributionControl
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <FitBounds positions={positions} />
          {routePositions.length > 1 ? (
            <Polyline
              positions={routePositions}
              pathOptions={{ color: '#7c3aed', weight: 3, opacity: 0.75, dashArray: '6 8' }}
            />
          ) : null}
          {view.markers.map((marker) => (
            <Marker
              key={`${marker.place.id}-${marker.order}`}
              position={[marker.place.lat, marker.place.lng]}
              icon={marker.role === 'current' ? currentIcon : defaultIcon}
            >
              <Popup>
                <strong>{marker.place.label}</strong>
                <br />
                {personName}
                {marker.role === 'current' ? ' · current' : marker.order === 0 ? ' · origin' : ''}
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </Box>
    </Box>
  );
}
