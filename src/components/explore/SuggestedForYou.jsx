import React, { useEffect, useMemo, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { supabase } from '@/api/supabaseClient';
import { useI18n } from '@/lib/i18n';
import { useAuth } from '@/lib/AuthContext';
import BarterCard from '@/components/BarterCard';
import { suggestForMe } from '@/lib/matching';

export default function SuggestedForYou({
  listings = [],
  ownerNames = {},
  ownerMeta = {},
}) {
  const { t } = useI18n();
  const { user } = useAuth();

  const [myListings, setMyListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadMyListings = async () => {
      if (!user?.id || !supabase) {
        if (isMounted) {
          setMyListings([]);
          setLoading(false);
        }
        return;
      }

      setLoading(true);

      try {
        const { data, error } = await supabase
          .from('listings')
          .select('*')
          .eq('offering_user_id', user.id)
          .eq('status', 'available')
          .order('created_at', { ascending: false })
          .limit(100);

        if (error) {
          throw error;
        }

        if (isMounted) {
          setMyListings(data || []);
        }
      } catch (error) {
        console.error('Failed to load your listings:', error);

        if (isMounted) {
          setMyListings([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadMyListings();

    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  const suggestions = useMemo(() => {
    return suggestForMe(myListings, listings, 3);
  }, [myListings, listings]);

  if (loading || suggestions.length === 0) {
    return null;
  }

  return (
    <section className="rounded-2xl border border-sky-100 bg-gradient-to-br from-sky-50/60 to-white p-4 sm:p-5">
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-100 text-sky-600">
          <Sparkles className="h-4 w-4" />
        </span>

        <div>
          <h2 className="text-base font-bold text-slate-900">
            {t?.v2?.suggestedTitle || 'Suggested for you'}
          </h2>

          <p className="text-xs text-slate-500">
            {t?.v2?.suggestedSub ||
              'Listings that match what you want'}
          </p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {suggestions.map(({ listing }) => (
          <BarterCard
            key={listing.id}
            listing={listing}
            ownerName={ownerNames[listing.offering_user_id]}
            ownerMeta={ownerMeta[listing.offering_user_id]}
          />
        ))}
      </div>
    </section>
  );
}
