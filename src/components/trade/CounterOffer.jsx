import React, { useState, useEffect } from 'react';
import { ArrowLeftRight, Check, MessageSquare } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useI18n } from '@/lib/i18n';
import { useAuth } from '@/lib/AuthContext';

/**
 * CounterOffer — the receiver of a pending trade can counter by offering a
 * different one of THEIR listings instead of the requested one. The counter is
 * stored on the trade (counter_* fields) and announced in the chat as a system
 * message; the proposer can then accept or decline it in TradeDetail.
 */
export default function CounterOffer({ trade, onDone }) {
  const { t } = useI18n();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [myListings, setMyListings] = useState([]);
  const [selected, setSelected] = useState(null);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!open || !user) return;
    (async () => {
      try {
        // My own available listings, minus the one already requested in the trade.
        const mine = await base44.entities.Listing.filter({ offering_user_id: user.id, status: 'available' }, '-created_date', 100);
        setMyListings((mine || []).filter((m) => m.id !== trade.requested_listing_id));
      } catch { /* none selectable */ }
    })();
  }, [open, user, trade.requested_listing_id]);

  const submit = async () => {
    if (!selected) return;
    setSending(true);
    try {
      const sel = myListings.find((m) => m.id === selected);
      await base44.entities.Trade.update(trade.id, {
        counter_listing_id: sel.id,
        counter_listing_title: sel.title,
        counter_listing_value: sel.baseline_value,
        counter_message: message.trim(),
        counter_proposed_by_id: user.id
      });
      await base44.entities.Message.create({
        trade_id: trade.id,
        sender_id: user.id,
        kind: 'system',
        text: `Counter-offer: ${sel.title}`
      });
      // Notify the proposer by email (non-blocking for the UI).
      base44.functions.invoke('sendTradeNotification', { trade_id: trade.id, kind: 'counter' }).catch(() => {});
      setOpen(false);
      setSelected(null);
      setMessage('');
      onDone && onDone();
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-600"
      >
        <ArrowLeftRight className="h-4 w-4" /> {t.v2?.counterOfferBtn || 'Counter-offer'}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/50 p-4" onClick={() => setOpen(false)}>
          <div className="w-full max-w-lg rounded-2xl bg-white p-5 max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">{t.v2?.counterTitle || 'Counter-offer'}</h3>
              <button onClick={() => setOpen(false)} className="text-slate-400">✕</button>
            </div>
            <p className="mt-1 text-sm text-slate-500">{t.v2?.counterPickHint || 'Offer a different one of your listings instead'}</p>
            <div className="mt-4 space-y-2">
              {myListings.length === 0 ? (
                <p className="rounded-xl border border-dashed border-slate-300 p-4 text-center text-sm text-slate-400">{t.profile.noListings}</p>
              ) : myListings.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setSelected(m.id)}
                  className={`flex w-full items-center gap-3 rounded-xl border p-3 text-start transition ${selected === m.id ? 'border-amber-400 bg-amber-50' : 'border-slate-200 hover:bg-slate-50'}`}
                >
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900">{m.title}</p>
                    <p className="text-xs text-slate-400">{t.exchType[m.have_exchange_type]}</p>
                  </div>
                  {selected === m.id && <Check className="h-5 w-5 text-amber-500" />}
                </button>
              ))}
            </div>
            <div className="mt-4">
              <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-slate-700"><MessageSquare className="h-4 w-4" /> {t.v2?.counterMessage || 'Message (optional)'}</label>
              <textarea rows={2} value={message} onChange={(e) => setMessage(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-amber-400 focus:bg-white" />
            </div>
            <div className="mt-5 flex justify-end gap-3">
              <button onClick={() => setOpen(false)} className="rounded-xl px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-100">{t.common.close}</button>
              <button onClick={submit} disabled={!selected || sending} className="rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-amber-600 disabled:opacity-60">
                {sending ? t.common.loading : (t.v2?.counterSent || 'Send counter-offer')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}