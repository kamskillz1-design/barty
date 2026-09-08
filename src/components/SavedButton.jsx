import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useI18n } from '@/lib/i18n';

/**
 * SavedButton — heart toggle on a listing detail page. Records live in the
 * private SavedListing entity (one per user per listing, owner-scoped by RLS).
 */
export default function SavedButton({ listing }) {
  const { t } = useI18n();
  const [savedRec, setSavedRec] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        // RLS scopes reads to my own records, so this finds my save only.
        const recs = await base44.entities.SavedListing.filter({ listing_id: listing.id });
        if (alive) setSavedRec((recs || [])[0] || null);
      } catch { /* unreadable — default to unsaved */ }
      finally { if (alive) setLoading(false); }
    })();
    return () => { alive = false; };
  }, [listing.id]);

  const toggle = async () => {
    setBusy(true);
    try {
      if (savedRec) {
        await base44.entities.SavedListing.delete(savedRec.id);
        setSavedRec(null);
      } else {
        const rec = await base44.entities.SavedListing.create({
          listing_id: listing.id,
          listing_title: listing.title || '',
          listing_image_url: (listing.image_urls || [])[0] || '',
          owner_id: listing.offering_user_id || ''
        });
        setSavedRec(rec);
      }
    } finally {
      setBusy(false);
    }
  };

  if (loading) return null;

  return (
    <button
      onClick={toggle}
      disabled={busy}
      title={savedRec ? (t.v2?.removeSaved || 'Remove') : (t.v2?.save || 'Save')}
      className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition disabled:opacity-60 ${savedRec ? 'border-rose-200 bg-rose-50 text-rose-500' : 'border-slate-200 bg-white text-slate-400 hover:text-rose-400'}`}
    >
      <Heart className={`h-4 w-4 ${savedRec ? 'fill-rose-500' : ''}`} />
    </button>
  );
}