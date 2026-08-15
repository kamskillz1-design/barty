import React from 'react';
import { useI18n } from '@/lib/i18n';
import { evaluateFairness, FAIRNESS_STYLES } from '@/lib/fairness';

export default function ValueMatchIndicator({ offeredValue, requestedValue }) {
  const { t } = useI18n();
  const result = evaluateFairness(offeredValue, requestedValue);
  const style = FAIRNESS_STYLES[result.key];
  return (
    <div className={`rounded-2xl ring-1 ${style.ring} ${style.bg} p-4`}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className={`h-2.5 w-2.5 rounded-full ${style.dot}`} />
          <span className={`text-base font-semibold ${style.text}`}>{t.value[result.key]}</span>
        </div>
        <span className={`text-sm font-medium ${style.text}`}>{result.pct}%</span>
      </div>
      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-white/70">
        <div className={`h-full rounded-full ${style.bar} transition-all`} style={{ width: `${result.pct}%` }} />
      </div>
      <p className="mt-3 text-xs text-slate-500 leading-snug">{t.value.explanation}</p>
    </div>
  );
}