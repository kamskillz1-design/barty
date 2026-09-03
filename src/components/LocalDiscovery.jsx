import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '@/lib/i18n';
import { useAuth } from '@/lib/AuthContext';
import BarterCard from '@/components/BarterCard';
import { MapPin, ArrowRight } from 'lucide-react';

/**
 * Auto local discovery: surfaces listings in the signed-in user's own
 * city (falling back to country) right below the main search area. Users
 * with no saved location see nothing here and rely on the global search.
 */
export default function LocalDiscovery({ listings }) {
  const { t } = useI18n();
  const { user } = useAuth();

  const local = useMemo(() => {
    if (!user) return [];
    const city = (user.city || '').trim().toLowerCase();
    const country = (user.country || '').trim().toLowerCase();
    if (!city && !country) return [];
    return listings.filter((l) => {
      if (l.status === 'traded') return false;
      if (city && (l.city || '').toLowerCase() === city) return true;
      if (country && (l.country || '').toLowerCase() === country) return true;
      return false;
    }).slice(0, 6);
  }, [listings, user]);

  if (!user || (!user.city && !user.country)) return null;
  const area = user.city || user.country;

  return (
    <section>
      <div className="flex items-center justify-between mb-2">
        <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
          <MapPin className="h-5 w-5 text-sky-600" /> {t.local.title} · {area}
        </h2>
        <Link to="/explore" className="inline-flex items-center gap-1 text-sm font-semibold text-sky-600 hover:underline">
          {t.local.viewAll} <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      <p className="text-sm text-slate-500 mb-3">{t.local.sub}</p>
      {local.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-slate-300 bg-white py-10 text-center text-sm text-slate-400">{t.local.empty}</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {local.map((l) => <BarterCard key={l.id} listing={l} />)}
        </div>
      )}
    </section>
  );
}