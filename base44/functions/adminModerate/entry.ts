import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

// Admin-only moderation actions. Verifies the caller is an admin, then resolves
// listing/user flags and applies the matching listing/user status change.
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const body = await req.json();
    const action = body?.action;
    const listingId = body?.listing_id;
    const userId = body?.user_id;
    const flagId = body?.flag_id;
    const flagType = body?.flag_type;

    const sr = base44.asServiceRole;

    if (action === 'restore_listing') {
      if (listingId) { try { await sr.entities.Listing.update(listingId, { status: 'available' }); } catch {} }
      if (flagId) { try { await sr.entities.ListingFlag.update(flagId, { status: 'restored' }); } catch {} }
    } else if (action === 'remove_listing') {
      if (listingId) { try { await sr.entities.Listing.update(listingId, { status: 'hidden' }); } catch {} }
      if (flagId) { try { await sr.entities.ListingFlag.update(flagId, { status: 'removed' }); } catch {} }
    } else if (action === 'restore_user') {
      if (userId) { try { await sr.entities.User.update(userId, { status: 'active', suspended_until: null }); } catch {} }
      try { await sr.entities.UserFlag.updateMany({ reported_user_id: userId, status: 'open' }, { $set: { status: 'restored' } }); } catch {}
    } else if (action === 'ban_user') {
      if (userId) { try { await sr.entities.User.update(userId, { status: 'banned', suspended_until: null }); } catch {} }
      try { await sr.entities.UserFlag.updateMany({ reported_user_id: userId, status: 'open' }, { $set: { status: 'removed' } }); } catch {}
    } else if (action === 'reopen') {
      if (flagType === 'listing' && flagId) { try { await sr.entities.ListingFlag.update(flagId, { status: 'open' }); } catch {} }
      if (flagType === 'user' && flagId) { try { await sr.entities.UserFlag.update(flagId, { status: 'open' }); } catch {} }
    } else {
      return Response.json({ error: 'Unknown action' }, { status: 400 });
    }

    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}