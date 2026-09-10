import React, { useState } from 'react';
import { CalendarCheck, CalendarClock, Check } from 'lucide-react';
import { supabase } from '@/api/supabaseClient';
import { useI18n } from '@/lib/i18n';
import { useAuth } from '@/lib/AuthContext';

/**
 * MeetupScheduler — both trade participants propose and agree on a meetup
 * date/time alongside the safe-spot choice. One side proposes; the other
 * confirms; the agreed time is announced in the chat as a system message.
 */
export default function MeetupScheduler({ trade, onDone }) {
  const { t } = useI18n();
  const { user } = useAuth();
  const [value, setValue] = useState('');
  const [busy, setBusy] = useState(false);

  const iProposed = trade.meetup_proposed_by_id === user?.id;
  const fmt = (iso) => { try { return new Date(iso).toLocaleString(); } catch { return iso; } };

  const propose = async () => {
    if (!value) return;
    setBusy(true);
    try {
      const iso = new Date(value).toISOString();
      await base44.entities.Trade.update(trade.id, {
        meetup_at: iso,
        meetup_proposed_by_id: user.id,
        meetup_confirmed: false
      });
      await base44.entities.Message.create({
        trade_id: trade.id,
        sender_id: user.id,
        kind: 'system',
        text: `Meetup time proposed: ${fmt(iso)}`
      });
      onDone && onDone();
    } finally {
      setBusy(false);
    }
  };

  const confirm = async () => {
    setBusy(true);
    try {
      await base44.entities.Trade.update(trade.id, { meetup_confirmed: true });
      await base44.entities.Message.create({
        trade_id: trade.id,
        sender_id: user.id,
        kind: 'system',
        text: `Meetup time confirmed: ${fmt(trade.meetup_at)}`
      });
      onDone && onDone();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mt-4 rounded-2xl border border-sky-100 bg-sky-50/50 p-4">
      <div className="flex items-center gap-2">
        {trade.meetup_confirmed
          ? <CalendarCheck className="h-4 w-4 text-emerald-600" />
          : <CalendarClock className="h-4 w-4 text-sky-600" />}
        <p className="text-sm font-semibold text-slate-800">{t.v2?.meetupTitle || 'Meetup time'}</p>
        {trade.meetup_confirmed && (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
            <Check className="h-3 w-3" /> {t.v2?.meetupConfirmed || 'Confirmed'}
          </span>
        )}
      </div>

      {!trade.meetup_at ? (
        <div className="mt-3 flex flex-col sm:flex-row gap-2">
          <input
            type="datetime-local"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-sky-400"
          />
          <button onClick={propose} disabled={!value || busy} className="rounded-xl bg-sky-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-sky-600 disabled:opacity-60">
            {t.v2?.meetupPropose || 'Propose time'}
          </button>
        </div>
      ) : (
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <p className="text-sm text-slate-700 notranslate">{fmt(trade.meetup_at)}</p>
          {!trade.meetup_confirmed && (
            iProposed
              ? <span className="text-xs text-slate-400">{t.trade.bothComplete ? '' : ''}{t.v2?.waitingConfirm || 'Waiting for the other side to confirm'}</span>
              : (
                <button onClick={confirm} disabled={busy} className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600 disabled:opacity-60">
                  {t.v2?.meetupConfirm || 'Confirm time'}
                </button>
              )
          )}
        </div>
      )}
    </div>
  );
}
