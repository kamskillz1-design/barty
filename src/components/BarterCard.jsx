import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeftRight, Wrench, Package, MapPin, User } from 'lucide-react';
import moment from 'moment';
import { useI18n } from '@/lib/i18n';
import { Image } from '@/components/ui/image';

/**
 * BarterCard — renders ONE listing as a single, indivisible trade proposition
 * containing both the Offering half and the Seeking half. The feed loop maps
 * over the listings table and outputs exactly one BarterCard per record.
 */
export default function BarterCard({ listing }) {
  const { t } = useI18n();
  const isSeekingIntent = (listing.intent || 'offering') === 'seeking';

  // The listing's own title/image is the " Offering " half when intent=offering,
  // and the " Seeking " half when intent=seeking. The counterpart half comes
  // from seeking_interests / item_seeking_title / is_seeking_anything.
  const offeredTitle = isSeekingIntent
    ? (listing.seeking_interests?.[0] || listing.item_seeking_title || listing.title)
    : listing.title;
  const offeredImage = listing.image_urls?.[0];
  const soughtTitle = isSeekingIntent
    ? listing.title
    : (listing.item_seeking_title || listing.seeking_interests?.[0] || '');
  const openToAnything = !!listing.is_seeking_anything;

  const loc = [listing.city, listing.country].filter(Boolean).join(', ');

  return (
    <Link
      to={`/listings/${listing.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-slate-200/60"
    >
      {/* User Header */}
      <div className="flex items-center gap-2.5 border-b border-slate-100 px-4 py-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sky-100 text-sky-600">
          <User className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-slate-700">
            {t.listing.by} {t.common.member}
          </p>
          <p className="text-xs text-slate-400">
            {listing.created_date ? moment(listing.created_date).fromNow() : ''}
          </p>
        </div>
        <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${isSeekingIntent ? 'bg-amber-500 text-white' : 'bg-sky-500 text-white'}`}>
          {isSeekingIntent ? `🔍 ${t.listing.seeking}` : `🎁 ${t.listing.offering}`}
        </span>
      </div>

      {/* Offering half */}
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-slate-100">
          {offeredImage ? (
            <Image src={offeredImage} alt={offeredTitle} className="h-full w-full object-cover" fittingType="fill" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-slate-300">
              {listing.type === 'service' ? <Wrench className="h-6 w-6" /> : <Package className="h-6 w-6" />}
            </div>
          )}
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-sky-600">{t.listing.offering}</p>
          <p className="line-clamp-2 text-sm font-semibold text-slate-900">{offeredTitle}</p>
        </div>
      </div>

      {/* Swap bridge */}
      <div className="flex items-center justify-center py-1">
        <span className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-400 group-hover:bg-sky-50 group-hover:text-sky-500">
          <ArrowLeftRight className="h-4 w-4" />
        </span>
      </div>

      {/* Seeking half */}
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-amber-50">
          <div className="flex h-full w-full items-center justify-center text-amber-400">
            <Package className="h-6 w-6" />
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-amber-600">{t.listing.seeking}</p>
          {openToAnything ? (
            <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
              ✨ {t.listing.seekingAnythingBadge}
            </span>
          ) : soughtTitle ? (
            <p className="line-clamp-2 text-sm font-semibold text-slate-900">{soughtTitle}</p>
          ) : (
            <span className="text-sm italic text-slate-400">{t.listing.lookingFor}</span>
          )}
        </div>
      </div>

      {/* Footer: location + action */}
      <div className="mt-auto flex items-center justify-between gap-2 border-t border-slate-100 px-4 py-3">
        <span className="flex items-center gap-1 text-xs text-slate-400">
          {loc && <><MapPin className="h-3.5 w-3.5" /> <span className="truncate">{loc}</span></>}
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-xl bg-sky-500 px-3.5 py-2 text-xs font-semibold text-white group-hover:bg-sky-600">
          {t.common.propose}
        </span>
      </div>
    </Link>
  );
}