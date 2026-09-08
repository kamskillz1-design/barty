import { base44 } from '@/api/base44Client';

// Fire-and-forget trade email notification (proposal / message / counter-offer).
// Email delivery is best-effort and must never block or break the UI.
export function notifyTradeEvent(tradeId, kind) {
  return base44.functions.invoke('sendTradeNotification', { trade_id: tradeId, kind }).catch(() => {});
}