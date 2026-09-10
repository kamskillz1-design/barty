import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, X } from 'lucide-react';
import { supabase } from '@/api/base44Client';
import { useI18n } from '@/lib/i18n';
import { useAuth } from '@/lib/AuthContext';
import { Image } from '@/components/ui/image';
import { withLegacyDatesList } from '@/lib/supabaseData';

/**
 * SavedListings — Profile section listing everything the user hearted, with a
 * one-tap remove. Snapshotted title/image render instantly without re-fetching
 * every listing.
 */
export default function SavedListings() {
  const { t } = useI18n();
  const { user } = useAuth();
  const [saved, setSaved] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) {
      setSaved([]);
      setLoading(false);
      return undefined;
    }

    let alive = true;
    (async () => {
      try {
        const { data, error } = await supabase
          .from('saved_listings')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(100);

        if (error) {
          throw error;
        }

        if (alive) setSaved(withLegacyDatesList(data));
      } catch (error) {
        console.error('Failed to load saved listings:', error);
      }
      finally { if (alive) setLoading(false); }
    })();
    return () => { alive = false; };
  }, [user?.id]);

  const remove = async (rec) => {
    const previous = saved;
    setSaved((cur) => cur.filter((r) => r.id !== rec.id));
    try {
      const { error } = await supabase
        .from('saved_listings')
        .delete()
        .eq('id', rec.id);

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Failed to remove saved listing:', error);
      setSaved(previous);
    }
  };

  if (!user) return null;

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