import React, { useEffect } from 'react';

// Injected once app-wide. The GTranslate float.js engine still runs so it can
// translate the freshly-rendered English base DOM on each load, but its own
// visible flag switcher is hidden — our GTranslateSwitcher drives language
// selection via the googtrans cookie + page reload (no stale-DOM restore issue).
let injected = false;

export default function GTranslateWidget() {
  useEffect(() => {
    if (injected) return;
    injected = true;
    window.gtranslateSettings = {
      default_language: 'en',
      native_language_names: true,
      wrapper_selector: '.gtranslate_engine',
      switcher_horizontal_position: 'inline'
    };
    const s = document.createElement('script');
    s.src = 'https://cdn.gtranslate.net/widgets/latest/float.js';
    s.defer = true;
    document.body.appendChild(s);
  }, []);

  // Hidden container so the engine's own switcher never renders visibly.
  return <div className="gtranslate_engine hidden" aria-hidden="true" />;
}