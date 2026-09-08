import React from 'react';
import { Link } from 'react-router-dom';
import { Check, X, Star, Receipt, ArrowLeft } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import ValueMatchIndicator from '@/components/ValueMatchIndicator';
import SafeSpotSelector from '@/components/SafeSpotSelector';
import CounterOffer from '@/components/trade/CounterOffer';
import MeetupScheduler from '@/components/trade/MeetupScheduler';

const STATUS_STYLE = {
  pending: 'bg-amber-50 text-amber-700',
  accepted: 'bg-sky-50 text-sky-700',
  completed: 'bg-emerald-50 text-emerald-700',
  cancelled: 'bg-slate-100 text-slate-500'
};

/**
 * TradeSummaryCard — the trade's status, both sides of the exchange, the
 * fairness indicator, safe-spot and meetup coordination, counter-offer
 * review, and the accept/decline/complete/cancel actions. Presentational
 * only: every mutation is a callback, so data ownership stays with the page.
 */
export default function TradeSummaryCard({
  trade, outgoing, myCompleted, otherCompleted, myReview, blockActive,
  onAccept, onDecline, onCancel, onMarkComplete,
  onAcceptCounter, onDeclineCounter,
  onSafeSpotChange, onReload, onToggleReview
}) {
  const { t } = useI18n();
  const counterActive = !!trade.counter_listing_id;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_STYLE[trade.status]}`}>{t.trade.status[trade.status]}</span>
      </div>
      <div className="mt-4 flex items-center gap-3">
        <div className="flex-1 min-w-0 rounded-xl bg-slate-50 p-3">
          <p className="text-xs text-slate-400">{outgoing ? t.trade.youOffered : t.trade.offered}</p>
          <p className="truncate font-semibold text-slate-900">{trade.offered_listing_title}</p>
        </div>
        <ArrowLeft className="h-5 w-5 shrink-0 text-sky-500 rotate-180" />
        <div className="flex-1 min-w-0 rounded-xl bg-slate-50 p-3">
          <p className="text-xs text-slate-400">{outgoing ? t.trade.youRequested : t.trade.requested}</p>
          <p className="truncate font-semibold text-slate-900">{trade.requested_listing_title}</p>
        </div>
      </div>

      <div className="mt-4">
        <ValueMatchIndicator offeredValue={trade.offered_listing_value} requestedValue={trade.requested_listing_value} />
      </div>

      {(trade.status === 'pending' || trade.status === 'accepted') && (
        <SafeSpotSelector trade={trade} onChange={onSafeSpotChange} />
      )}

      {(trade.status === 'pending' || trade.status === 'accepted') && !blockActive && (
        <MeetupScheduler trade={trade} onDone={onReload} />
      )}

      {counterActive && outgoing && trade.status === 'pending' && (
        <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm font-semibold text-amber-800">{t.v2?.counterReceived || 'Counter-offer received'}</p>
          <div className="mt-2 rounded-xl border border-amber-100 bg-white p-3">
            <p className="text-xs text-slate-400">{t.trade.requested}</p>
            <p className="truncate font-semibold text-slate-900">{trade.counter_listing_title}</p>
            {trade.counter_message && <p className="mt-1 text-sm text-slate-500">{trade.counter_message}</p>}
            <div className="mt-2">
              <ValueMatchIndicator offeredValue={trade.offered_listing_value} requestedValue={trade.counter_listing_value} />
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <button onClick={onAcceptCounter} className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600"><Check className="h-4 w-4" /> {t.v2?.counterAccept || 'Accept counter-offer'}</button>
            <button onClick={onDeclineCounter} className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200"><X className="h-4 w-4" /> {t.v2?.counterDecline || 'Decline counter-offer'}</button>
          </div>
        </div>
      )}
      {counterActive && !outgoing && trade.status === 'pending' && (
        <p className="mt-2 text-xs text-amber-600">{t.v2?.counterSentNotice || 'Counter-offer sent — waiting for a response.'}</p>
      )}

      {/* Actions */}
      <div className="mt-4 flex flex-wrap gap-2">
        {trade.status === 'pending' && !outgoing && (
          <>
            <button onClick={onAccept} className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600"><Check className="h-4 w-4" /> {t.trade.accept}</button>
            <button onClick={onDecline} className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200"><X className="h-4 w-4" /> {t.trade.decline}</button>
          </>
        )}
        {trade.status === 'pending' && !outgoing && !counterActive && (
          <CounterOffer trade={trade} onDone={onReload} />
        )}
        {(trade.status === 'pending' || trade.status === 'accepted') && (
          <button onClick={onMarkComplete} disabled={myCompleted} className="inline-flex items-center gap-1.5 rounded-xl bg-sky-500 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-600 disabled:opacity-60">
            <Check className="h-4 w-4" /> {myCompleted ? `${t.trade.markComplete} ✓` : t.trade.markComplete}
          </button>
        )}
        {trade.status !== 'completed' && trade.status !== 'cancelled' && (
          <button onClick={onCancel} className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-medium text-slate-500 hover:bg-slate-100">{t.trade.cancel}</button>
        )}
      </div>
      {trade.status === 'accepted' && (
        <p className="mt-2 text-xs text-slate-500">
          {myCompleted ? `✓ ${t.common.you}` : ''} {myCompleted && otherCompleted ? ' — ' : myCompleted && !otherCompleted ? ` · ${t.trade.bothComplete}` : !myCompleted ? t.trade.completeConfirm : ''}
        </p>
      )}

      {trade.status === 'completed' && (
        <div className="mt-3 space-y-3">
          <Link to={`/trades/${trade.id}/receipt`} className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">
            <Receipt className="h-4 w-4" /> {t.v2?.receiptTitle || 'Trade receipt'}
          </Link>
          {myReview ? (
            <p className="flex items-center gap-1.5 text-sm text-emerald-600"><Check className="h-4 w-4" /> {t.trade.reviewLeft}</p>
          ) : (
            <button onClick={onToggleReview} className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200">
              <Star className="h-4 w-4" /> {t.trade.leaveReview}
            </button>
          )}
        </div>
      )}
    </div>
  );
}