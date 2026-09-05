import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

const HIDE_THRESHOLD = 3;

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const listingId = body?.listing_id;
    const reason = body?.reason;
    const note = body?.note || '';
    if (!listingId || !reason) {
      return Response.json({ error: 'listing_id and reason required' }, { status: 400 });
    }

    // De-dupe: a user can only flag a given listing once.
    const existing = await base44.asServiceRole.entities.ListingFlag.filter(
      { listing_id: listingId, created_by_id: user.id },
      '-created_date',
      1
    );
    if (existing && existing.length) {
      return Response.json({ ok: true, alreadyFlagged: true });
    }

    // Create as the user so created_by_id is stamped correctly.
    await base44.entities.ListingFlag.create({
      listing_id: listingId,
      reporter_id: user.id,
      reason,
      note,
      status: 'open'
    });

    // Count distinct reporters (service-role read sees all flags).
    const all = await base44.asServiceRole.entities.ListingFlag.filter(
      { listing_id: listingId },
      '-created_date',
      200
    );
    const reporters = new Set((all || []).map((f) => f.created_by_id));
    let hidden = false;
    if (reporters.size >= HIDE_THRESHOLD) {
      try {
        await base44.asServiceRole.entities.Listing.update(listingId, { status: 'hidden' });
        hidden = true;
      } catch { /* listing may have been removed */ }
    }

    return Response.json({ ok: true, hidden, reporterCount: reporters.size });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}