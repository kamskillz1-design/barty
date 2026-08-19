import React from 'react';
import { Star } from 'lucide-react';

export default function AggregateRating({ rating, count, label }) {
  if (rating == null && !count) return null;
  const avg = rating != null ? Number(rating).toFixed(1) : '0.0';
  const n = count || 0;
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50/60 px-4 py-3">
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star key={i} className={`h-5 w-5 ${i <= Math.round(rating || 0) ? 'fill-amber-400 text-amber-400' : 'text-amber-200'}`} />
        ))}
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-900 leading-none">{avg}</p>
        {label && <p className="mt-1 text-xs text-slate-500">{label}</p>}
      </div>
      <p className="ms-auto text-xs font-medium text-slate-400">{n}</p>
    </div>
  );
}