import { supabase } from "@/api/base44Client";

export async function resolveUsers(ids) {
  const uniqueIds = [...new Set((ids || []).filter(Boolean))];

  if (uniqueIds.length === 0) {
    return {
      names: {},
      reviewCounts: {},
      verifiedIds: [],
    };
  }

  const { data: profiles, error: profilesError } = await supabase
    .from("profiles")
    .select("id, full_name")
    .in("id", uniqueIds);

  if (profilesError) {
    throw profilesError;
  }

  const { data: reviews, error: reviewsError } = await supabase
    .from("reviews")
    .select("reviewee_id")
    .in("reviewee_id", uniqueIds);

  if (reviewsError) {
    throw reviewsError;
  }

  const { data: verificationRequests, error: verificationError } = await supabase
    .from("verification_requests")
    .select("user_id")
    .eq("status", "approved")
    .in("user_id", uniqueIds);

  if (verificationError) {
    throw verificationError;
  }

  const names = {};
  const reviewCounts = {};
  const verifiedIds = [];

  uniqueIds.forEach((id) => {
    names[id] = "Barti member";
    reviewCounts[id] = 0;
  });

  (profiles || []).forEach((profile) => {
    const name = profile.full_name?.trim();

    if (name) {
      names[profile.id] = name;
    }

  });

  (reviews || []).forEach((review) => {
    if (review.reviewee_id) {
      reviewCounts[review.reviewee_id] =
        (reviewCounts[review.reviewee_id] || 0) + 1;
    }
  });

  (verificationRequests || []).forEach((request) => {
    if (request.user_id) {
      verifiedIds.push(request.user_id);
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
