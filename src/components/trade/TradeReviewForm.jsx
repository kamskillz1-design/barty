import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { supabase } from '@/api/base44Client';
import { useI18n } from '@/lib/i18n';

/**
 * TradeReviewForm — star rating, comment and recommendation for the other
 * participant of a completed trade. Creates the review record, then hands
 * control back to the page via onSubmitted (close + reload).
 */
export default function TradeReviewForm({ trade, reviewerId, onClose, onSubmitted }) {
  const { t } = useI18n();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [recommend, setRecommend] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const revieweeId = trade.proposer_id === reviewerId ? trade.receiver_id : trade.proposer_id;
      const { error } = await supabase
        .from('reviews')
        .insert({ trade_id: trade.id, reviewer_id: reviewerId, reviewee_id: revieweeId, rating, comment, recommend });

      if (error) {
        throw error;
      }

      onSubmitted && onSubmitted();
    } catch (error) {
      console.error('Failed to submit trade review:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={submit} className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
      <h3 className="font-bold text-slate-900">{t.trade.leaveReview}</h3>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button type="button" key={n} onClick={() => setRating(n)}>
            <Star className={`h-7 w-7 ${n <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
          </button>
        ))}
      </div>
      <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={3} placeholder={t.trade.comment} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-sky-400 focus:bg-white" />
      <label className="flex items-center gap-2 text-sm text-slate-700">
        <input type="checkbox" checked={recommend} onChange={(e) => setRecommend(e.target.checked)} className="h-4 w-4 accent-sky-500" />
        {t.trade.recommend}
      </label>
      <div className="flex justify-end gap-3">
        <button type="button" onClick={onClose} className="rounded-xl px-4 py-2 text-sm text-slate-600 hover:bg-slate-100">{t.common.close}</button>
        <button type="submit" disabled={submitting} className="rounded-xl bg-sky-500 px-5 py-2 text-sm font-semibold text-white hover:bg-sky-600 disabled:opacity-60">{submitting ? t.common.loading : t.trade.submitReview}</button>
      </div>
    </form>
  );
}