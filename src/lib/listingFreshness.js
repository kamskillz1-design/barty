// A listing is stale when its owner hasn't confirmed it for ~60 days (or it
// has never been confirmed). Stale listings are demoted in Explore ranking,
// their owners get an emailed "still available?" prompt, and owners see a
// one-tap re-confirmation on the listing page.
export const STALE_LISTING_MS = 60 * 24 * 60 * 60 * 1000;

export function isListingStale(listing, nowMs = Date.now()) {
  const confirmed = listing?.last_confirmed_date ? new Date(listing.last_confirmed_date).getTime() : 0;
  return !confirmed || nowMs - confirmed > STALE_LISTING_MS;
}