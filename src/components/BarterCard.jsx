import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeftRight, Package, MapPin, User, Globe } from 'lucide-react';
import moment from 'moment';
import { useI18n } from '@/lib/i18n';
import { Image } from '@/components/ui/image';
import { EXCHANGE_TYPES, getCategory, subcatLabel, categoryLabel } from '@/lib/categories';
import OwnerBadges from '@/components/UserBadges';

/**
 * BarterCard — renders ONE listing as a single trade proposition: the HAVE
 * half (what the owner offers) on top and the WANT half (what they want in
 * return) below, with clear HAVING / WANTING badges.
 */
export default function BarterCard({ listing, ownerName, ownerMeta }) {
  const { t } = useI18n();

  const haveType = EXCHANGE_TYPES.find((x) => x.id === listing.have_exchange_type);
  const wantType = EXCHANGE_TYPES.find((x) => x.id === listing.want_exchange_type);
  const haveCat = categoryLabel(t, listing.have_category);
  const wantCat = categoryLabel(t, listing.want_category);
  const openToAnything = !!listing.is_open_to_anything;

  const haveLine = [haveCat, subcatLabel(t, listing.have_subcategory)].filter(Boolean).join(' · ');
  const wantLine = [wantCat, subcatLabel(t, listing.want_subcategory)].filter(Boolean).join(' · ');

  const loc = [listing.city, listing.country].filter(Boolean).join(', ');
  const exchLoc = listing.exchange_location ? t.exchLoc[listing.exchange_location] : '';

  const haveIcon = haveType ? haveType.icon : '📦';

  return (
    <Link
      to={`/listings/${listing.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-slate-200/60"
    >
      {/* Header */}
      <div className="flex items-center gap-2.5 border-b border-slate-100 px-4 py-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sky-100 text-sky-600">
          <User className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1.5">
            <span className="truncate text-sm font-medium text-slate-700 notranslate" translate="no">{ownerName || t.common.member}</span>
            <OwnerBadges meta={ownerMeta} />
          </p>
          <p className="text-xs text-slate-400">{listing.created_date ? moment(listing.created_date).fromNow() : ''}</p>
        </div>
        {exchLoc && (
          <span className="flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-500">
            <Globe className="h-3 w-3" /> {exchLoc}
          </span>
        )}
      </div>

      {/* HAVE half */}
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-slate-100">
          {listing.image_urls?.[0] ? (
            <Image src={listing.image_urls[0]} alt={listing.title} className="h-full w-full object-cover" fittingType="fill" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-2xl">{haveIcon}</div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-bold uppercase tracking-wide text-sky-600">{t.listing.have}</p>
          <p className="line-clamp-2 text-sm font-semibold text-slate-900">{listing.title}</p>
          {haveLine && <p className="mt-0.5 line-clamp-1 text-xs text-slate-400">{haveLine}</p>}
        </div>
      </div>

      {/* Swap bridge */}
      <div className="flex items-center justify-center py-1">
        <span className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-400 group-hover:bg-sky-50 group-hover:text-sky-500">
          <ArrowLeftRight className="h-4 w-4" />
        </span>
      </div>

      {/* WANT half */}
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-amber-50">
          <div className="flex h-full w-full items-center justify-center text-2xl">
            {openToAnything ? '✨' : (wantType ? wantType.icon : <Package className="h-6 w-6 text-amber-400" />)}
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-bold uppercase tracking-wide text-amber-600">{t.listing.want}</p>
          {openToAnything ? (
            <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
              ✨ {t.listing.openToAnything}
            </span>
          ) : (listing.want_title || wantLine) ? (
            <>
              <p className="line-clamp-2 text-sm font-semibold text-slate-900">{listing.want_title || wantLine}</p>
              {listing.want_description && (
                <p className="mt-0.5 line-clamp-1 text-xs text-slate-500">{listing.want_description}</p>
              )}
            </>
          ) : (
            <span className="text-sm italic text-slate-400">{t.listing.lookingFor}</span>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-auto flex items-center justify-between gap-2 border-t border-slate-100 px-4 py-3">
        <span className="flex items-center gap-1 text-xs text-slate-400">
          {loc && <><MapPin className="h-3.5 w-3.5" /> <span className="truncate">{loc}</span></>}
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-xl bg-sky-500 px-3.5 py-2 text-xs font-semibold text-white group-hover:bg-sky-600">
          {t.common.propose}
        </span>
      </div>

      {/* Tags */}
      {listing.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 border-t border-slate-100 px-4 py-2.5">
          {listing.tags.slice(0, 4).map((tg) => (
            <span key={tg} className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-500">#{tg}</span>
          ))}
        </div>
      )}
    </Link>
  );
}