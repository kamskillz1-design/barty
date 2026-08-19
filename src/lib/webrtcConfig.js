import { base44 } from '@/api/base44Client';

// Fetches (and briefly caches) the WebRTC ICE server config from the turnConfig
// backend function, which sources time-limited Metered TURN credentials
// server-side. Credentials expire, so we cache for a short TTL and re-fetch at
// the start of each call rather than caching for the whole session.
const STUN_FALLBACK = [{ urls: 'stun:stun.l.google.com:19302' }];
const CACHE_TTL = 3 * 60 * 1000; // 3 minutes — Metered creds outlive this
let cached = null;
let cachedAt = 0;
let inFlight = null;

export async function getIceServers() {
  if (cached && (Date.now() - cachedAt) < CACHE_TTL) return cached;
  if (inFlight) return inFlight;
  inFlight = (async () => {
    try {
      const res = await base44.functions.invoke('turnConfig', {});
      const ice = res?.data?.iceServers;
      cached = Array.isArray(ice) && ice.length ? ice : STUN_FALLBACK;
      cachedAt = Date.now();
      return cached;
    } catch {
      cached = STUN_FALLBACK;
      cachedAt = Date.now();
      return cached;
    } finally {
      inFlight = null;
    }
  })();
  return inFlight;
}