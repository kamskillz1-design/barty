import React, { useState, useEffect, useMemo } from 'react';
import { Sparkles } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useI18n } from '@/lib/i18n';
import { useAuth } from '@/lib/AuthContext';
import BarterCard from '@/components/BarterCard';
import { suggestForMe } from '@/lib/matching';

/**
 * SuggestedForYou — Explore section that matches the user's listings (WANT vs
 * other members' HAVE and vice versa, ranked by fairness proximity) using the
 * shared matching engine. Renders nothing when there is nothing worth showing.
 */
export default function SuggestedForYou({ listings, ownerNames, ownerMeta }) {
  const { t } = useI18n();
  const { user } = useAuth();
  const [myListings, setMyListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) { setLoading(false); return; }
    let alive = true;
    (async () => {
      try {
        const mine = await base44.entities.Listing.filter({ offering_user_id: user.id, status: 'available' }, '-created_date', 100);
        if (alive) setMyListings(mine || []);
      } catch { /* no listings yet */ }
      finally { if (alive) setLoading(false); }
    })();
    return () => { alive = false; };
  }, [user?.id]);

  const suggestions = useMemo(
    () => suggestForMe(myListings, listings, 3),
    [myListings, listings]
  );

  if (loading || suggestions.length === 0) return null;

  return (
    <section className="rounded-2xl border border-sky-100 bg-gradient-to-br from-sky-50/60 to-white p-4 sm:p-5">
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-100 text-sky-600"><Sparkles className="h-4 w-4" /></span>
        <div>
          <h2 className="text-base font-bold text-slate-900">{t.v2?.suggestedTitle || 'Suggested for you'}</h2>
          <p className="text-xs text-slate-500">{t.v2?.suggestedSub || 'Listings that match what you want'}</p>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {suggestions.map(({ listing }) => (
          <BarterCard key={listing.id} listing={listing} ownerName={ownerNames[listing.offering_user_id]} ownerMeta={ownerMeta?.[listing.offering_user_id]} />
        ))}
      </div>
    </section>
  );
}