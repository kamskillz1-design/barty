import { base44 } from "@/api/base44Client";

// One-directional blocking: a blocked user cannot see the blocker's profile
// or listings, while the blocker can still see the blocked user. Records are
// retained with active = false when a block is lifted.

export async function getBlockState(viewerId, otherId) {
  if (!viewerId || !otherId) {
    return {
      blockByMe: false,
      blockByOther: false,
    };
  }

  const { data, error } = await base44
    .from("user_blocks")
    .select("blocker_id, blocked_id")
    .eq("active", true)
    .or(
      `and(blocker_id.eq.${viewerId},blocked_id.eq.${otherId}),and(blocker_id.eq.${otherId},blocked_id.eq.${viewerId})`
    );

  if (error) {
    throw error;
  }

  return {
    blockByMe: (data || []).some(
      (block) =>
        block.blocker_id === viewerId && block.blocked_id === otherId
    ),
    blockByOther: (data || []).some(
      (block) =>
        block.blocker_id === otherId && block.blocked_id === viewerId
    ),
  };
}

// Users who have blocked the viewer; used to hide their listings in Explore.
export async function getBlockerIds(viewerId) {
  if (!viewerId) {
    return new Set();
  }

  const { data, error } = await base44
    .from("user_blocks")
    .select("blocker_id")
    .eq("blocked_id", viewerId)
    .eq("active", true);

  if (error) {
    throw error;
  }

  return new Set((data || []).map((block) => block.blocker_id).filter(Boolean));
}

export async function blockUser(viewerId, otherId) {
  if (!viewerId || !otherId) {
    throw new Error("Both user IDs are required.");
  }

  if (viewerId === otherId) {
    throw new Error("You cannot block yourself.");
  }

  const { data: existing, error: lookupError } = await base44
    .from("user_blocks")
    .select("id, active")
    .eq("blocker_id", viewerId)
    .eq("blocked_id", otherId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (lookupError) {
    throw lookupError;
  }

  if (existing?.active) {
    return existing;
  }

  if (existing) {
    const { data, error } = await base44
      .from("user_blocks")
      .update({
        active: true,
        unblocked_date: null,
      })
      .eq("id", existing.id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  }

  const { data, error } = await base44
    .from("user_blocks")
    .insert({
      blocker_id: viewerId,
      blocked_id: otherId,
      active: true,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

// Lift the viewer's active block while retaining the row for accountability.
export async function unblockUser(viewerId, otherId) {
  if (!viewerId || !otherId) {
    throw new Error("Both user IDs are required.");
  }

  const { data, error } = await base44
    .from("user_blocks")
    .update({
      active: false,
      unblocked_date: new Date().toISOString(),
    })
    .eq("blocker_id", viewerId)
    .eq("blocked_id", otherId)
    .eq("active", true)
    .select();

  if (error) {
    throw error;
  }

  return data?.[0] ?? null;
}
