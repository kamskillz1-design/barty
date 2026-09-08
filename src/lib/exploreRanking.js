import { approxDistanceKm } from '@/lib/matching';
import { isListingStale } from '@/lib/listingFreshness';

// Applies the active Explore search criteria, then orders the results: city
// matches first, then same-country, then online listings, then the rest —
// within a tier nearest first when coordinates are known, with stale
// (unconfirmed ~60 days) listings demoted to the bottom. Pure function.
export function filterAndRankListings(listings, { q, category, exchType, countryFilter, townFilter, myCoords }) {
  const ql = q.trim().toLowerCase();
  const tl = townFilter.trim().toLowerCase();
  const base = (listings || []).filter((l) => {
    if (l.status === 'traded') return false;
    if (ql && !(`${l.title || ''} ${l.description || ''} ${(l.tags || []).join(' ')}`.toLowerCase().includes(ql))) return false;
    const isOnline = l.exchange_location === 'online';
    if (category && l.have_category !== category) return false;
    if (exchType && l.have_exchange_type !== exchType) return false;
    // Online listings bypass the local-area filters so they remain available as
    // fallback even when a city/country has been auto-detected.
    if (!isOnline) {
      if (countryFilter && (l.country || '').toLowerCase() !== countryFilter.toLowerCase()) return false;
      if (tl && !(`${l.town || ''} ${l.city || ''}`).toLowerCase().includes(tl)) return false;
    }
    return true;
  });

  const cl = tl;
  const cf = countryFilter.trim().toLowerCase();
  const dist = (l) => (myCoords && typeof l.lat === 'number' && typeof l.lng === 'number')
    ? approxDistanceKm(myCoords[0], myCoords[1], l.lat, l.lng)
    : Infinity;
  const rank = (l) => {
    let r;
    if (cl && (`${l.town || ''} ${l.city || ''}`).toLowerCase().includes(cl)) r = 0;
    else if (cf && (l.country || '').toLowerCase() === cf) r = 1;
    else if (l.exchange_location === 'online') r = 2;
    else r = 3;
    return isListingStale(l) ? r + 4 : r;
  };
  return [...base].sort((a, b) => (rank(a) - rank(b)) || (dist(a) - dist(b)));
}