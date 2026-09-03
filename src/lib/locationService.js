// LocationService — an Abstract Data Type that encapsulates the "secrets" of how
// the user's location is resolved: browser Geolocation API → IP-based estimate →
// centralized default region. Callers never deal with permissions, error
// callbacks, or fallback ordering — they just call getCurrentLocation().
//
// Platform note: uses only standard Web APIs + a public key-less IP-geo endpoint
// + OSM Nominatim reverse-geocoding. No proprietary geolocation SDK, no spatial
// SaaS. All functions are stateless and never throw.

import { reverseGeocode } from '@/lib/geocode';

// Default region (Spanish default municipality). Used only when both browser
// geolocation and IP estimation are unavailable (e.g. permission denied / HTTP).
export const DEFAULT_AREA = {
  latitude: 40.4168,
  longitude: -3.7038,
  city: 'Madrid',
  country: 'Spain',
  source: 'default',
};

const EARTH_RADIUS_KM = 6371;
const toRad = (d) => (d * Math.PI) / 180;

// Standard Haversine great-circle distance in kilometres.
export function distanceBetween(lat1, lon1, lat2, lon2) {
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Resolves to { latitude, longitude } or null if denied/unsupported.
function getBrowserCoords() {
  return new Promise((resolve) => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) return resolve(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
      () => resolve(null),
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 60000 }
    );
  });
}

// IP-based fallback estimate via a public, key-less endpoint.
async function ipEstimate() {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 4000);
    const res = await fetch('https://ipapi.co/json/', { signal: controller.signal });
    clearTimeout(timer);
    if (!res.ok) return null;
    const d = await res.json();
    if (d && d.latitude != null && d.longitude != null) {
      return { latitude: d.latitude, longitude: d.longitude, city: d.city || '', country: d.country_name || '' };
    }
  } catch { /* network/CORS/HTTP — ignore */ }
  return null;
}

// Main entry point. Never throws — always resolves to an area object.
export async function getCurrentLocation() {
  const coords = await getBrowserCoords();
  if (coords) {
    const rev = await reverseGeocode(coords.latitude, coords.longitude);
    return {
      latitude: coords.latitude,
      longitude: coords.longitude,
      city: rev?.city || '',
      country: rev?.country || '',
      source: 'gps',
    };
  }
  const ip = await ipEstimate();
  if (ip) return { ...ip, source: 'ip' };
  return { ...DEFAULT_AREA };
}

export default { getCurrentLocation, distanceBetween, DEFAULT_AREA };