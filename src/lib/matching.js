// Matching engine for the "Suggested for you" section. Scores how well one of
// MY listings pairs with ANOTHER member's listing: my WANT side against their
// HAVE side and vice versa, plus fairness-value proximity. Pure functions —
// shared by any page that wants suggestions, no per-page duplication.

// Pair score for (my listing X, their listing Y). Higher is better; < 25 means
// not worth surfacing. Returns -1 when the pairing is impossible.
export function scoreListingPair(mine, theirs) {
  if (!mine || !theirs) return -1;
  if (mine.offering_user_id && mine.offering_user_id === theirs.offering_user_id) return -1;
  let s = 0;

  // My WANT vs their HAVE — the item I'm looking for vs what they offer.
  if (mine.want_category && mine.want_category === theirs.have_category) s += 40;
  else if (mine.want_exchange_type && mine.want_exchange_type === theirs.have_exchange_type) s += 15;
  if (mine.is_open_to_anything) s += 10; // I accept anything they might offer

  // Their WANT vs my HAVE — what they'd like back from me.
  if (theirs.want_category && theirs.want_category === mine.have_category) s += 30;
  else if (theirs.want_exchange_type === mine.have_exchange_type) s += 10;
  if (theirs.is_open_to_anything) s += 15; // they accept what I have

  // Fairness proximity — similar baseline values make a balanced trade.
  const a = Number(mine.baseline_value) || 50;
  const b = Number(theirs.baseline_value) || 50;
  s += Math.max(0, 15 - Math.abs(a - b) / 4);

  return s;
}

// Best suggestion set across all of my listings. Returns [{listing, score}]
// sorted by score, excluding unavailable/traded listings and my own.
export function suggestForMe(myListings, allListings, limit = 6, minScore = 25) {
  const mine = (myListings || []).filter((m) => m.status === 'available');
  if (!mine.length) return [];
  const best = new Map();
  for (const m of mine) {
    for (const l of (allListings || [])) {
      if (l.status !== 'available' && l.status !== 'reserved') continue;
      const score = scoreListingPair(m, l);
      if (score >= minScore && (!best.has(l.id) || best.get(l.id).score < score)) {
        best.set(l.id, { listing: l, score });
      }
    }
  }
  return [...best.values()].sort((a, b) => b.score - a.score).slice(0, limit);
}

// Approximate distance in km between two [lat, lng] points (equirectangular —
// fine for ranking, no need for haversine precision).
export function approxDistanceKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const x = dLng * Math.cos(((lat1 + lat2) / 2) * (Math.PI / 180));
  return Math.sqrt(dLat * dLat + x * x) * R;
}