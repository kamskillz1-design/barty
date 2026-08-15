import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useI18n } from '@/lib/i18n';

const DEFAULT_CENTER = [20, 0];

function pinIcon(verified) {
  return L.divIcon({
    className: 'barti-pin',
    html: `<div style="
      display:flex;align-items:center;justify-content:center;
      width:28px;height:28px;border-radius:50% 50% 50% 0;
      transform:rotate(45deg);
      background:${verified ? '#059669' : '#0ea5e9'};
      border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.3);
      font-size:14px;color:#fff;">${verified ? '✓' : ''}</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -26]
  });
}

// Moves the map whenever a new center arrives (e.g. after geolocation resolves).
function Recenter({ center }) {
  const map = useMap();
  React.useEffect(() => {
    if (center) map.setView(center, Math.max(map.getZoom(), 11));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [center]);
  return null;
}

export default function HubsMap({ spots, userLocation }) {
  const { t } = useI18n();
  const points = (spots || []).filter((s) => typeof s.lat === 'number' && typeof s.lng === 'number');
  const center = userLocation || (points.length ? [points[0].lat, points[0].lng] : DEFAULT_CENTER);
  const zoom = userLocation ? 12 : points.length ? 11 : 2;

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200" style={{ height: 360 }}>
      <MapContainer center={center} zoom={zoom} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Recenter center={userLocation} />
        {points.map((s) => (
          <Marker key={s.id} position={[s.lat, s.lng]} icon={pinIcon(s.verified)}>
            <Popup>
              <div>
                <strong>{s.name}</strong>
                <div style={{ fontSize: 11, color: '#64748b' }}>
                  {[s.address, s.city, s.country].filter(Boolean).join(', ')}
                </div>
                <div style={{ fontSize: 11, marginTop: 2, color: s.verified ? '#059669' : '#d97706' }}>
                  {s.verified ? t.hubs.verified : t.hubs.notVerified} · {s.vote_count || 0} {t.hubs.votesLabel}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}