// Shared trade-email helper used by sendTradeNotification, nudgeIdleTrades and
// promptStaleListings — one place for the notification-preference check and the
// SendEmail call so behavior stays identical everywhere.
export async function sendTradeEmail(base44, userId, subject, body) {
  try {
    const prefs = await base44.asServiceRole.entities.NotificationPreference.filter({ user_id: userId });
    if (prefs && prefs.length && prefs[0].email_notifications === false) {
      return { sent: false, reason: 'disabled' };
    }
    const u = await base44.asServiceRole.entities.User.get(userId);
    if (!u || !u.email) return { sent: false, reason: 'no-email' };
    await base44.asServiceRole.integrations.Core.SendEmail({ to: u.email, subject, body });
    return { sent: true };
  } catch (e) {
    return { sent: false, reason: 'error' };
  }
}

export const APP_URL = 'https://barti-swap-world.base44.app';