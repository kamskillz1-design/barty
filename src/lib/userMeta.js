import { base44 } from "@/api/base44Client";

export async function resolveUsers(ids) {
  const uniqueIds = [...new Set((ids || []).filter(Boolean))];

  if (uniqueIds.length === 0) {
    return {
      names: {},
      reviewCounts: {},
      verifiedIds: [],
    };
  }

  const { data: profiles, error: profilesError } = await base44
    .from("profiles")
    .select("id, display_name, full_name, is_verified, verified")
    .in("id", uniqueIds);

  if (profilesError) {
    throw profilesError;
  }

  const { data: reviews, error: reviewsError } = await base44
    .from("reviews")
    .select("reviewed_user_id")
    .in("reviewed_user_id", uniqueIds);

  if (reviewsError) {
    throw reviewsError;
  }

  const names = {};
  const reviewCounts = {};
  const verifiedIds = [];

  uniqueIds.forEach((id) => {
    names[id] = "Barti member";
    reviewCounts[id] = 0;
  });

  (profiles || []).forEach((profile) => {
    names[profile.id] =
      profile.display_name || profile.full_name || "Barti member";

    if (profile.is_verified || profile.verified) {
      verifiedIds.push(profile.id);
    }
  });

  (reviews || []).forEach((review) => {
    if (review.reviewed_user_id) {
      reviewCounts[review.reviewed_user_id] =
        (reviewCounts[review.reviewed_user_id] || 0) + 1;
    }
  });

  return {
    names,
    reviewCounts,
    verifiedIds,
  };
}

export function buildUserMeta(ids, { reviewCounts = {}, verifiedIds = [] }) {
  const verifiedSet = new Set(verifiedIds);
  const meta = {};

  (ids || []).forEach((uid) => {
    meta[uid] = {
      reviewCount: reviewCounts[uid] ?? 0,
      verified: verifiedSet.has(uid),
    };
  });

  return meta;
}
