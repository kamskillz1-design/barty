import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowLeftRight, Printer, Copy, Check, MapPin } from 'lucide-react';
import { supabase } from '@/api/base44Client';
import { useI18n } from '@/lib/i18n';
import { useAuth } from '@/lib/AuthContext';
import moment from 'moment';
import { resolveUsers } from '@/lib/userMeta';
import { withLegacyDates } from '@/lib/supabaseData';

/**
 * TradeReceipt — shareable, printable summary of a completed trade: what was
 * exchanged, between whom, when and where. Only the two participants (or an
 * admin) can open it.
 */
export default function TradeReceipt() {
  const { id } = useParams();
  const { t } = useI18n();
  const { user } = useAuth();
  const [trade, setTrade] = useState(null);
  const [spot, setSpot] = useState(null);
  const [names, setNames] = useState({});
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const { data: tr, error: tradeError } = await supabase
          .from('trades')
          .select('*')
          .eq('id', id)
          .or(`proposer_id.eq.${user.id},receiver_id.eq.${user.id}`)
          .maybeSingle();

        if (tradeError) {
          throw tradeError;
        }

        const normalizedTrade = withLegacyDates(tr);
        setTrade(normalizedTrade);

        if (normalizedTrade) {
          try {
            const { names } = await resolveUsers([
              normalizedTrade.proposer_id,
              normalizedTrade.receiver_id
            ]);
            setNames(names || {});
          } catch (error) {
            console.error('Failed to resolve trade participant names:', error);
          }
        }

        if (normalizedTrade?.safe_spot_id) {
          try {
            const { data: safeSpot, error: spotError } = await supabase
              .from('safe_spots')
              .select('*')
              .eq('id', normalizedTrade.safe_spot_id)
              .maybeSingle();

            if (spotError) {
              throw spotError;
            }

            setSpot(safeSpot || null);
          } catch (error) {
            console.error('Failed to load safe spot for receipt:', error);
          }
        }
      } catch (error) {
        console.error('Failed to load trade receipt:', error);
      }
      finally { setLoading(false); }
    })();
  }, [id, user]);

  if (loading) return <div className="py-20 text-center text-slate-400">{t.common.loading}</div>;
  if (!trade) return <div className="py-20 text-center text-slate-400">{t.common.empty}</div>;

  const isParticipant = trade.proposer_id === user?.id || trade.receiver_id === user?.id;
  const isAdmin = user?.role === 'admin';
  if (!isParticipant && !isAdmin) return <div className="py-20 text-center text-slate-400">{t.common.empty}</div>;

  const copyLink = async () => {
    try { await navigator.clipboard.writeText(window.location.href); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch { /* clipboard blocked */ }
  };
  const fmt = (d) => (d ? moment(d).format('LLL') : '—');

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <button onClick={() => window.history.back()} className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800">
        <ArrowLeft className="h-4 w-4" /> {t.listing.back}
      </button>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8">
        <div className="flex items-center justify-between gap-3 border-b border-dashed border-slate-200 pb-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900">{t.v2?.receiptTitle || 'Trade receipt'}</h1>
            <p className="text-xs text-slate-400">{t.appName}</p>
          </div>
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">{t.trade.status.completed}</span>
        </div>

        <div className="mt-6 flex items-center gap-3">
          <div className="flex-1 min-w-0 rounded-xl bg-sky-50 p-4">
            <p className="text-xs text-slate-400">{names[trade.proposer_id] || t.common.member}</p>
            <p className="mt-1 truncate font-semibold text-slate-900" title={trade.offered_listing_title}>{trade.offered_listing_title}</p>
          </div>
          <ArrowLeftRight className="h-5 w-5 shrink-0 text-sky-500" />
          <div className="flex-1 min-w-0 rounded-xl bg-amber-50 p-4">
            <p className="text-xs text-slate-400">{names[trade.receiver_id] || t.common.member}</p>
            <p className="mt-1 truncate font-semibold text-slate-900" title={trade.requested_listing_title}>{trade.requested_listing_title}</p>
          </div>
        </div>

        <dl className="mt-6 space-y-3 text-sm">
          <div className="flex justify-between gap-4 border-b border-dashed border-slate-100 pb-2">
            <dt className="text-slate-400">{t.v2?.receiptWhen || 'Completed'}</dt>
            <dd className="font-medium text-slate-800 notranslate">{fmt(trade.updated_date)}</dd>
          </div>
          {trade.meetup_at && (
            <div className="flex justify-between gap-4 border-b border-dashed border-slate-100 pb-2">
              <dt className="text-slate-400">{t.v2?.meetupTitle || 'Meetup time'}</dt>
              <dd className="font-medium text-slate-800 notranslate">{fmt(trade.meetup_at)}</dd>
            </div>
          )}
          <div className="flex justify-between gap-4">
            <dt className="text-slate-400">{t.v2?.receiptWhere || 'Meetup spot'}</dt>
            <dd className="flex items-center gap-1 font-medium text-slate-800 text-end">
              {spot ? (
                <>
                  <MapPin className="h-3.5 w-3.5 text-sky-500" />
                  <span className="notranslate">{spot.name}{spot.city ? `, ${spot.city}` : ''}</span>
                </>
              ) : '—'}
            </dd>
          </div>
        </dl>

        <p className="mt-6 text-center text-xs text-slate-400">{t.value.explanation}</p>

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link to={`/trades/${trade.id}`} className="rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-200">{t.trade.chat}</Link>
          <button onClick={copyLink} className="inline-flex items-center gap-1.5 rounded-xl bg-sky-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-sky-600">
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />} {copied ? (t.v2?.receiptCopied || 'Link copied') : (t.v2?.receiptCopy || 'Copy link')}
          </button>
          <button onClick={() => window.print()} className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50">
            <Printer className="h-4 w-4" /> {t.v2?.receiptPrint || 'Print'}
          </button>
        </div>
      </div>
    </div>
  );
}