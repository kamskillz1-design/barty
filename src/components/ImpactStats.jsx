import React, { useState, useEffect } from 'react';
import { supabase } from '@/api/supabaseClient';
import { useI18n } from '@/lib/i18n';
import { Recycle, Clock, CheckCircle2 } from 'lucide-react';

/**
 * Individual feel-good metrics for the profile: items kept out of landfills
 * (own listings traded), estimated bartering hours saved, and completed
 * trades the user took part in as either party.
 */
export default function ImpactStats({ user }) {
  const { t } = useI18n();
  const [stats, setStats] = useState({ itemsKept: 0, hoursSaved: 0, trades: 0 });

  useEffect(() => {
    if (!user?.id) return;
    (async () => {
      try {
        const mine = await base44.entities.Listing.filter({ offering_user_id: user.id }, '-created_date', 1000);
        const kept = (mine || []).filter((l) => l.status === 'traded').length;
        const all = await base44.entities.Trade.filter({ status: 'completed' }, '-created_date', 1000);
        const done = (all || []).filter((tr) => tr.proposer_id === user.id || tr.receiver_id === user.id).length;
        setStats({ itemsKept: kept, hoursSaved: done * 3, trades: done });
      } catch { /* ignore */ }
    })();
  }, [user?.id]);

  const cards = [
    { icon: Recycle, value: stats.itemsKept, label: t.impact.itemsKeptOut, color: 'text-emerald-600 bg-emerald-50' },
    { icon: Clock, value: stats.hoursSaved, label: t.impact.hoursSaved, color: 'text-sky-600 bg-sky-50' },
    { icon: CheckCircle2, value: stats.trades, label: t.impact.tradesCompleted, color: 'text-amber-600 bg-amber-50' }
  ];

  return (
    <div>
      <h2 className="text-lg font-bold text-slate-900">{t.impact.section}</h2>
      <p className="text-sm text-slate-500">{t.impact.sectionSub}</p>
      <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
        {cards.map((c, i) => {
          const Icon = c.icon;
          return (
            <div key={i} className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${c.color}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="mt-3 text-2xl font-bold text-slate-900 tabular-nums">{c.value.toLocaleString()}</div>
              <div className="text-xs font-medium text-slate-500">{c.label}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
