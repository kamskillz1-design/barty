import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Wrench, Package } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { Image } from '@/components/ui/image';

export default function ListingCard({ listing }) {
  const { t } = useI18n();
  const loc = [listing.city, listing.country].filter(Boolean).join(', ');
  return (
    <Link to={`/listings/${listing.id}`} className="group block overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-slate-200/60">
      <div className="relative aspect-[4/3] bg-slate-100">
        {listing.image_urls && listing.image_urls.length > 0 ? (
          <Image src={listing.image_urls[0]} alt={listing.title} className="h-full w-full object-cover" fittingType="fill" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-slate-300">
            {listing.type === 'service' ? <Wrench className="h-10 w-10" /> : <Package className="h-10 w-10" />}
          </div>
        )}
        <span className={`absolute top-2.5 start-2.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${(listing.intent || 'offering') === 'seeking' ? 'bg-amber-500 text-white' : 'bg-sky-500 text-white'}`}>
          {(listing.intent || 'offering') === 'seeking' ? `🔍 ${t.listing.seeking}` : `🎁 ${t.listing.offering}`}
        </span>
      </div>
      <div className="p-4">
        <h3 className="line-clamp-1 font-semibold text-slate-900">{listing.title}</h3>
        <p className="mt-1 line-clamp-2 text-sm text-slate-500">{listing.description}</p>
        <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
          <span className="rounded-md bg-slate-100 px-2 py-0.5 font-medium text-slate-600">{t.categories[listing.category] || listing.category}</span>
          {loc && (
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              {loc}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}