import React from 'react';
import { BadgeCheck, Sprout } from 'lucide-react';
import { useI18n } from '@/lib/i18n';

/**
 * VerifiedBadge — sky pill shown next to names of members whose verification
 * request an admin approved.
 */
export function VerifiedBadge() {
  const { t } = useI18n();
  return (
    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-sky-100 px-2 py-0.5 text-[10px] font-semibold text-sky-700 notranslate">
      <BadgeCheck className="h-3 w-3" /> {t.v2?.verified || 'Verified'}
    </span>
  );
}

/**
 * NewTraderBadge — amber pill for members with zero reviews, setting fair
 * expectations on cards and listing detail.
 */
export function NewTraderBadge() {
  const { t } = useI18n();
  return (
    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700 notranslate">
      <Sprout className="h-3 w-3" /> {t.v2?.newTrader || 'New trader'}
    </span>
  );
}

/**
 * OwnerBadges — renders the verification badge (approved members) and/or the
 * new-trader badge (zero reviews) for one owner, based on the metadata map
 * Explore/ListingDetail resolve in one backend call.
 */
export default function OwnerBadges({ meta }) {
  if (!meta) return null;
  const showVerified = !!meta.verified;
  const showNew = !showVerified && (meta.reviewCount ?? 0) === 0;
  if (!showVerified && !showNew) return null;
  return (
    <span className="inline-flex items-center gap-1">
      {showVerified && <VerifiedBadge />}
      {showNew && <NewTraderBadge />}
    </span>
  );
}