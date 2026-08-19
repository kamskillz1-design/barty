import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { secrets } from 'base44:runtime';

// Returns the WebRTC ICE server config for peer-to-peer trade calls. Combines
// Google STUN with the self-hosted coturn TURN relay (sourced from app secrets)
// so peers behind different NATs can still relay media. If the TURN secrets
// are not yet configured it falls back to STUN-only (same-network calls still
// work); once the builder sets the four TURN_* secrets the relay activates
// without any code change.
export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const host = secrets.get('TURN_HOST');
    const port = secrets.get('TURN_PORT') || '3478';
    const turnUser = secrets.get('TURN_USER');
    const turnPass = secrets.get('TURN_PASS');

    const iceServers = [{ urls: 'stun:stun.l.google.com:19302' }];
    if (host) {
      const urls = [
        `turn:${host}:${port}?transport=udp`,
        `turn:${host}:${port}?transport=tcp`
      ];
      const creds = turnUser ? { username: turnUser, credential: turnPass } : {};
      iceServers.push({ urls, ...creds });
    }
    return Response.json({ iceServers });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}