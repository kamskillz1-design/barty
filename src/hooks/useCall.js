import { useState, useRef, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { getIceServers } from '@/lib/webrtcConfig';

const STUN_ONLY = [{ urls: 'stun:stun.l.google.com:19302' }];
const MISSED_TIMEOUT = 35000; // recipient has ~35s to answer before the call is marked missed

/**
 * Peer-to-peer WebRTC calling for a trade chat. Signaling is exchanged via the
 * CallSignal entity + Base44 realtime subscriptions (backend functions are
 * stateless HTTP, so we use entity create events as the transport). Lifecycle
 * events (started/ended/missed/declined) are recorded on CallEvent for the
 * chat's system-message timeline.
 *
 * State machine: idle -> connecting -> connected -> ended (then idle).
 * A parallel `incoming` branch is used by the recipient of an incoming ring.
 */
export default function useCall({ tradeId, tradeParticipantIds, meId, otherUserId, onError }) {
  const [status, setStatus] = useState('idle');
  const [mode, setMode] = useState(null);
  const [isCaller, setIsCaller] = useState(false);
  const [incoming, setIncoming] = useState(null); // { callId, mode, fromUserId }
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [micOn, setMicOn] = useState(true);
  const [videoOn, setVideoOn] = useState(true);
  const [duration, setDuration] = useState(0);

  const pcRef = useRef(null);
  const localRef = useRef(null);
  const remoteRef = useRef(null);
  const callIdRef = useRef(null);
  const modeRef = useRef(null);
  const pendingIceRef = useRef([]);
  const answeredRef = useRef(false);
  const isCallerRef = useRef(false);
  const statusRef = useRef('idle');
  const incomingRef = useRef(null);
  const timerRef = useRef(null);
  const missedTimerRef = useRef(null);
  const seenIdsRef = useRef(new Set());
  const handleSignalRef = useRef(null);

  const setStatusBoth = (s) => { statusRef.current = s; setStatus(s); };
  const setIncomingBoth = (v) => { incomingRef.current = v; setIncoming(v); };

  const stopTimer = () => { if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; } };
  const startTimer = () => { stopTimer(); setDuration(0); timerRef.current = setInterval(() => setDuration((d) => d + 1), 1000); };
  const clearMissed = () => { if (missedTimerRef.current) { clearTimeout(missedTimerRef.current); missedTimerRef.current = null; } };

  const stopLocal = () => { localRef.current?.getTracks().forEach((t) => t.stop()); localRef.current = null; setLocalStream(null); };
  const clearRemote = () => { remoteRef.current?.getTracks().forEach((t) => t.stop()); remoteRef.current = null; setRemoteStream(null); };

  const sendSignal = async (kind, payload = '') => {
    if (!callIdRef.current || !tradeParticipantIds?.length) return;
    try {
      await base44.entities.CallSignal.create({
        call_id: callIdRef.current, trade_id: tradeId,
        from_user_id: meId, to_user_id: otherUserId,
        participants: tradeParticipantIds, kind, mode: modeRef.current, payload
      });
    } catch { /* signaling best-effort */ }
  };

  const logEvent = async (event) => {
    if (!callIdRef.current || !tradeParticipantIds?.length) return;
    try {
      await base44.entities.CallEvent.create({
        trade_id: tradeId, call_id: callIdRef.current, user_id: meId,
        participants: tradeParticipantIds, event, mode: modeRef.current
      });
    } catch { /* lifecycle best-effort */ }
  };

  const onConnected = () => {
    clearMissed();
    setStatusBoth('connected');
    startTimer();
    // Log a "started" row only once (by the caller) AND only after the call has
    // actually connected — so a failed/missed call leaves no false chat row.
    if (isCallerRef.current) logEvent(modeRef.current === 'video' ? 'video_started' : 'voice_started');
  };

  const cleanupCall = useCallback(() => {
    stopTimer();
    clearMissed();
    stopLocal();
    clearRemote();
    if (pcRef.current) { try { pcRef.current.close(); } catch {} pcRef.current = null; }
    pendingIceRef.current = [];
    answeredRef.current = false;
    callIdRef.current = null;
    modeRef.current = null;
    setMicOn(true); setVideoOn(true);
    setMode(null); setIsCaller(false); isCallerRef.current = false;
    setStatusBoth('idle');
  }, []);

  const hardReset = cleanupCall;

  const buildPeer = (iceServers) => {
    const pc = new RTCPeerConnection({ iceServers: iceServers && iceServers.length ? iceServers : STUN_ONLY });
    pcRef.current = pc;
    pc.ontrack = (ev) => {
      // Buffer the remote track into a persistent stream. "Connected" status is
      // driven by the ICE connection state below, not by track arrival.
      if (!remoteRef.current) remoteRef.current = new MediaStream();
      remoteRef.current.addTrack(ev.track);
      setRemoteStream(new MediaStream(remoteRef.current.getTracks()));
    };
    pc.onicecandidate = (ev) => { if (ev.candidate) sendSignal('ice', JSON.stringify(ev.candidate)); };
    pc.oniceconnectionstatechange = () => {
      const st = pc.iceConnectionState;
      if ((st === 'connected' || st === 'completed') && statusRef.current === 'connecting') onConnected();
      if ((st === 'disconnected' || st === 'failed') && statusRef.current === 'connected') endCall();
    };
    return pc;
  };

  const acquireMedia = async (m) => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: m === 'video' });
    localRef.current = stream;
    setLocalStream(stream);
    setMicOn(true);
    setVideoOn(m === 'video');
    return stream;
  };

  const startCall = async (m) => {
    if (!window.RTCPeerConnection || !navigator.mediaDevices?.getUserMedia) { onError?.('noWebrtc'); return; }
    if (statusRef.current !== 'idle') return;
    try {
      const r = await base44.functions.invoke('checkCanAct', {});
      const d = r?.data || r || {};
      if (d.blocked) { onError?.('suspended'); return; }
    } catch { /* fail open */ }
    setStatusBoth('connecting');
    setMode(m); modeRef.current = m; setIsCaller(true); isCallerRef.current = true;
    callIdRef.current = crypto.randomUUID();
    let stream;
    try {
      stream = await acquireMedia(m);
    } catch {
      onError?.('permissionError');
      hardReset();
      return;
    }
    const iceServers = await getIceServers();
    const pc = buildPeer(iceServers);
    stream.getTracks().forEach((t) => pc.addTrack(t, stream));
    try {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      await sendSignal('offer', JSON.stringify(offer));
    } catch {
      onError?.('noWebrtc');
      hardReset();
      return;
    }
    missedTimerRef.current = setTimeout(() => {
      if (!answeredRef.current && statusRef.current === 'connecting') {
        sendSignal('end');
        logEvent('missed');
        cleanupCall();
      }
    }, MISSED_TIMEOUT);
  };

  const acceptIncoming = async () => {
    const inc = incomingRef.current;
    if (!inc) return;
    setIncomingBoth(null);
    if (!window.RTCPeerConnection || !navigator.mediaDevices?.getUserMedia) { onError?.('noWebrtc'); return; }
    callIdRef.current = inc.callId; modeRef.current = inc.mode; setMode(inc.mode); setIsCaller(false); isCallerRef.current = false;
    setStatusBoth('connecting');
    answeredRef.current = true;
    let stream;
    try {
      stream = await acquireMedia(inc.mode);
    } catch {
      onError?.('permissionError');
      await sendSignal('decline');
      await logEvent('declined');
      hardReset();
      return;
    }
    const iceServers = await getIceServers();
    const pc = buildPeer(iceServers);
    stream.getTracks().forEach((t) => pc.addTrack(t, stream));
    try {
      const offerRecs = await base44.entities.CallSignal.filter({ call_id: inc.callId, kind: 'offer', trade_id: tradeId }, '-created_date', 5);
      const offer = offerRecs?.[0];
      if (offer?.payload) await pc.setRemoteDescription(JSON.parse(offer.payload));
      for (const c of pendingIceRef.current) { try { await pc.addIceCandidate(JSON.parse(c)); } catch {} }
      pendingIceRef.current = [];
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      await sendSignal('answer', JSON.stringify(answer));
    } catch {
      onError?.('noWebrtc');
      hardReset();
    }
  };

  const declineIncoming = async () => {
    const inc = incomingRef.current;
    if (!inc) return;
    setIncomingBoth(null);
    callIdRef.current = inc.callId; modeRef.current = inc.mode;
    await sendSignal('decline');
    await logEvent('declined');
    callIdRef.current = null; modeRef.current = null;
  };

  const endCall = useCallback(async () => {
    if (statusRef.current === 'idle') return;
    if (statusRef.current === 'connected' || statusRef.current === 'connecting') {
      await sendSignal('end');
      if (statusRef.current === 'connected') await logEvent('ended');
    }
    cleanupCall();
  }, [cleanupCall]);

  const toggleMute = () => {
    const t = localRef.current?.getAudioTracks()[0];
    if (t) { t.enabled = !t.enabled; setMicOn(t.enabled); }
  };
  const toggleVideo = () => {
    const t = localRef.current?.getVideoTracks()[0];
    if (t) { t.enabled = !t.enabled; setVideoOn(t.enabled); }
  };

  // Shared signal handler — used by both the realtime subscription (fast path)
  // and the polling backstop (safety net). Dedupes by record id so the same
  // signal is never applied twice even if both paths deliver it.
  const handleSignal = async (sig) => {
    if (!sig || sig.trade_id !== tradeId) return;
    if (sig.id && seenIdsRef.current.has(sig.id)) return;
    if (sig.id) seenIdsRef.current.add(sig.id);
    if (sig.from_user_id === meId) return; // ignore our own outgoing signals
    if (sig.kind === 'offer') {
      if (statusRef.current === 'idle' && !incomingRef.current) {
        // Only ring for offers still within the ringing window, so idle polling
        // can't resurrect an offer from an already-ended/missed call.
        const age = Date.now() - new Date(sig.created_date).getTime();
        if (age < MISSED_TIMEOUT) {
          setIncomingBoth({ callId: sig.call_id, mode: sig.mode, fromUserId: sig.from_user_id });
        }
      }
    } else if (sig.kind === 'ice') {
      // Ignore ICE candidates not for the active call (e.g. stale records the
      // idle poll surfaces from a previous call) so they can't corrupt a new one.
      if (!callIdRef.current || sig.call_id !== callIdRef.current) return;
      const pc = pcRef.current;
      if (pc && pc.currentRemoteDescription) { try { await pc.addIceCandidate(JSON.parse(sig.payload)); } catch {} }
      else pendingIceRef.current.push(sig.payload);
    } else if (sig.kind === 'answer') {
      if (sig.call_id !== callIdRef.current) return; // not for our call
      const pc = pcRef.current;
      if (pc && !pc.currentRemoteDescription) {
        try { await pc.setRemoteDescription(JSON.parse(sig.payload)); } catch {}
        for (const c of pendingIceRef.current) { try { await pc.addIceCandidate(JSON.parse(c)); } catch {} }
        pendingIceRef.current = [];
      }
    } else if (sig.kind === 'decline' || sig.kind === 'end') {
      // Only act on terminal signals for our current call or pending ring, so a
      // stale record from a prior call can't tear down a live one.
      if (sig.call_id !== callIdRef.current && incomingRef.current?.callId !== sig.call_id) return;
      setIncomingBoth(null);
      cleanupCall();
    }
  };
  handleSignalRef.current = handleSignal;

  // Primary fast path: realtime delivery of CallSignal create events.
  useEffect(() => {
    if (!tradeId) return;
    const unsub = base44.entities.CallSignal.subscribe((event) => {
      if (handleSignalRef.current) handleSignalRef.current(event.data);
    });
    return () => { unsub && unsub(); };
  }, [tradeId]);

  // Safety net: poll for CallSignal records this user may have missed. The
  // realtime subscription is the primary fast path, but signals can be dropped
  // when a tab is backgrounded or briefly reconnects. This poll ALSO runs
  // while idle (cadence ~3s) so a recipient never silently misses an incoming
  // ring, and tightens to ~1.5s once a call is active or ringing.
  useEffect(() => {
    if (!tradeId) return;
    let active = true;
    let timer = null;
    const poll = async () => {
      try {
        const recs = await base44.entities.CallSignal.filter({ trade_id: tradeId }, '-created_date', 50);
        if (recs?.length) {
          const ordered = recs.slice().reverse(); // oldest first
          for (const sig of ordered) {
            if (handleSignalRef.current) await handleSignalRef.current(sig);
          }
        }
      } catch { /* polling best-effort */ }
      if (!active) return;
      const next = (statusRef.current === 'idle' && !incomingRef.current) ? 3000 : 1500;
      timer = setTimeout(poll, next);
    };
    timer = setTimeout(poll, 3000);
    return () => { active = false; if (timer) clearTimeout(timer); };
  }, [tradeId]);

  // Tear down any live call when the chat unmounts.
  useEffect(() => {
    return () => {
      if (statusRef.current !== 'idle') { try { sendSignal('end'); logEvent('ended'); } catch {} }
      stopTimer(); clearMissed();
      localRef.current?.getTracks().forEach((t) => t.stop());
      remoteRef.current?.getTracks().forEach((t) => t.stop());
      try { pcRef.current?.close(); } catch {}
    };
  }, []);

  return {
    status, mode, isCaller, incoming,
    localStream, remoteStream, micOn, videoOn, duration,
    startCall, acceptIncoming, declineIncoming, endCall,
    toggleMute, toggleVideo
  };
}