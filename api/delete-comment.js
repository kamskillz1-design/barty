import { getRequestUser, getServiceRoleClient, json } from "./_supabase.js";

export default async function handler(req) {
  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  try {
    const user = await getRequestUser(req);

    if (!user) {
      return json({ error: "Unauthorized" }, 401);
    }

    const body = await req.json().catch(() => ({}));
    const commentId = `${body?.comment_id || ""}`.trim();

    if (!commentId) {
      return json({ error: "comment_id is required" }, 400);
    }

    const admin = getServiceRoleClient();

    const { data: comment, error: commentError } = await admin
      .from("comments")
      .select("id, author_id, listing_id")
      .eq("id", commentId)
      .maybeSingle();

    if (commentError) {
      throw commentError;
    }

    if (!comment) {
      return json({ error: "Not found" }, 404);
    }

    const { data: profile, error: profileError } = await admin
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError) {
      throw profileError;
    }

    const isAdmin = profile?.role === "admin";
    let canDelete = comment.author_id === user.id || isAdmin;

    if (!canDelete && comment.listing_id) {
      const { data: listing, error: listingError } = await admin
        .from("listings")
        .select("offering_user_id")
        .eq("id", comment.listing_id)
        .maybeSingle();

      if (listingError) {
        throw listingError;
      }

      canDelete = listing?.offering_user_id === user.id;
    }

    if (!canDelete) {
      return json({ error: "Forbidden" }, 403);
    }

    const { error: deleteError } = await admin
      .from("comments")
      .delete()
      .eq("id", commentId);

    if (deleteError) {
      throw deleteError;
    }

    return json({ ok: true });
  } catch (error) {
    return json({ error: error.message || "Unable to delete comment" }, 500);
  }
}
