// Transactional trade emails are intentionally disabled during the Supabase
// migration. This no-op keeps trade creation, messages, and counter-offers
// working until a Supabase Edge Function and email provider are configured.

export async function notifyTradeEvent(_tradeId, _kind) {
  return { ok: true, skipped: true };
}
