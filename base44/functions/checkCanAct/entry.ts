import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

// Server-side gate for gated client actions (create/edit listing, propose
// trade, message, comment, start call). Reads the user's CURRENT status from
// the DB so a stale client cache can't bypass a fresh suspension. Also
// auto-restores an expired suspension on the fly.
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const status = user.status || 'active';
    const suspendedUntil = user.suspended_until || null;
    let blocked = false;

    if (status === 'banned') {
      blocked = true;
    } else if (status === 'suspended') {
      const expired = suspendedUntil && new Date(suspendedUntil).getTime() <= Date.now();
      if (expired) {
        try { await base44.asServiceRole.entities.User.update(user.id, { status: 'active', suspended_until: null }); } catch {}
      } else {
        blocked = true;
      }
    }

    return Response.json({ canAct: !blocked, blocked, status, suspendedUntil });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}