import React, { useEffect, useState } from 'react';
import { supabase } from '@/api/supabaseClient';
import { useI18n } from '@/lib/i18n';
import AggregateRating from '@/components/reviews/AggregateRating';
import ReviewCard from '@/components/reviews/ReviewCard';
import { resolveUsers } from '@/lib/userMeta';

export default function ReviewsList({ userId }) {
  const { t } = useI18n();

  const [reviews, setReviews] = useState([]);
  const [reviewers, setReviewers] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const loadReviews = async () => {
      if (!userId) {
        if (!cancelled) {
          setReviews([]);
          setReviewers({});
          setLoading(false);
        }
        return;
      }

      setLoading(true);

      try {
        const { data: reviewData, error: reviewsError } = await supabase
          .from('reviews')
          .select('*')
          .eq('reviewee_id', userId)
          .order('created_at', { ascending: false })
          .limit(50);

        if (reviewsError) {
          throw reviewsError;
        }

        const reviewsList = reviewData || [];

        if (cancelled) return;

        setReviews(reviewsList);

        const ids = [
          ...new Set(
            reviewsList
              .map((review) => review.reviewer_id)
              .filter(Boolean)
          ),
        ];

        const reviewerMap = {};

        if (ids.length > 0) {
          try {
            const { names } = await resolveUsers(ids);

            ids.forEach((reviewerId) => {
              reviewerMap[reviewerId] = {
                full_name: names[reviewerId] || 'User',
              };
            });
          } catch (error) {
            console.error('Failed to load reviewer names:', error);

            ids.forEach((reviewerId) => {
              reviewerMap[reviewerId] = {
                full_name: 'User',
              };
            });
          }
        }

        if (!cancelled) {
          setReviewers(reviewerMap);
        }
      } catch (error) {
        console.error('Failed to load reviews:', error);

        if (!cancelled) {
          setReviews([]);
          setReviewers({});
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadReviews();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  const c = t?.community?.reviews || {};

  const averageRating = reviews.length
    ? reviews.reduce(
        (total, review) => total + Number(review.rating || 0),
        0
      ) / reviews.length
    : null;

  return (
    <div className="space-y-4">
      {loading ? (
        <p className="py-10 text-center text-sm text-slate-400">
          {t?.common?.loading || 'Loading…'}
        </p>
      ) : reviews.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-slate-300 bg-white py-10 text-center text-sm text-slate-400">
          {c.empty || t?.profile?.noReviews || 'No reviews yet.'}
        </p>
      ) : (
        <>
          <AggregateRating
            rating={averageRating}
            count={reviews.length}
            label={
              c.basedOn
                ? c.basedOn.replace('{n}', reviews.length)
                : ''
            }
          />

          <div className="space-y-2.5">
            {reviews.map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
                reviewer={reviewers[review.reviewer_id]}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
