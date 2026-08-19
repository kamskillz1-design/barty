import { base44 } from '@/api/base44Client';

// Fetches (and caches) the WebRTC ICE server config from the turnConfig backend
// function. TURN credentials live in app secrets, never hardcoded here. The
// result is cached for the session; reloading the app re-fetches (so newly-set
// TURN secrets take effect after a reload).
const STUN_FALLBACK = [{ urls: 'stun:stun.l.google.com:19302' }];
let cached = null;
let inFlight = null;

export async function getIceServers() {
  if (cached) return cached;
  if (inFlight) return inFlight;
  inFlight = (async () => {
    try {
      const res = await base44.functions.invoke('turnConfig', {});
      const ice = res?.data?.iceServers;
      cached = Array.isArray(ice) && ice.length ? ice : STUN_FALLBACK;
      return cached;
    } catch {
      cached = STUN_FALLBACK;
      return cached;
    } finally {
      inFlight = null;
    }
  })();
  return inFlight;
}