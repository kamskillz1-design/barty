import React from 'react';
import LanguagePicker from '@/components/LanguagePicker';
import { useI18n } from '@/lib/i18n';

export default function LanguageSwitcher() {
  const { lang, setLang } = useI18n();
  return <LanguagePicker variant="header" value={lang} onChange={setLang} placeholder="Language" />;
}