import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';
import { sendTradeEmail, APP_URL } from '../../shared/tradeNotify.ts';

// Scheduled (daily) maintenance task invoked by the Stale Listing Prompts
// workflow. For available listings whose last owner confirmation is older than
// 60 days, emails the owner a "still available?" prompt at most once every 30
// days per listing. Unconfirmed stale listings are demoted in Explore ranking.
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const now = Date.now();
    const STALE_MS = 60 * 24 * 60 * 60 * 1000;     // stale threshold: 60 days
    const PROMPT_GAP_MS = 30 * 24 * 60 * 60 * 1000; // at most one prompt per 30 days

    const listings = await base44.asServiceRole.entities.Listing.filter({ status: 'available' }, '-created_date', 500);
    let prompted = 0;
    for (const l of (listings || [])) {
      try {
        const confirmed = l.last_confirmed_date ? new Date(l.last_confirmed_date).getTime() : 0;
        if (!confirmed) continue; // no confirmation yet — created/edited flows set it
        if (now - confirmed < STALE_MS) continue;
        const lastPrompt = l.stale_prompted_date ? new Date(l.stale_prompted_date).getTime() : 0;
        if (lastPrompt && now - lastPrompt < PROMPT_GAP_MS) continue;

        const link = `${APP_URL}/listings/${l.id}`;
        const subject = 'Is your Barti listing still available?';
        const bodyText = `Your listing "${l.title || 'an item'}" hasn't been confirmed in a while. If it's still available, open it and tap "Yes, still available" so it stays visible in Explore: ${link}`;
        await sendTradeEmail(base44, l.offering_user_id, subject, bodyText);
        await base44.asServiceRole.entities.Listing.update(l.id, { stale_prompted_date: new Date().toISOString() });
        prompted++;
      } catch { /* skip this listing, keep processing */ }
    }

    return Response.json({ ok: true, prompted });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}