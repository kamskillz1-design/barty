import { useEffect, useState } from 'react';
import { getUserLocation, reverseGeocode } from '@/lib/geocode';

const SESSION_KEY = 'ibarti_explore_loc';

// Detects the visitor's area once per session (cached in sessionStorage) and
// exposes the Explore country/town filter values plus the viewer's coordinates
// for proximity ranking. Silent on failure — filters just stay empty.
export default function useDetectedLocation() {
  const [country, setCountry] = useState('');
  const [town, setTown] = useState('');
  const [coords, setCoords] = useState(null);

  useEffect(() => {
    (async () => {
      let loc = null;
      try { loc = JSON.parse(sessionStorage.getItem(SESSION_KEY) || 'null'); } catch { /* ignore */ }
      if (!loc) {
        const position = await getUserLocation();
        if (position) {
          const rev = await reverseGeocode(position[0], position[1]);
          if (rev && (rev.country || rev.city)) {
            loc = { ...rev, lat: position[0], lng: position[1] };
            try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(loc)); } catch { /* ignore */ }
          }
        }
      }
      if (loc) {
        if (loc.country) setCountry(loc.country);
        if (loc.city) setTown(loc.city);
        if (typeof loc.lat === 'number' && typeof loc.lng === 'number') setCoords([loc.lat, loc.lng]);
      }
    })();
  }, []);

  return { country, setCountry, town, setTown, coords };
}