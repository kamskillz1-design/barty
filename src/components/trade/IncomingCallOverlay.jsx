import React from 'react';
import { Video, Mic, X } from 'lucide-react';
import { useI18n } from '@/lib/i18n';

/**
 * Centred ring overlay the recipient sees when a call offer arrives.
 * Accept (emerald) / Decline (rose) only.
 */
export default function IncomingCallOverlay({ incoming, callerName, tradeTitle, onAccept, onDecline }) {
  const { t } = useI18n();
  if (!incoming) return null;
  const initial = (callerName || '?').charAt(0).toUpperCase();
  const isVideo = incoming.mode === 'video';

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/70 p-4">
      <div className="w-full max-w-sm rounded-3xl bg-white p-6 text-center shadow-2xl">
        <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-sky-100 text-2xl font-bold text-sky-600">
          <span className="absolute inset-0 animate-ping rounded-full bg-sky-300/40" />
          <span className="relative">{initial}</span>
        </div>
        <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-sky-500">
          {isVideo ? t.call.video : t.call.voice} · {t.call.incoming}
        </p>
        <h3 className="mt-1 text-lg font-bold text-slate-900">{callerName || t.common.member}</h3>
        {tradeTitle && <p className="mt-0.5 line-clamp-1 text-sm text-slate-500">{tradeTitle}</p>}
        <div className="mt-6 flex items-center justify-center gap-4">
          <button type="button" onClick={onDecline} title={t.call.decline}
            className="flex h-14 w-14 items-center justify-center rounded-full bg-rose-500 text-white hover:bg-rose-600">
            <X className="h-6 w-6" />
          </button>
          <button type="button" onClick={onAccept} title={t.call.accept}
            className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-white hover:bg-emerald-600">
            {isVideo ? <Video className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
          </button>
        </div>
      </div>
    </div>
  );
}