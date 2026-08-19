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

    const out = {};
    for (const id of ids) {
      try {
        const u = await base44.asServiceRole.entities.User.get(id);
        if (u) out[id] = u.full_name || '';
      } catch { /* skip unreadable user */ }
    }
    return Response.json({ names: out });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}