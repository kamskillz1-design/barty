import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useI18n } from '@/lib/i18n';
import { useAuth } from '@/lib/AuthContext';
import SafetyBanner from '@/components/SafetyBanner';
import ValueMatchIndicator from '@/components/ValueMatchIndicator';
import SafeSpotSelector from '@/components/SafeSpotSelector';
import useCall from '@/hooks/useCall';
import CallOverlay from '@/components/trade/CallOverlay';
import IncomingCallOverlay from '@/components/trade/IncomingCallOverlay';
import { useToast } from '@/components/ui/use-toast';
import { ArrowLeft, Send, Check, X, Star, ShieldCheck } from 'lucide-react';
import moment from 'moment';

const STATUS_STYLE = {
  pending: 'bg-amber-50 text-amber-700',
  accepted: 'bg-sky-50 text-sky-700',
  completed: 'bg-emerald-50 text-emerald-700',
  cancelled: 'bg-slate-100 text-slate-500'
};

export default function TradeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useI18n();
  const { user } = useAuth();
  const [trade, setTrade] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [myReview, setMyReview] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [recommend, setRecommend] = useState(true);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [otherUser, setOtherUser] = useState(null);
  const [callEvents, setCallEvents] = useState([]);
  const { toast } = useToast();
  const bottomRef = useRef(null);

  const participantIds = trade ? [trade.proposer_id, trade.receiver_id].filter(Boolean) : [];
  const otherUserId = trade ? (trade.proposer_id === user?.id ? trade.receiver_id : trade.proposer_id) : null;
  const call = useCall({
    tradeId: id,
    tradeParticipantIds: participantIds,
    meId: user?.id,
    otherUserId,
    onError: (k) => toast({ title: t.call?.[k] || k, variant: 'destructive' })
  });
  const timeline = useMemo(() => {
    const merged = [
      ...messages.map((m) => ({ _kind: 'msg', id: m.id, sender_id: m.sender_id, text: m.text, created_date: m.created_date })),
      ...callEvents.map((e) => ({ _kind: 'call', ...e }))
    ];
    return merged.sort((a, b) => new Date(a.created_date) - new Date(b.created_date));
  }, [messages, callEvents]);

  const load = async () => {
    const tr = await base44.entities.Trade.get(id);
    setTrade(tr);
    const msgs = await base44.entities.Message.filter({ trade_id: id }, 'created_date', 500);
    setMessages(msgs || []);
    try {
      const o = await base44.asServiceRole.entities.User.get(tr.proposer_id === user.id ? tr.receiver_id : tr.proposer_id);
      setOtherUser(o);
    } catch {}
    try {
      const ce = await base44.entities.CallEvent.filter({ trade_id: id }, 'created_date', 500);
      setCallEvents(ce || []);
    } catch {}
    try {
      const revs = await base44.entities.Review.filter({ trade_id: id, reviewer_id: user.id }, 'created_date', 5);
      if (revs && revs.length) setMyReview(revs[0]);
    } catch {}
    setLoading(false);
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  useEffect(() => {
    if (user) load();
    const unsub = base44.entities.Message.subscribe((event) => {
      if (event.data?.trade_id === id) load();
    });
    const unsubCe = base44.entities.CallEvent.subscribe((event) => {
      if (event.data?.trade_id === id) load();
    });
    return () => { unsub && unsub(); unsubCe && unsubCe(); };
  }, [id, user]);

  const updateTrade = (data) => base44.entities.Trade.update(id, data).then((tr) => { setTrade(tr); return tr; });

  const accept = () => updateTrade({ status: 'accepted' });
  const decline = () => updateTrade({ status: 'cancelled' });
  const cancel = () => updateTrade({ status: 'cancelled' });

  const markComplete = async () => {
    const isProposer = trade.proposer_id === user.id;
    const patch = isProposer ? { proposer_completed: true } : { receiver_completed: true };
    const updated = await base44.entities.Trade.update(id, patch);
    if (updated.proposer_completed && updated.receiver_completed) {
      const final = await base44.entities.Trade.update(id, { status: 'completed' });
      setTrade(final);
      // mark listings reserved/traded
      try {
        await base44.entities.Listing.update(trade.offered_listing_id, { status: 'traded' });
        await base44.entities.Listing.update(trade.requested_listing_id, { status: 'traded' });
      } catch {}
    } else {
      setTrade(updated);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setSending(true);
    try {
      await base44.entities.Message.create({ trade_id: id, sender_id: user.id, text: text.trim() });
      setText('');
      load();
    } finally {
      setSending(false);
    }
  };

  const submitReview = async (e) => {
    e.preventDefault();
    setSubmittingReview(true);
    try {
      const revieweeId = trade.proposer_id === user.id ? trade.receiver_id : trade.proposer_id;
      await base44.entities.Review.create({ trade_id: id, reviewer_id: user.id, reviewee_id: revieweeId, rating, comment, recommend });
      setReviewOpen(false);
      load();
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) return <div className="py-20 text-center text-slate-400">{t.common.loading}</div>;
  if (!trade) return <div className="py-20 text-center text-slate-400">{t.common.empty}</div>;

  const outgoing = trade.proposer_id === user.id;
  const otherCompleted = outgoing ? trade.receiver_completed : trade.proposer_completed;
  const myCompleted = outgoing ? trade.proposer_completed : trade.receiver_completed;
  const otherName = otherUser?.full_name || t.common.member;
  const callRowText = (e) => {
    const actor = e.user_id === user.id ? t.common.you : otherName;
    const map = {
      video_started: t.call.startedVideo,
      voice_started: t.call.startedVoice,
      ended: e.mode === 'video' ? t.call.endedVideo : t.call.endedVoice,
      missed: e.mode === 'video' ? t.call.missedVideo : t.call.missedVoice,
      declined: e.mode === 'video' ? t.call.declinedVideo : t.call.declinedVoice
    };
    return (map[e.event] || t.call.ended).replace('{name}', actor);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <button onClick={() => navigate(-1)} className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800">
        <ArrowLeft className="h-4 w-4" /> {t.listing.back}
      </button>

      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex items-center justify-between">
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_STYLE[trade.status]}`}>{t.trade.status[trade.status]}</span>
        </div>
        <div className="mt-4 flex items-center gap-3">
          <div className="flex-1 min-w-0 rounded-xl bg-slate-50 p-3">
            <p className="text-xs text-slate-400">{outgoing ? t.trade.youOffered : t.trade.offered}</p>
            <p className="truncate font-semibold text-slate-900">{trade.offered_listing_title}</p>
          </div>
          <ArrowLeft className="h-5 w-5 shrink-0 text-sky-500 rotate-180" />
          <div className="flex-1 min-w-0 rounded-xl bg-slate-50 p-3">
            <p className="text-xs text-slate-400">{outgoing ? t.trade.youRequested : t.trade.requested}</p>
            <p className="truncate font-semibold text-slate-900">{trade.requested_listing_title}</p>
          </div>
        </div>

        <div className="mt-4">
          <ValueMatchIndicator offeredValue={trade.offered_listing_value} requestedValue={trade.requested_listing_value} />
        </div>

        {(trade.status === 'pending' || trade.status === 'accepted') && (
          <SafeSpotSelector
            trade={trade}
            onChange={async (spotId) => setTrade(await base44.entities.Trade.update(id, { safe_spot_id: spotId }))}
          />
        )}

        {/* Actions */}
        <div className="mt-4 flex flex-wrap gap-2">
          {trade.status === 'pending' && !outgoing && (
            <>
              <button onClick={accept} className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600"><Check className="h-4 w-4" /> {t.trade.accept}</button>
              <button onClick={decline} className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200"><X className="h-4 w-4" /> {t.trade.decline}</button>
            </>
          )}
          {(trade.status === 'pending' || trade.status === 'accepted') && (
            <button onClick={markComplete} disabled={myCompleted} className="inline-flex items-center gap-1.5 rounded-xl bg-sky-500 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-600 disabled:opacity-60">
              <Check className="h-4 w-4" /> {myCompleted ? `${t.trade.markComplete} ✓` : t.trade.markComplete}
            </button>
          )}
          {trade.status !== 'completed' && trade.status !== 'cancelled' && (
            <button onClick={cancel} className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-medium text-slate-500 hover:bg-slate-100">{t.trade.cancel}</button>
          )}
        </div>
        {trade.status === 'accepted' && (
          <p className="mt-2 text-xs text-slate-500">
            {myCompleted ? `✓ ${t.common.you}` : ''} {myCompleted && otherCompleted ? ' — ' : myCompleted && !otherCompleted ? ` · ${t.trade.bothComplete}` : !myCompleted ? t.trade.completeConfirm : ''}
          </p>
        )}

        {trade.status === 'completed' && (
          <div className="mt-3">
            {myReview ? (
              <p className="flex items-center gap-1.5 text-sm text-emerald-600"><Check className="h-4 w-4" /> {t.trade.reviewLeft}</p>
            ) : (
              <button onClick={() => setReviewOpen((o) => !o)} className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200">
                <Star className="h-4 w-4" /> {t.trade.leaveReview}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Review form */}
      {reviewOpen && (
        <form onSubmit={submitReview} className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
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
            <button type="button" onClick={() => setReviewOpen(false)} className="rounded-xl px-4 py-2 text-sm text-slate-600 hover:bg-slate-100">{t.common.close}</button>
            <button type="submit" disabled={submittingReview} className="rounded-xl bg-sky-500 px-5 py-2 text-sm font-semibold text-white hover:bg-sky-600 disabled:opacity-60">{submittingReview ? t.common.loading : t.trade.submitReview}</button>
          </div>
        </form>
      )}

      {/* Chat */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 flex flex-col h-[420px]">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h3 className="font-bold text-slate-900">{t.trade.chat}</h3>

        </div>
        <div className="flex-1 overflow-y-auto space-y-2 pe-1">
          {timeline.length === 0 && <p className="text-center text-sm text-slate-400 mt-8">{t.trade.empty}</p>}
          {timeline.map((item) => item._kind === 'call' ? (
            <div key={item.id} className="flex justify-center py-1">
              <div className="flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-[11px] text-slate-500">
                <span>{callRowText(item)} · {moment(item.created_date).format('LT')}</span>

              </div>
            </div>
          ) : (
            <div key={item.id} className={`flex ${item.sender_id === user.id ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] rounded-2xl px-3.5 py-2 text-sm ${item.sender_id === user.id ? 'bg-sky-500 text-white' : 'bg-slate-100 text-slate-800'}`}>
                {item.text}
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
        {trade.status !== 'cancelled' && (
          <form onSubmit={sendMessage} className="mt-3 flex gap-2">
            <input value={text} onChange={(e) => setText(e.target.value)} placeholder={t.trade.typeMessage} className="flex-1 rounded-full border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-sky-400 focus:bg-white" />
            <button type="submit" disabled={sending} className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-500 text-white hover:bg-sky-600 disabled:opacity-60">
              <Send className="h-4 w-4" />
            </button>
          </form>
        )}
      </div>

      {(call.status === 'connecting' || call.status === 'connected') && (
        <CallOverlay
          status={call.status} mode={call.mode} isCaller={call.isCaller}
          localStream={call.localStream} remoteStream={call.remoteStream}
          micOn={call.micOn} videoOn={call.videoOn} duration={call.duration}
          onToggleMute={call.toggleMute} onToggleVideo={call.toggleVideo} onEnd={call.endCall}
        />
      )}
      {call.incoming && (
        <IncomingCallOverlay
          incoming={call.incoming}
          callerName={otherUser?.full_name}
          tradeTitle={trade.requested_listing_title}
          onAccept={call.acceptIncoming}
          onDecline={call.declineIncoming}
        />
      )}

      <SafetyBanner />
    </div>
  );
}