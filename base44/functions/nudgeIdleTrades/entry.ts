import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';
import { sendTradeEmail, APP_URL } from '../../shared/tradeNotify.ts';

// Scheduled (daily) maintenance task invoked by the Trade Nudges workflow.
// Finds accepted trades that have been sitting idle for more than 5 days with
// neither side confirming completion, and nudges both participants by email
// ("Did this exchange happen?") at most once every 7 days per trade.
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const now = Date.now();
    const IDLE_MS = 5 * 24 * 60 * 60 * 1000;    // idle threshold: 5 days
    const NUDGE_GAP_MS = 7 * 24 * 60 * 60 * 1000; // at most one nudge per 7 days

    const trades = await base44.asServiceRole.entities.Trade.filter({ status: 'accepted' }, '-updated_date', 500);
    let nudged = 0;
    for (const trade of (trades || [])) {
      try {
        if (trade.proposer_completed || trade.receiver_completed) continue;
        const updated = trade.updated_date ? new Date(trade.updated_date).getTime() : 0;
        if (!updated || now - updated < IDLE_MS) continue;
        const lastNudge = trade.nudged_date ? new Date(trade.nudged_date).getTime() : 0;
        if (lastNudge && now - lastNudge < NUDGE_GAP_MS) continue;

        const link = `${APP_URL}/trades/${trade.id}`;
        const subject = 'Did your Barti exchange happen?';
        const bodyText = `Your trade "${trade.offered_listing_title || 'an item'}" ⇄ "${trade.requested_listing_title || 'an item'}" has been waiting for a while. If you already met in person, open the trade and mark it as completed so both sides can leave a review: ${link}`;
        for (const uid of [trade.proposer_id, trade.receiver_id]) {
          if (!uid) continue;
          await sendTradeEmail(base44, uid, subject, bodyText);
        }
        await base44.asServiceRole.entities.Trade.update(trade.id, { nudged_date: new Date().toISOString() });
        nudged++;
      } catch { /* skip this trade, keep processing */ }
    }

    return Response.json({ ok: true, nudged });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}