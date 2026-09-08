import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, MapPin, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useI18n } from '@/lib/i18n';
import { Image } from '@/components/ui/image';

/**
 * SavedListings — Profile section listing everything the user hearted, with a
 * one-tap remove. Snapshotted title/image render instantly without re-fetching
 * every listing.
 */
export default function SavedListings() {
  const { t } = useI18n();
  const [saved, setSaved] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const recs = await base44.entities.SavedListing.list('-created_date', 100);
        if (alive) setSaved(recs || []);
      } catch { /* ignore */ }
      finally { if (alive) setLoading(false); }
    })();
    return () => { alive = false; };
  }, []);

  const remove = async (rec) => {
    setSaved((cur) => cur.filter((r) => r.id !== rec.id));
    try { await base44.entities.SavedListing.delete(rec.id); } catch { /* removed elsewhere */ }
  };

  return (
    <div>
      <h2 className="text-lg font-bold text-slate-900">{t.v2?.savedTitle || 'Saved listings'}</h2>
      {loading ? (
        <p className="mt-3 text-sm text-slate-400">{t.common.loading}</p>
      ) : saved.length === 0 ? (
        <p className="mt-3 rounded-2xl border border-dashed border-slate-300 bg-white py-10 text-center text-sm text-slate-400">
          {t.v2?.savedEmpty || 'You haven\u2019t saved any listings yet'}
        </p>
      ) : (
        <div className="mt-3 space-y-2">
          {saved.map((rec) => (
            <div key={rec.id} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3">
              <Link to={`/listings/${rec.listing_id}`} className="flex flex-1 items-center gap-3 overflow-hidden hover:opacity-80">
                <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                  {rec.listing_image_url
                    ? <Image src={rec.listing_image_url} alt={rec.listing_title} className="h-full w-full object-cover" fittingType="fill" />
                    : <div className="flex h-full w-full items-center justify-center text-slate-300"><Bookmark className="h-4 w-4" /></div>}
                </div>
                <p className="truncate text-sm font-semibold text-slate-900">{rec.listing_title || t.common.member}</p>
              </Link>
              <button onClick={() => remove(rec)} title={t.v2?.removeSaved || 'Remove'} className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-500">
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}