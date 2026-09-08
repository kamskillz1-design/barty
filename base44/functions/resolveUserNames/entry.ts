import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

// Maps an array of user ids → { id, full_name }. Runs server-side so the
// service role (which can read User records) is available; the browser client
// cannot read other users' profiles directly.
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const ids = Array.isArray(body?.ids) ? [...new Set(body.ids.filter(Boolean))] : [];
    if (ids.length === 0) return Response.json({ names: {} });

    // One batched lookup per user: display name, review count (for the
    // "new trader" indicator) and verified status (for the badge). Returns all
    // three maps together so pages need a single call for owner metadata.
    const out = {};
    const reviewCounts = {};
    const verifiedIds = [];
    for (const id of ids) {
      try {
        const u = await base44.asServiceRole.entities.User.get(id);
        if (u) out[id] = u.full_name || '';
      } catch { /* skip unreadable user */ }
      try {
        const revs = await base44.asServiceRole.entities.Review.filter({ reviewee_id: id });
        reviewCounts[id] = (revs || []).length;
      } catch { reviewCounts[id] = 0; }
      try {
        const vr = await base44.asServiceRole.entities.VerificationRequest.filter({ user_id: id, status: 'approved' });
        if ((vr || []).length) verifiedIds.push(id);
      } catch { /* verification unknown — treat as unverified */ }
    }
    return Response.json({ names: out, reviewCounts, verified: verifiedIds });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}