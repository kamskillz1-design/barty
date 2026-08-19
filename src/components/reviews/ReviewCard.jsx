import React from 'react';
import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';

const timeAgo = (d) => {
  if (!d) return '';
  try {
    const diff = Date.now() - new Date(d).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h`;
    const days = Math.floor(hrs / 24);
    return `${days}d`;
  } catch { return ''; }
};

export default function ReviewCard({ review, reviewer }) {
  const name = reviewer?.full_name || 'User';
  const initial = (name || '?').charAt(0).toUpperCase();
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-center gap-3">
        <Link to={`/users/${review.reviewer_id}`} className="shrink-0">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-100 text-sm font-bold text-sky-700">
            {initial}
          </div>
        </Link>
        <div className="flex-1 min-w-0">
          <Link to={`/users/${review.reviewer_id}`} className="text-sm font-semibold text-slate-900 hover:underline">
            {name}
          </Link>
          <div className="mt-0.5 flex items-center gap-2">
            <span className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((n) => (
                <Star key={n} className={`h-3.5 w-3.5 ${n <= review.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
              ))}
            </span>
            <span className="text-xs text-slate-400">{timeAgo(review.created_date)}</span>
          </div>
        </div>
      </div>
      {review.comment && <p className="mt-2.5 text-sm text-slate-600 leading-relaxed whitespace-pre-line">{review.comment}</p>}
    </div>
  );
}