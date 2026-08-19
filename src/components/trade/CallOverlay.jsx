import React, { useEffect, useRef } from 'react';
import { Mic, MicOff, Video, VideoOff, PhoneOff, Phone } from 'lucide-react';
import { useI18n } from '@/lib/i18n';

const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

/**
 * Full-screen overlay for an in-progress WebRTC call. Video mode shows the
 * remote participant large with a local PiP; voice mode shows a minimalist
 * avatar+pulse panel. Both share a bottom control bar.
 */
export default function CallOverlay({ status, mode, localStream, remoteStream, micOn, videoOn, duration, onToggleMute, onToggleVideo, onEnd }) {
  const { t } = useI18n();
  const remoteRef = useRef(null);
  const localRef = useRef(null);

  useEffect(() => { if (remoteRef.current && remoteStream) remoteRef.current.srcObject = remoteStream; }, [remoteStream]);
  useEffect(() => { if (localRef.current && localStream) localRef.current.srcObject = localStream; }, [localStream]);

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-slate-950 text-white">
      {mode === 'video' ? (
        <div className="relative flex-1 overflow-hidden">
          <video ref={remoteRef} autoPlay playsInline className="h-full w-full object-cover" />
          <div className="absolute end-3 bottom-3 h-28 w-40 overflow-hidden rounded-xl border border-white/20 bg-black/40 shadow-lg sm:h-32 sm:w-48">
            <video ref={localRef} autoPlay playsInline muted className="h-full w-full -scale-x-100 object-cover" />
          </div>
        </div>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center gap-5 px-6">
          <div className="relative flex h-28 w-28 items-center justify-center">
            <span className="absolute inset-0 animate-ping rounded-full bg-sky-400/20" />
            <span className="absolute inset-2 rounded-full bg-sky-500/20" />
            <span className="relative flex h-20 w-20 items-center justify-center rounded-full bg-sky-500 text-white">
              <Phone className="h-9 w-9" />
            </span>
          </div>
          <p className="text-sm text-white/70">{status === 'connecting' ? t.call.connecting : t.call.voice}</p>
        </div>
      )}

      <div className="flex flex-col items-center gap-1 pb-7 pt-2">
        <p className="text-sm font-medium text-white">
          {status === 'connecting' ? t.call.connecting : `${t.call.connected} · ${fmt(duration)}`}
        </p>
        <div className="mt-3 flex items-center gap-3">
          <button type="button" onClick={onToggleMute} title={micOn ? t.call.mute : t.call.unmute}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20">
            {micOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
          </button>
          {mode === 'video' && (
            <button type="button" onClick={onToggleVideo} title={videoOn ? t.call.videoOff : t.call.videoOn}
              className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20">
              {videoOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
            </button>
          )}
          <button type="button" onClick={onEnd} title={t.call.endCall}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-500 text-white hover:bg-rose-600">
            <PhoneOff className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}