import React, { useEffect, useRef, useState } from 'react';
import { Phone, Video, Lock, X, ShieldAlert } from 'lucide-react';
import { loadJitsiApi, buildRoomName, jitsiConfig } from '@/lib/jitsi';
import { useI18n } from '@/lib/i18n';

/**
 * JitsiCallModal — embeds a free Jitsi Meet call (meet.jit.si) inside a
 * full-screen overlay. Room is derived from the trade id (see buildRoomName),
 * so both trade participants join the same private room. Call is ended with
 * api.dispose(). Provides End Call and Block-this-caller actions.
 *
 * No audio/video is stored — only call metadata is logged elsewhere.
 */
export default function JitsiCallModal({ tradeId, callId, mode, displayName, otherName, onEnded, onBlock }) {
  const { t } = useI18n();
  const containerRef = useRef(null);
  const apiRef = useRef(null);
  const endedRef = useRef(false);
  const [error, setError] = useState('');
  const [permissionDenied, setPermissionDenied] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const JitsiAPI = await loadJitsiApi();
        if (cancelled || !containerRef.current) return;
        const api = new JitsiAPI('meet.jit.si', {
          roomName: buildRoomName(tradeId),
          parentNode: containerRef.current,
          configOverwrite: jitsiConfig(mode).configOverwrite,
          interfaceConfigOverwrite: jitsiConfig(mode).interfaceConfigOverwrite,
          userInfo: { displayName: displayName || 'iBarti member' }
        });
        apiRef.current = api;
        // Camera/mic permission denial shows up here.
        api.addEventListener('audioMuteStatusChanged', () => {});
        api.addEventListener('participantKickedOut', () => {});
        api.addEventListener('videoConferenceLeft', () => {
          if (!endedRef.current) {
            endedRef.current = true;
            onEnded(callId, mode);
          }
        });
      } catch (e) {
        if (cancelled) return;
        if (e && /NotAllowed|Permission|NotAllowedError/i.test(e.message || '')) setPermissionDenied(true);
        else setError(e?.message || 'Failed to start call');
      }
    })();
    return () => {
      cancelled = true;
      try { apiRef.current && apiRef.current.dispose(); } catch { /* already disposed */ }
      apiRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tradeId]);

  const handleEnd = () => {
    if (endedRef.current) return;
    endedRef.current = true;
    try { apiRef.current && apiRef.current.dispose(); } catch { /* ignore */ }
    apiRef.current = null;
    onEnded(callId, mode);
  };

  const handleBlock = () => {
    if (window.confirm(t.call.confirmBlock)) {
      endedRef.current = true;
      try { apiRef.current && apiRef.current.dispose(); } catch { /* ignore */ }
      apiRef.current = null;
      onBlock(callId, mode);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-900">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 bg-slate-950/80 px-4 py-2.5 text-white">
        <div className="flex min-w-0 items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10">
            {mode === 'video' ? <Video className="h-4 w-4" /> : <Phone className="h-4 w-4" />}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{otherName || t.call.callLabel}</p>
            <p className="text-[11px] text-white/60">{mode === 'video' ? t.call.video : t.call.voice}</p>
          </div>
        </div>
        <button onClick={handleBlock} className="inline-flex items-center gap-1.5 rounded-xl bg-red-500/90 px-3 py-2 text-xs font-semibold text-white hover:bg-red-500">
          <ShieldAlert className="h-4 w-4" /> <span className="hidden sm:inline">{t.call.blockCaller}</span>
        </button>
      </div>

      {/* Jitsi video surface */}
      <div className="relative flex-1">
        {permissionDenied ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 px-6 text-center text-white">
            <Lock className="h-8 w-8 text-white/70" />
            <p className="text-sm font-semibold">{t.call.permissionDeniedTitle}</p>
            <p className="max-w-md text-xs text-white/60">{t.call.permissionDeniedBody}</p>
            <button onClick={handleEnd} className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-900">
              <X className="h-4 w-4" /> {t.call.endCall}
            </button>
          </div>
        ) : (
          <>
            <div ref={containerRef} className="absolute inset-0" />
            {error && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-slate-900 px-6 text-center text-white">
                <p className="text-sm">{t.call.loadError}</p>
                <button onClick={handleEnd} className="mt-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-900">{t.call.endCall}</button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer / End call */}
      <div className="flex items-center justify-center bg-slate-950/80 px-4 py-3">
        <button onClick={handleEnd} className="inline-flex items-center gap-2 rounded-full bg-red-500 px-6 py-3 text-sm font-bold text-white hover:bg-red-600">
          <Phone className="h-4 w-4 rotate-[135deg]" /> {t.call.endCall}
        </button>
      </div>
    </div>
  );
}