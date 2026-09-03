import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

// Hourly safety net (invoked by the scheduled workflow, which has no user
// session). Restores users whose temporary suspension window has passed.
// If a user session IS present (direct hit), require admin — blocks non-admins
// from triggering it, while still allowing the scheduler through.
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch(() => null);
    if (user && user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const sr = base44.asServiceRole;
    const suspended = await sr.entities.User.filter({ status: 'suspended' }, '-created_date', 500);
    let restored = 0;
    for (const u of (suspended || [])) {
      if (u.suspended_until && new Date(u.suspended_until).getTime() <= Date.now()) {
        try { await sr.entities.User.update(u.id, { status: 'active', suspended_until: null }); restored++; } catch {}
      }
    }
    return Response.json({ ok: true, restored });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}