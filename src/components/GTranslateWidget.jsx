import React, { useEffect } from 'react';

// Injected once app-wide. The GTranslate float.js engine renders its native flag
// switcher here so the engine initializes and exposes window.doGTranslate, and the
// user can pick a language directly. Our searchable dropdown (GTranslateSwitcher)
// drives the same engine programmatically for non-English picks; English reloads.
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

    // GTranslate's in-place English restore is flaky in React, so on an English
    // pick we clear the googtrans cookie and reload to get the clean English DOM.
    const onClick = (e) => {
      let el = e.target;
      while (el && el !== document.body) {
        if (el.dataset && el.dataset.gtLang === 'en') {
          document.cookie = 'googtrans=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/';
          document.cookie = 'googtrans=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;domain=' + window.location.hostname;
          window.location.reload();
          break;
        }
        el = el.parentElement;
      }
    };
    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, []);

  return <div className="gtranslate_engine" />;
}