import React, { useEffect } from 'react';

// Injected once app-wide so the GTranslate widget script is not re-loaded on
// every Layout re-mount (React would otherwise strip/ignore raw <script> tags).
let injected = false;

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
  }, []);

  return (
    <div className="gtranslate_wrapper flex items-center min-w-0" aria-label="Translate" />
  );
}