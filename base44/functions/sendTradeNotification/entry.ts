import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';
import { waitUntil } from 'base44:runtime';
import { sendTradeEmail, APP_URL } from '../../shared/tradeNotify.ts';

// Notifies the other trade participant by email when a proposal, chat message
// or counter-offer arrives. Called from the frontend right after the record is
// created; the email itself is post-response work so the UI never waits on it.
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const tradeId = String(body?.trade_id || '');
    const kind = String(body?.kind || 'message');
    if (!tradeId) return Response.json({ error: 'trade_id required' }, { status: 400 });

    const trade = await base44.entities.Trade.get(tradeId);
    if (!trade) return Response.json({ error: 'Trade not found' }, { status: 404 });

    // Only a trade participant may trigger a notification about it.
    const senderId = user.id;
    if (trade.proposer_id !== senderId && trade.receiver_id !== senderId) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }
    const recipientId = trade.proposer_id === senderId ? trade.receiver_id : trade.proposer_id;

    const link = `${APP_URL}/trades/${tradeId}`;
    const title = trade.offered_listing_title || 'an item';

    let subject = 'New activity on your Barti trade';
    let bodyText = `You have a new update on your trade on Barti. Open the conversation: ${link}`;
    if (kind === 'proposal') {
      subject = 'New trade proposal on Barti';
      bodyText = `You received a new trade proposal: "${trade.offered_listing_title || 'an item'}" in exchange for "${trade.requested_listing_title || 'an item'}". View and respond here: ${link}`;
    } else if (kind === 'counter') {
      subject = 'Counter-offer on your Barti trade';
      bodyText = `Your trade proposal for "${trade.requested_listing_title || 'an item'}" received a counter-offer${trade.counter_listing_title ? `: "${trade.counter_listing_title}"` : ''}. View and respond here: ${link}`;
    } else if (kind === 'message') {
      subject = `New message about "${title}" on Barti`;
      bodyText = `You have a new message in your trade conversation on Barti: ${link}`;
    }

    waitUntil(
      (async () => {
        await sendTradeEmail(base44, recipientId, subject, bodyText);
      })()
    );

    return Response.json({ ok: true, recipient: recipientId });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}