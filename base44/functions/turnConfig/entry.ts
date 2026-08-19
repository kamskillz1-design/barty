import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { secrets } from 'base44:runtime';

// Returns the WebRTC ICE server config for peer-to-peer trade calls. Fetches
// fresh time-limited iceServers from Metered's hosted free TURN REST API using
// the app secret API key (server-side only — the key never reaches the browser).
// Falls back to Google STUN-only if the Metered secrets are unset or the fetch
// fails, so same-network calls still work.
export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const apiKey = secrets.get('METERED_API_KEY');
    const app = secrets.get('METERED_APP');

    const stun = { urls: 'stun:stun.l.google.com:19302' };
    if (!apiKey || !app) return Response.json({ iceServers: [stun] });

    const url = `https://${app}.metered.live/api/v1/turn/credentials?apiKey=${encodeURIComponent(apiKey)}`;
    const metered = await fetch(url, { method: 'GET' });
    if (!metered.ok) return Response.json({ iceServers: [stun] });
    const data = await metered.json();
    const ice = Array.isArray(data) ? data
      : Array.isArray(data?.iceServers) ? data.iceServers
      : Array.isArray(data?.ice) ? data.ice
      : [];
    const iceServers = ice.length ? [stun, ...ice] : [stun];
    return Response.json({ iceServers });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}