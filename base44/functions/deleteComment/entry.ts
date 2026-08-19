import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const commentId = body?.comment_id;
    if (!commentId) return Response.json({ error: 'comment_id required' }, { status: 400 });

    const comment = await base44.asServiceRole.entities.Comment.get(commentId);
    if (!comment) return Response.json({ error: 'Not found' }, { status: 404 });

    const isAdmin = user.role === 'admin';
    if (comment.created_by_id === user.id || isAdmin) {
      await base44.asServiceRole.entities.Comment.delete(commentId);
      return Response.json({ ok: true });
    }

    // Listing owner may remove comments from their own listing.
    if (comment.listing_id) {
      const listing = await base44.asServiceRole.entities.Listing.get(comment.listing_id);
      if (listing && listing.offering_user_id === user.id) {
        await base44.asServiceRole.entities.Comment.delete(commentId);
        return Response.json({ ok: true });
      }
    }

    return Response.json({ error: 'Forbidden' }, { status: 403 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}