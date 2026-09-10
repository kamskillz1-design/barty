import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/api/base44Client';
import { useI18n } from '@/lib/i18n';
import { useAuth } from '@/lib/AuthContext';
import { ArrowRight, ArrowLeftRight } from 'lucide-react';
import { withLegacyDatesList } from '@/lib/supabaseData';

const STATUS_STYLE = {
  pending: 'bg-amber-50 text-amber-700',
  accepted: 'bg-sky-50 text-sky-700',
  completed: 'bg-emerald-50 text-emerald-700',
  cancelled: 'bg-slate-100 text-slate-500'
};

export default function Trades() {
  const { t } = useI18n();
  const { user } = useAuth();
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('all');

  const load = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('trades')
        .select('*')
        .or(`proposer_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order('created_at', { ascending: false })
        .limit(200);

      if (error) {
        throw error;
      }

      setTrades(withLegacyDatesList(data));
    } catch (error) {
      console.error('Failed to load trades:', error);
      setTrades([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (user) load(); }, [user]);

  const filtered = trades.filter((tr) => {
    if (tab === 'incoming') return tr.receiver_id === user.id;
    if (tab === 'outgoing') return tr.proposer_id === user.id;
    return true;
  });

  if (loading) return <div className="py-20 text-center text-slate-400">{t.common.loading}</div>;

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-slate-900">{t.trade.title}</h1>

      <div className="flex gap-1 rounded-full bg-slate-100 p-1 text-sm w-fit">
        {[['all', t.trade.title], ['incoming', t.trade.youRequested], ['outgoing', t.trade.youOffered]].map(([k, label]) => (
          <button key={k} onClick={() => setTab(k)} className={`rounded-full px-4 py-1.5 font-medium transition ${tab === k ? 'bg-white text-sky-700 shadow-sm' : 'text-slate-500'}`}>{label}</button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center text-slate-400">
          <ArrowLeftRight className="mx-auto mb-3 h-8 w-8 text-slate-300" />
          {t.trade.empty}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((tr) => {
            const outgoing = tr.proposer_id === user.id;
            return (
              <Link key={tr.id} to={`/trades/${tr.id}`} className="block rounded-2xl border border-slate-200 bg-white p-4 hover:shadow-sm transition">
                <div className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="truncate font-semibold text-slate-900 text-sm">{tr.offered_listing_title}</p>
                    <p className="text-xs text-slate-400">{outgoing ? t.trade.youOffered : t.trade.offered}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 shrink-0 text-sky-500 rotate-0 rtl:-rotate-0" />
                  <div className="flex-1 min-w-0 text-end">
                    <p className="truncate font-semibold text-slate-900 text-sm">{tr.requested_listing_title}</p>
                    <p className="text-xs text-slate-400">{outgoing ? t.trade.youRequested : t.trade.requested}</p>
                  </div>
                  <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${STATUS_STYLE[tr.status]}`}>{t.trade.status[tr.status]}</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}