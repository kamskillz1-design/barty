import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useI18n } from '@/lib/i18n';
import { ShieldCheck } from 'lucide-react';

/**
 * Lets the trading parties pick a Verified Safe Hub for the in-person exchange.
 * Shown on the trade detail screen while the trade is pending or accepted.
 */
export default function SafeSpotSelector({ trade, onChange }) {
  const { t } = useI18n();
  const [spots, setSpots] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const data = await base44.entities.SafeSpot.filter({ verified: true }, '-vote_count', 200);
        setSpots(data || []);
      } catch { /* ignore */ }
    })();
  }, []);

  const current = spots.find((s) => s.id === trade?.safe_spot_id);

  return (
    <div className="mt-4 rounded-xl border border-sky-100 bg-sky-50/50 p-3">
      <p className="flex items-center gap-1.5 text-sm font-semibold text-slate-700">
        <ShieldCheck className="h-4 w-4 text-sky-600" /> {t.trade.safeSpot}
      </p>
      <p className="mt-0.5 text-xs text-slate-500">{t.trade.chooseSpot}</p>
      <select
        value={trade?.safe_spot_id || ''}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-sky-400"
      >
        <option value="">— {t.trade.chooseSpot} —</option>
        {spots.map((s) => (
          <option key={s.id} value={s.id}>{s.name} · {[s.city, s.country].filter(Boolean).join(', ')}</option>
        ))}
      </select>
      {spots.length === 0 && <p className="mt-2 text-xs text-slate-500">{t.trade.noSpots}</p>}
      {current && <p className="mt-2 text-xs font-medium text-emerald-600">{t.trade.spotSaved}: {current.name}</p>}
    </div>
  );
}