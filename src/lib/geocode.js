// Lightweight OpenStreetMap geocoding + browser geolocation helpers used by the
// Safe Exchange Hubs map. Nominatim is used for address -> coordinates.

export async function geocode(query) {
  if (!query) return null;
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(url, { headers: { Accept: 'application/json' }, signal: controller.signal });
    clearTimeout(timer);
    const data = await res.json();
    if (Array.isArray(data) && data[0]) {
      return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lng) };
    }
  } catch { /* network/CORS — ignore, spot saved without coords */ }
  return null;
}

// Reverse-geocode [lat, lng] → { country, city } via Nominatim.
export async function reverseGeocode(lat, lng) {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10&addressdetails=1`;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(url, { headers: { Accept: 'application/json' }, signal: controller.signal });
    clearTimeout(timer);
    const data = await res.json();
    const a = data?.address || {};
    const country = a.country || '';
    const city = a.city || a.town || a.village || a.municipality || a.county || a.state_district || '';
    return { country, city };
  } catch { /* network/CORS — ignore */ }
  return null;
}

// Resolves to [lat, lng] or null if denied/unsupported.
export function getUserLocation() {
  return new Promise((resolve) => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) return resolve(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve([pos.coords.latitude, pos.coords.longitude]),
      () => resolve(null),
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 60000 }
    );
  });
}