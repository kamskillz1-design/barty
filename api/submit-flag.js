import { getRequestUser, getServiceRoleClient, json } from "./_supabase.js";

const HIDE_THRESHOLD = 3;

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
    const listingId = `${body?.listing_id || ""}`.trim();
    const reason = `${body?.reason || ""}`.trim();
    const note = `${body?.note || ""}`.trim();

    if (!listingId || !reason) {
      return json({ error: "listing_id and reason are required" }, 400);
    }

    const admin = getServiceRoleClient();
    const { data: existing, error: existingError } = await admin
      .from("listing_flags")
      .select("id")
      .eq("listing_id", listingId)
      .eq("reporter_id", user.id)
      .limit(1)
      .maybeSingle();

    if (existingError) {
      throw existingError;
    }

    if (existing) {
      return json({ ok: true, alreadyFlagged: true });
    }

    const { error: insertError } = await admin.from("listing_flags").insert({
      listing_id: listingId,
      reporter_id: user.id,
      reason,
      note,
      status: "open",
    });

    if (insertError) {
      throw insertError;
    }

    const { data: flags, error: flagsError } = await admin
      .from("listing_flags")
      .select("reporter_id")
      .eq("listing_id", listingId);

    if (flagsError) {
      throw flagsError;
    }

    const reporterCount = new Set(
      (flags || []).map((flag) => flag.reporter_id).filter(Boolean)
    ).size;

    let hidden = false;

    if (reporterCount >= HIDE_THRESHOLD) {
      const { error: updateError } = await admin
        .from("listings")
        .update({ status: "hidden" })
        .eq("id", listingId);

      if (!updateError) {
        hidden = true;
      }
    }

    return json({ ok: true, hidden, reporterCount });
  } catch (error) {
    return json({ error: error.message || "Unable to submit flag" }, 500);
  }
}
