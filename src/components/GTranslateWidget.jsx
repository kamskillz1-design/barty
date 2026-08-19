import React, { useEffect } from 'react';

// Injected once app-wide so the GTranslate widget script is not re-loaded on
// every Layout re-mount (React would otherwise strip/ignore raw <script> tags).
let injected = false;

// Snaps the GTranslate cookie value; returns '' when not set or inaccessible.
const readGoogTrans = () => {
  try {
    const m = document.cookie.match(/(?:^|;)\s*googtrans=([^;]+)/);
    return m ? decodeURIComponent(m[1]) : '';
  } catch { return ''; }
};

export default function GTranslateWidget() {
  useEffect(() => {
    if (injected) return;
    injected = true;
    // Preserve and execute both script tags exactly as provided.
    window.gtranslateSettings = {
      default_language: 'en',
      native_language_names: true,
      wrapper_selector: '.gtranslate_wrapper',
      switcher_horizontal_position: 'inline'
    };
    const s = document.createElement('script');
    s.src = 'https://cdn.gtranslate.net/widgets/latest/float.js';
    s.defer = true;
    document.body.appendChild(s);

    // GTranslate translates the live DOM, but React owns that DOM via its
    // virtual DOM — switching back to the source language can't restore stale
    // cached nodes. So when an actual language selection mutates the googtrans
    // cookie, force a hard reload so GTranslate works on a fresh English base.
    const wrapper = document.querySelector('.gtranslate_wrapper');
    if (wrapper) {
      wrapper.addEventListener('click', () => {
        const before = readGoogTrans();
        setTimeout(() => {
          if (readGoogTrans() !== before) window.location.reload();
        }, 400);
      });
    }
  }, []);

  return (
    <div className="gtranslate_wrapper flex items-center min-w-0" aria-label="Translate" />
  );
}