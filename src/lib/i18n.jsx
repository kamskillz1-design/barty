import React, { createContext, useContext, useState, useEffect } from 'react';

const translations = {
  en: { _dir: 'ltr', appName: 'iBarti', tagline: 'Exchange goods and services, no money needed' }
};

// Languages written right-to-left; everything else is treated as LTR.
const RTL_CODES = new Set(['ar', 'he', 'fa', 'ur', 'ps', 'sd', 'yi', 'dv', 'ug', 'ks']);

// Comprehensive list of UI languages (ISO 639-1-ish codes) shown in the picker.
// GTranslate does the actual on-page translation; this list only drives the buttons.
const UI_LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Spanish' },
  { code: 'fr', label: 'French' },
  { code: 'ar', label: 'Arabic' },
  { code: 'de', label: 'German' },
  { code: 'pt', label: 'Portuguese' },
  { code: 'it', label: 'Italian' },
  { code: 'nl', label: 'Dutch' },
  { code: 'ru', label: 'Russian' },
  { code: 'uk', label: 'Ukrainian' },
  { code: 'pl', label: 'Polish' },
  { code: 'cs', label: 'Czech' },
  { code: 'sk', label: 'Slovak' },
  { code: 'hu', label: 'Hungarian' },
  { code: 'ro', label: 'Romanian' },
  { code: 'bg', label: 'Bulgarian' },
  { code: 'sr', label: 'Serbian' },
  { code: 'hr', label: 'Croatian' },
  { code: 'sl', label: 'Slovenian' },
  { code: 'mk', label: 'Macedonian' },
  { code: 'sq', label: 'Albanian' },
  { code: 'el', label: 'Greek' },
  { code: 'tr', label: 'Turkish' },
  { code: 'da', label: 'Danish' },
  { code: 'sv', label: 'Swedish' },
  { code: 'nb', label: 'Norwegian' },
  { code: 'fi', label: 'Finnish' },
  { code: 'is', label: 'Icelandic' },
  { code: 'et', label: 'Estonian' },
  { code: 'lv', label: 'Latvian' },
  { code: 'lt', label: 'Lithuanian' },
  { code: 'be', label: 'Belarusian' },
  { code: 'ca', label: 'Catalan' },
  { code: 'eu', label: 'Basque' },
  { code: 'gl', label: 'Galician' },
  { code: 'cy', label: 'Welsh' },
  { code: 'ga', label: 'Irish' },
  { code: 'mt', label: 'Maltese' },
  { code: 'he', label: 'Hebrew' },
  { code: 'fa', label: 'Persian' },
  { code: 'ps', label: 'Pashto' },
  { code: 'ur', label: 'Urdu' },
  { code: 'hi', label: 'Hindi' },
  { code: 'bn', label: 'Bengali' },
  { code: 'pa', label: 'Punjabi' },
  { code: 'gu', label: 'Gujarati' },
  { code: 'mr', label: 'Marathi' },
  { code: 'ta', label: 'Tamil' },
  { code: 'te', label: 'Telugu' },
  { code: 'kn', label: 'Kannada' },
  { code: 'ml', label: 'Malayalam' },
  { code: 'si', label: 'Sinhala' },
  { code: 'ne', label: 'Nepali' },
  { code: 'th', label: 'Thai' },
  { code: 'lo', label: 'Lao' },
  { code: 'km', label: 'Khmer' },
  { code: 'my', label: 'Burmese' },
  { code: 'id', label: 'Indonesian' },
  { code: 'ms', label: 'Malay' },
  { code: 'tl', label: 'Filipino' },
  { code: 'vi', label: 'Vietnamese' },
  { code: 'zh', label: 'Chinese' },
  { code: 'ja', label: 'Japanese' },
  { code: 'ko', label: 'Korean' },
  { code: 'mn', label: 'Mongolian' },
  { code: 'kk', label: 'Kazakh' },
  { code: 'uz', label: 'Uzbek' },
  { code: 'az', label: 'Azerbaijani' },
  { code: 'ka', label: 'Georgian' },
  { code: 'hy', label: 'Armenian' },
  { code: 'sw', label: 'Swahili' },
  { code: 'am', label: 'Amharic' },
  { code: 'so', label: 'Somali' },
  { code: 'ha', label: 'Hausa' },
  { code: 'yo', label: 'Yoruba' },
  { code: 'ig', label: 'Igbo' },
  { code: 'zu', label: 'Zulu' },
  { code: 'xh', label: 'Xhosa' },
  { code: 'af', label: 'Afrikaans' },
  { code: 'mg', label: 'Malagasy' },
  { code: 'ht', label: 'Haitian Creole' },
  { code: 'mi', label: 'Maori' },
  { code: 'sm', label: 'Samoan' }
];

const LANGUAGES_BY_CODE = UI_LANGUAGES.reduce((m, l) => { m[l.code] = l; return m; }, {});

const detectDir = (code) => (RTL_CODES.has(code) ? 'rtl' : 'ltr');

// A few of our codes don't match Google's exact code for that language.
// This map corrects those before we hand the code to GTranslate.
const GOOGLE_CODE_OVERRIDES = {
  zh: 'zh-CN',
  nb: 'no',
  he: 'iw'
};
const toGoogleCode = (code) => GOOGLE_CODE_OVERRIDES[code] || code;

const I18nContext = createContext();

// localStorage key that remembers the user's chosen language across visits.
const LANG_PREF_KEY = 'ibarti_lang_pref';

const readStoredLang = () => {
  try { return localStorage.getItem(LANG_PREF_KEY) || 'en'; } catch { return 'en'; }
};

// Calls GTranslate's own switch function once it has finished loading on the
// page. GTranslate self-defers internally too, but we add one retry here in
// case the widget script hasn't attached window.doGTranslate yet at all.
const triggerGTranslate = (googleCode, attemptsLeft = 6) => {
  if (typeof window.doGTranslate === 'function') {
    window.doGTranslate(`en|${googleCode}`);
    return;
  }
  if (attemptsLeft <= 0) return;
  setTimeout(() => triggerGTranslate(googleCode, attemptsLeft - 1), 500);
};

export const I18nProvider = ({ children }) => {
  const [lang, setLangState] = useState(() => readStoredLang());
  const [t] = useState(() => translations.en);

  const dir = detectDir(lang);

  useEffect(() => {
    document.documentElement.dir = dir;
    document.documentElement.lang = lang;
  }, [lang, dir]);

  // On first load, if the user previously picked a non-English language,
  // re-apply it once GTranslate is ready.
  useEffect(() => {
    const stored = readStoredLang();
    if (stored && stored !== 'en') {
      triggerGTranslate(toGoogleCode(stored));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setLang = (code) => {
    setLangState(code);
    try { localStorage.setItem(LANG_PREF_KEY, code); } catch { /* storage blocked */ }
    triggerGTranslate(toGoogleCode(code));
  };

  return (
    <I18nContext.Provider value={{ lang, setLang, t, dir }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = () => {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
};

export const LANGUAGES = UI_LANGUAGES;

export { translations };
