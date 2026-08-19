import { useState, useRef, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { buildRoomName } from '@/lib/jitsi';

/**
 * useJitsiCall — owns the state + side effects for a Jitsi trade call:
 *  - starts a call (posts a system Message + a CallEvent log row)
 *  - lets a participant join an existing call from a "Join Call" system message
 *  - ends a call (posts an ended system Message + CallEvent with duration)
 *  - blocks the caller: creates a UserBlock, ends the call, posts a block msg
 *
 * Notifications ride the existing Message realtime subscription (the trade chat
 * is already real-time), so the other user sees "Join Call" live without any
 * new notification system.
 */
export default function useJitsiCall({ tradeId, participantIds, meId }) {
  const [activeCall, setActiveCall] = useState(null); // { callId, mode, roomName, joiner }
  const startedAtRef = useRef(null);

  const logEvent = async (event, { callId, mode, duration } = {}) => {
    try {
      await base44.entities.CallEvent.create({
        trade_id: tradeId,
        call_id: callId,
        user_id: meId,
        participants: participantIds,
        event,
        mode,
        ...(duration != null ? { duration } : {})
      });
    } catch { /* log-only, never fatal */ }
  };

  const postSystem = async (text, meta) => {
    try {
      await base44.entities.Message.create({
        trade_id: tradeId,
        sender_id: meId,
        text,
        kind: 'system',
        meta
      });
    } catch { /* realtime will still surface a local reload */ }
  };

  const startCall = useCallback(async (mode, otherName) => {
    const callId = `${tradeId}-${Date.now()}`;
    const roomName = buildRoomName(tradeId);
    startedAtRef.current = Date.now();
    setActiveCall({ callId, mode, roomName });
    await logEvent(mode === 'video' ? 'video_started' : 'voice_started', { callId, mode });
    await postSystem(`${mode === 'video' ? '📹' : '📞'} ${mode === 'video' ? 'Video call started' : 'Voice call started'}`, {
      call_id: callId, call_status: 'started', mode
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tradeId, meId, participantIds]);

  const joinCall = useCallback((meta) => {
    startedAtRef.current = Date.now();
    setActiveCall({
      callId: meta?.call_id,
      mode: meta?.mode || 'video',
      roomName: buildRoomName(tradeId),
      joiner: true
    });
  }, [tradeId]);

  const endCall = useCallback(async (callId, mode) => {
    const duration = startedAtRef.current ? Math.round((Date.now() - startedAtRef.current) / 1000) : 0;
    startedAtRef.current = null;
    setActiveCall(null);
    if (!callId) return;
    await logEvent('ended', { callId, mode, duration });
    await postSystem(`📴 Call ended${duration ? ` · ${duration}s` : ''}`, { call_id: callId, call_status: 'ended', mode });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tradeId, participantIds]);

  const blockCaller = useCallback(async (callId, mode, otherUserId) => {
    // End the call first (logs + system msg), then record the one-directional block.
    await endCall(callId, mode);
    try {
      await base44.entities.UserBlock.create({ blocker_id: meId, blocked_id: otherUserId, active: true });
    } catch { /* already blocked — keep idempotent */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meId]);

  return { activeCall, startCall, joinCall, endCall, blockCaller };
}