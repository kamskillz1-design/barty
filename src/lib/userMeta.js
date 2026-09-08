import { base44 } from '@/api/base44Client';

// One batched server lookup for user display data: display names, review
// counts (for the "new trader" badge) and verified status (for the verified
// badge). Runs server-side because the browser cannot read other users'
// records directly; a single call returns everything a page needs.
export async function resolveUsers(ids) {
  const res = await base44.functions.invoke('resolveUserNames', { ids });
  return {
    names: res?.data?.names || res?.names || {},
    reviewCounts: res?.data?.reviewCounts || res?.reviewCounts || {},
    verifiedIds: res?.data?.verified || res?.verified || []
  };
}

// Per-user badge metadata consumed by OwnerBadges.
export function buildUserMeta(ids, { reviewCounts, verifiedIds }) {
  const meta = {};
  (ids || []).forEach((uid) => {
    meta[uid] = { reviewCount: reviewCounts[uid] ?? 0, verified: verifiedIds.includes(uid) };
  });
  return meta;
}