import React, { useState, useEffect, useRef } from 'react';
import { Send, ShieldX } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import ReportUserButton from '@/components/report/ReportUserButton';

/**
 * TradeChat — the trade conversation: system notices, chat bubbles, the
 * message form and the header's report/block controls. It renders the
 * timeline it is given and reports input through onSend/onBlock; message
 * loading and permissions stay with the page.
 */
export default function TradeChat({ tradeId, tradeStatus, timeline, userId, otherUserId, blockActive, blockByMe, onSend, onBlock }) {
  const { t } = useI18n();
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  // Keep the newest message in view whenever the timeline changes.
  useEffect(() => {
    const timer = setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    return () => clearTimeout(timer);
  }, [timeline.length]);

  const submit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setSending(true);
    try {
      await onSend(text.trim());
      setText('');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 flex flex-col h-[420px]">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="font-bold text-slate-900">{t.trade.chat}</h3>
        <div className="flex items-center gap-1.5">
          {otherUserId && otherUserId !== userId && <ReportUserButton userId={otherUserId} tradeId={tradeId} />}
          {!blockByMe && (
            <button onClick={onBlock} title={t.call.blockUser}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200">
              <ShieldX className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto space-y-2 pe-1">
        {timeline.length === 0 && <p className="text-center text-sm text-slate-400 mt-8">{t.trade.empty}</p>}
        {timeline.map((item) => item.kind === 'system' ? (
          <div key={item.id} className="flex justify-center py-1">
            <div className="flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-[11px] text-slate-500">
              <span>{item.text}</span>
            </div>
          </div>
        ) : (
          <div key={item.id} className={`flex ${item.sender_id === userId ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[75%] rounded-2xl px-3.5 py-2 text-sm ${item.sender_id === userId ? 'bg-sky-500 text-white' : 'bg-slate-100 text-slate-800'}`}>
              {item.text}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      {tradeStatus !== 'cancelled' && !blockActive && (
        <form onSubmit={submit} className="mt-3 flex gap-2">
          <input value={text} onChange={(e) => setText(e.target.value)} placeholder={t.trade.typeMessage} className="flex-1 rounded-full border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-sky-400 focus:bg-white" />
          <button type="submit" disabled={sending} className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-500 text-white hover:bg-sky-600 disabled:opacity-60">
            <Send className="h-4 w-4" />
          </button>
        </form>
      )}
      {blockActive && (
        <p className="mt-3 text-center text-xs text-amber-700">{t.call.youBlocked}</p>
      )}
    </div>
  );
}