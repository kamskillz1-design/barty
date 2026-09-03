import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '@/lib/i18n';
import { useAuth } from '@/lib/AuthContext';
import { useLocation } from '@/lib/LocationContext';
import BarterCard from '@/components/BarterCard';
import { MapPin, ArrowRight } from 'lucide-react';

/**
 * Auto local discovery: surfaces listings near the active area. The active area
 * comes from the shared LocationContext (single source of truth) — so a manual
 * picker override (e.g. Madrid) replaces the detected/profile area instantly.
 * Falls back to the signed-in user's profile city/country only when no active
 * area has been resolved yet.
 */
export default function LocalDiscovery({ listings }) {
  const { t } = useI18n();
  const { user } = useAuth();
  const { activeArea } = useLocation();

  const city = (activeArea?.city || user?.city || '').trim().toLowerCase();
  const country = (activeArea?.country || user?.country || '').trim().toLowerCase();

  const local = useMemo(() => {
    if (!city && !country) return [];
    return listings.filter((l) => {
      if (l.status === 'traded') return false;
      if (city && (l.city || '').toLowerCase() === city) return true;
      if (country && (l.country || '').toLowerCase() === country) return true;
      return false;
    }).slice(0, 6);
  }, [listings, city, country]);

  if (!city && !country) return null;
  const area = activeArea?.city || activeArea?.country || user?.city || user?.country;

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