import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useI18n } from '@/lib/i18n';
import AggregateRating from '@/components/reviews/AggregateRating';
import ReviewCard from '@/components/reviews/ReviewCard';

export default function ReviewsList({ userId }) {
  const { t } = useI18n();
  const [reviews, setReviews] = useState([]);
  const [reviewers, setReviewers] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    (async () => {
      try {
        const revs = await base44.entities.Review.filter({ reviewee_id: userId }, '-created_date', 50);
        setReviews(revs || []);
        const ids = [...new Set((revs || []).map((r) => r.reviewer_id).filter(Boolean))];
        const map = {};
        if (ids.length) {
          try {
            const res = await base44.functions.invoke('resolveUserNames', { ids });
            const names = res?.data?.names || res?.names || {};
            for (const rid of ids) map[rid] = { full_name: names[rid] || 'User' };
          } catch {
            for (const rid of ids) map[rid] = { full_name: 'User' };
          }
        }
        setReviewers(map);
      } finally {
        setLoading(false);
      }
    })();
  }, [userId]);

  const c = t.community?.reviews || {};
  const avg = reviews.length ? reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length : null;

  return (
    <div className="space-y-4">
      {loading ? (
        <p className="py-10 text-center text-sm text-slate-400">{t.common.loading}</p>
      ) : reviews.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-slate-300 bg-white py-10 text-center text-sm text-slate-400">{c.empty || t.profile.noReviews}</p>
      ) : (
        <>
          <AggregateRating rating={avg} count={reviews.length} label={c.basedOn ? c.basedOn.replace('{n}', reviews.length) : ''} />
          <div className="space-y-2.5">
            {reviews.map((r) => (
              <ReviewCard key={r.id} review={r} reviewer={reviewers[r.reviewer_id]} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}