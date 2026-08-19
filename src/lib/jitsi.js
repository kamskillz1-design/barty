// Loads the Jitsi Meet external API script once and returns a promise that
// resolves with window.JitsiMeetExternalAPI. Uses the free public server
// meet.jit.si — no API key, no account, free forever.
const SCRIPT_SRC = 'https://meet.jit.si/external_api.js';
let loadPromise = null;

export function loadJitsiApi() {
  if (window.JitsiMeetExternalAPI) return Promise.resolve(window.JitsiMeetExternalAPI);
  if (loadPromise) return loadPromise;
  loadPromise = new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = SCRIPT_SRC;
    s.async = true;
    s.onload = () => (window.JitsiMeetExternalAPI ? resolve(window.JitsiMeetExternalAPI) : reject(new Error('Jitsi API missing')));
    s.onerror = () => { loadPromise = null; reject(new Error('Failed to load call service')); };
    document.body.appendChild(s);
  });
  return loadPromise;
}

// Deterministic, trade-scoped room name. Both participants of the same trade
// derive the identical room, so they always land together. The trade id is not
// exposed anywhere else, so no third party can guess the room.
export function buildRoomName(tradeId) {
  return `ibarti-trade-${tradeId}`;
}

// Minimal 1:1 call config: hide Jitsi branding/watermark, disable chat panel,
// invite-others and recording so the overlay stays focused on the call.
export function jitsiConfig(mode) {
  return {
    configOverwrite: {
      startAudioOnly: mode === 'voice',
      startWithVideoMuted: mode === 'voice',
      prejoinPageEnabled: false,
      disableInviteFunctions: true,
      // Keep only the controls useful for a 1:1 barter call.
      toolbarButtons: ['microphone', 'camera', 'desktop', 'fullscreen', 'hangup'],
      hideConferenceSubject: true,
      hideConferenceTimer: false,
      notifications: [] // silence Jitsi's in-call toasts
    },
    interfaceConfigOverwrite: {
      SHOW_JITSI_WATERMARK: false,
      SHOW_WATERMARK_FOR_GUESTS: false,
      SHOW_BRAND_WATERMARK: false,
      SHOW_POWER_BY_INFO: false,
      HIDE_INVITE_MORE_HEADER: true,
      TOOLBAR_BUTTONS: ['microphone', 'camera', 'desktop', 'fullscreen', 'hangup'],
      SHOW_LIVE_CAPTIONS_BUTTON: false,
      SHOW_LOBBY_BUTTON: false
    }
  };
}