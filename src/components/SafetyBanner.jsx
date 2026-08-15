import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { useI18n } from '@/lib/i18n';

export default function SafetyBanner({ className = '' }) {
  const { t } = useI18n();
  return (
    <div className={`flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 ${className}`}>
      <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-600">
        <ShieldCheck className="h-5 w-5" />
      </div>
      <div>
        <p className="text-sm font-semibold text-amber-900">{t.safety.title}</p>
        <p className="text-sm text-amber-800/90 leading-snug">{t.safety.body}</p>
      </div>
    </div>
  );
}