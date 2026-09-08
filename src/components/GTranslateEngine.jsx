import React, { useEffect } from 'react';

// Injects the GTranslate engine once per app. The engine needs a mounted
// wrapper to initialize and expose window.doGTranslate, which the searchable
// language dropdown (GTranslateSwitcher) drives programmatically. The wrapper
// itself is kept visually hidden — the native flag switcher it renders is
// unreliable, so the dropdown is the user-facing language option.
let injected = false;

export default function GTranslateEngine() {
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

    // GTranslate's in-place English restore is flaky in React, so picking
    // English (from any GTranslate-rendered element) clears the googtrans
    // cookie and reloads to get the clean English DOM.
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

  return <div className="gtranslate_engine hidden" aria-hidden="true" />;
}