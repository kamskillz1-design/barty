import React, { useState, useEffect } from 'react';
import { Trophy } from 'lucide-react';
import { supabase } from '@/api/supabaseClient';
import { useI18n } from '@/lib/i18n';

const MEDALS = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣'];

/**
 * Leaderboard — monthly community leaderboard on Explore: the members with the
 * most completed trades this month, fed by the completed Trade records.
 */
export default function Leaderboard() {
  const { t } = useI18n();
  const [top, setTop] = useState([]);
  const [names, setNames] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const monthStart = new Date();
        monthStart.setDate(1);
        monthStart.setHours(0, 0, 0, 0);
        const trades = await base44.entities.Trade.filter({ status: 'completed' }, '-updated_date', 500);
        const counts = {};
        for (const tr of (trades || [])) {
          if (!tr.updated_date || new Date(tr.updated_date) < monthStart) continue;
          for (const uid of [tr.proposer_id, tr.receiver_id]) {
            if (uid) counts[uid] = (counts[uid] || 0) + 1;
          }
        }
        const ranked = Object.entries(counts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5);
        setTop(ranked);
        if (ranked.length) {
          try {
            const res = await base44.functions.invoke('resolveUserNames', { ids: ranked.map(([id]) => id) });
            setNames(res?.data?.names || res?.names || {});
          } catch { /* generic labels */ }
        }
      } catch { /* leaderboard unavailable — hide */ }
      finally { if (alive) setLoading(false); }
    })();
    return () => { alive = false; };
  }, []);

  if (loading || top.length === 0) return null;

  return (
    <section className="rounded-2xl border border-amber-100 bg-gradient-to-br from-amber-50/70 to-white p-4 sm:p-5">
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-amber-600"><Trophy className="h-4 w-4" /></span>
        <div>
          <h2 className="text-base font-bold text-slate-900">{t.v2?.leaderboardTitle || 'Community leaderboard'}</h2>
          <p className="text-xs text-slate-500">{t.v2?.leaderboardSub || 'Most completed trades this month'}</p>
        </div>
      </div>
      <ol className="mt-4 space-y-2">
        {top.map(([id, count], i) => (
          <li key={id} className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white px-3 py-2">
            <span className="w-6 text-center text-base">{MEDALS[i] || i + 1}</span>
            <span className="flex-1 truncate text-sm font-semibold text-slate-800 notranslate" translate="no">{names[id] || t.common.member}</span>
            <span className="text-xs font-bold text-amber-600">{count} {t.v2?.tradesCount || 'trades'}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}
