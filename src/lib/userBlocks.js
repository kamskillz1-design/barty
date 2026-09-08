import { base44 } from '@/api/base44Client';

// One-directional blocking: a blocked user (B) cannot see the blocker's (A)
// profile or listings, but A remains visible to B. Block records are always
// retained (active=false once lifted) so history stays for accountability.

// Active block relationship between the viewer and another user.
// blockByMe: has the viewer blocked the other user.
// blockByOther: has the other user blocked the viewer.
export async function getBlockState(viewerId, otherId) {
  const theirs = await base44.entities.UserBlock.filter({ blocked_id: viewerId, active: true });
  const mine = await base44.entities.UserBlock.filter({ blocked_id: otherId, active: true });
  return {
    blockByMe: (mine || []).some((b) => b.blocker_id === viewerId),
    blockByOther: (theirs || []).some((b) => b.blocker_id === otherId)
  };
}

// Users who have blocked the viewer — used to hide their listings from Explore.
export async function getBlockerIds(viewerId) {
  const blocks = await base44.entities.UserBlock.filter({ blocked_id: viewerId, active: true });
  return new Set((blocks || []).map((b) => b.blocker_id).filter(Boolean));
}

export async function blockUser(viewerId, otherId) {
  await base44.entities.UserBlock.create({ blocker_id: viewerId, blocked_id: otherId, active: true });
}

// Lift the viewer's active block; the record is kept (active=false) for history.
export async function unblockUser(viewerId, otherId) {
  const mine = await base44.entities.UserBlock.filter({ blocked_id: otherId, active: true });
  const record = (mine || []).find((b) => b.blocker_id === viewerId);
  if (record) {
    await base44.entities.UserBlock.update(record.id, { active: false, unblocked_date: new Date().toISOString() });
  }
}