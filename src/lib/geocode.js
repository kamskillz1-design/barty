// Lightweight OpenStreetMap geocoding + browser geolocation helpers used by the
// Safe Exchange Hubs map. Nominatim is used for address -> coordinates.

export async function geocode(query) {
  if (!query) return null;
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`;
    const res = await fetch(url, { headers: { Accept: 'application/json' } });
    const data = await res.json();
    if (Array.isArray(data) && data[0]) {
      return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lng) };
    }
  } catch { /* network/CORS — ignore, spot saved without coords */ }
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