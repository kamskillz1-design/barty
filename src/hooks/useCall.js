import { useState, useRef, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';

const ICE_SERVERS = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };
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
  const statusRef = useRef('idle');
  const incomingRef = useRef(null);
  const timerRef = useRef(null);
  const missedTimerRef = useRef(null);

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
    setMode(null); setIsCaller(false);
    setStatusBoth('idle');
  }, []);

  const hardReset = cleanupCall;

  const buildPeer = () => {
    const pc = new RTCPeerConnection(ICE_SERVERS);
    pcRef.current = pc;
    pc.ontrack = (ev) => {
      const r = new MediaStream(ev.streams[0].getTracks());
      remoteRef.current = r;
      setRemoteStream(r);
      if (statusRef.current === 'connecting') onConnected();
    };
    pc.onicecandidate = (ev) => { if (ev.candidate) sendSignal('ice', JSON.stringify(ev.candidate)); };
    pc.oniceconnectionstatechange = () => {
      const st = pc.iceConnectionState;
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
    setStatusBoth('connecting');
    setMode(m); modeRef.current = m; setIsCaller(true);
    callIdRef.current = crypto.randomUUID();
    let stream;
    try {
      stream = await acquireMedia(m);
    } catch {
      onError?.('permissionError');
      hardReset();
      return;
    }
    const pc = buildPeer();
    stream.getTracks().forEach((t) => pc.addTrack(t, stream));
    try {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      await sendSignal('offer', JSON.stringify(offer));
      await logEvent(m === 'video' ? 'video_started' : 'voice_started');
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
    callIdRef.current = inc.callId; modeRef.current = inc.mode; setMode(inc.mode); setIsCaller(false);
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
    const pc = buildPeer();
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

  // Signaling subscription (app-wide; filtered to this trade + counterpart).
  useEffect(() => {
    if (!tradeId) return;
    const handler = async (event) => {
      const sig = event.data;
      if (!sig || sig.trade_id !== tradeId) return;
      if (sig.from_user_id === meId) return; // ignore our own outgoing signals
      if (sig.kind === 'offer') {
        if (statusRef.current === 'idle' && !incomingRef.current) {
          setIncomingBoth({ callId: sig.call_id, mode: sig.mode, fromUserId: sig.from_user_id });
        }
      } else if (sig.kind === 'ice') {
        const pc = pcRef.current;
        if (pc && pc.currentRemoteDescription) { try { await pc.addIceCandidate(JSON.parse(sig.payload)); } catch {} }
        else pendingIceRef.current.push(sig.payload);
      } else if (sig.kind === 'answer') {
        const pc = pcRef.current;
        if (pc && !pc.currentRemoteDescription) {
          try { await pc.setRemoteDescription(JSON.parse(sig.payload)); } catch {}
          for (const c of pendingIceRef.current) { try { await pc.addIceCandidate(JSON.parse(c)); } catch {} }
          pendingIceRef.current = [];
          if (statusRef.current === 'connecting') onConnected();
        }
      } else if (sig.kind === 'decline' || sig.kind === 'end') {
        setIncomingBoth(null);
        cleanupCall();
      }
    };
    const unsub = base44.entities.CallSignal.subscribe(handler);
    return () => { unsub && unsub(); };
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