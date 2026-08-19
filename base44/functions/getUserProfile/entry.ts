import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

// Returns a single user's public profile fields (full_name, city, country, bio)
// server-side via the service role. The browser client cannot read other users'
// User records directly, so this proxies the safe, public subset of fields.
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const id = (body?.id || '').trim();
    if (!id) return Response.json({ error: 'Missing id' }, { status: 400 });

    const u = await base44.asServiceRole.entities.User.get(id);
    if (!u) return Response.json({ error: 'Not found' }, { status: 404 });

    return Response.json({
      user: {
        id: u.id,
        full_name: u.full_name || '',
        city: u.city || '',
        country: u.country || '',
        bio: u.bio || ''
      }
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}