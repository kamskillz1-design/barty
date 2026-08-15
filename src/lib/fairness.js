// Invisible value-matching engine.
// Compares two internal baseline values and returns a non-monetary fairness label.
// Never returns or surfaces any currency figure.

export function evaluateFairness(offeredValue, requestedValue) {
  const a = Number(offeredValue) || 0;
  const b = Number(requestedValue) || 0;
  if (a === 0 && b === 0) return { key: 'fair', ratio: 1, pct: 100 };
  const min = Math.min(a, b);
  const max = Math.max(a, b);
  const ratio = max === 0 ? 1 : min / max;
  let key;
  if (ratio >= 0.9) key = 'fair';
  else if (ratio >= 0.75) key = 'balanced';
  else if (ratio >= 0.6) key = 'slightlyUnbalanced';
  else key = 'unbalanced';
  return { key, ratio, pct: Math.round(ratio * 100) };
}

export const FAIRNESS_STYLES = {
  fair: { bg: 'bg-emerald-50', text: 'text-emerald-700', ring: 'ring-emerald-200', dot: 'bg-emerald-500', bar: 'bg-emerald-500' },
  balanced: { bg: 'bg-sky-50', text: 'text-sky-700', ring: 'ring-sky-200', dot: 'bg-sky-500', bar: 'bg-sky-500' },
  slightlyUnbalanced: { bg: 'bg-amber-50', text: 'text-amber-700', ring: 'ring-amber-200', dot: 'bg-amber-500', bar: 'bg-amber-500' },
  unbalanced: { bg: 'bg-rose-50', text: 'text-rose-700', ring: 'ring-rose-200', dot: 'bg-rose-500', bar: 'bg-rose-500' }
};