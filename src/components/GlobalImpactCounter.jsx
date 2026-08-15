import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useI18n } from '@/lib/i18n';
import { Globe2, Activity } from 'lucide-react';

/**
 * Live, platform-wide counter of items traded across Barti. Subscribes to
 * Listing changes so the number updates in real time as trades complete.
 */
export default function GlobalImpactCounter() {
  const { t } = useI18n();
  const [count, setCount] = useState(0);

  const refresh = async () => {
    try {
      const traded = await base44.entities.Listing.filter({ status: 'traded' }, '-created_date', 1000);
      setCount((traded || []).length);
    } catch { /* ignore */ }
  };

  useEffect(() => {
    refresh();
    const unsub = base44.entities.Listing.subscribe(() => refresh());
    return unsub;
  }, []);

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-sky-100 bg-gradient-to-br from-sky-50 to-white p-4">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky-500 text-white shadow-sm shadow-sky-200">
        <Globe2 className="h-6 w-6" />
      </div>
      <div className="min-w-0">
        <div className="text-2xl font-bold text-slate-900 tabular-nums leading-tight">{count.toLocaleString()}</div>
        <div className="text-xs font-medium text-slate-500">{t.impact.global}</div>
      </div>
      <span className="ms-auto inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-600">
        <Activity className="h-3.5 w-3.5" /> {t.impact.globalSub}
      </span>
    </div>
  );
}