import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, Quote } from 'lucide-react';
import { supabase } from '@/api/base44Client';
import { useI18n } from '@/lib/i18n';
import { useAuth } from '@/lib/AuthContext';
import moment from 'moment';
import { resolveUsers } from '@/lib/userMeta';
import { withLegacyDatesList } from '@/lib/supabaseData';

const STATUS_STYLE = {
  open: 'bg-amber-50 text-amber-700',
  reviewed: 'bg-sky-50 text-sky-700',
  resolved: 'bg-emerald-50 text-emerald-700'
};

/**
 * AdminReports — moderation queue for user reports. Admin-only; members are
 * shown a plain "not available" state instead of the data.
 */
export default function AdminReports() {
  const { t } = useI18n();
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [names, setNames] = useState({});
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const { data, error } = await supabase
        .from('user_reports')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(200);

      if (error) {
        throw error;
      }

      const recs = withLegacyDatesList(data);
      setReports(recs);
      const ids = [...new Set((recs || []).flatMap((r) => [r.reported_user_id, r.reporter_id]).filter(Boolean))];
      if (ids.length) {
        try {
          const { names } = await resolveUsers(ids);
          setNames(names);
        } catch (error) {
          console.error('Failed to resolve report names:', error);
        }
      }
    } catch (error) {
      console.error('Failed to load admin reports:', error);
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (user?.role === 'admin') load(); else setLoading(false); }, [user?.role]);

  const setStatus = async (rec, status) => {
    setReports((cur) => cur.map((r) => (r.id === rec.id ? { ...r, status } : r)));
    try {
      const { error } = await supabase
        .from('user_reports')
        .update({ status })
        .eq('id', rec.id);

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Failed to update report status:', error);
      load();
    }
  };

  if (!user || user.role !== 'admin') {
    return <div className="py-20 text-center text-slate-400">{t.common.empty}</div>;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div className="flex items-center gap-2">
        <ShieldAlert className="h-5 w-5 text-sky-600" />
        <h1 className="text-xl font-bold text-slate-900">{t.v2?.adminReports || 'User reports'}</h1>
      </div>

      {loading ? (
        <p className="text-sm text-slate-400">{t.common.loading}</p>
      ) : reports.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-slate-300 bg-white py-12 text-center text-sm text-slate-400">{t.v2?.adminReportsEmpty || 'No reports'}</p>
      ) : (
        <div className="space-y-3">
          {reports.map((r) => (
            <div key={r.id} className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-semibold text-slate-900 notranslate" translate="no">{names[r.reported_user_id] || t.common.member}</span>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">{(t.v2?.reasons || {})[r.reason] || r.reason}</span>
                <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${STATUS_STYLE[r.status] || STATUS_STYLE.open}`}>{r.status}</span>
                <span className="ms-auto text-xs text-slate-400">{moment(r.created_date).fromNow()}</span>
              </div>
              {r.note && <p className="mt-2 text-sm text-slate-600 whitespace-pre-line">{r.note}</p>}
              <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-400">
                <Quote className="h-3 w-3" />
                <span>{t.listing.by} <span className="notranslate" translate="no">{names[r.reporter_id] || t.common.member}</span></span>
                {r.trade_id && <Link to={`/trades/${r.trade_id}`} className="text-sky-600 hover:underline">{t.trade.chat}</Link>}
              </div>
              <div className="mt-3 flex gap-2">
                {r.status === 'open' && (
                  <button onClick={() => setStatus(r, 'reviewed')} className="rounded-lg bg-sky-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-sky-600">{t.v2?.markReviewed || 'Mark reviewed'}</button>
                )}
                {r.status !== 'resolved' && (
                  <button onClick={() => setStatus(r, 'resolved')} className="rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-600">{t.v2?.markResolved || 'Mark resolved'}</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}