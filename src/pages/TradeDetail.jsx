import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useI18n } from '@/lib/i18n';
import { useAuth } from '@/lib/AuthContext';
import SafetyBanner from '@/components/SafetyBanner';
import TradeSummaryCard from '@/components/trade/TradeSummaryCard';
import TradeChat from '@/components/trade/TradeChat';
import TradeReviewForm from '@/components/trade/TradeReviewForm';
import { useToast } from '@/components/ui/use-toast';
import { ArrowLeft } from 'lucide-react';
import { getBlockState, blockUser as blockUserOp } from '@/lib/userBlocks';
import { notifyTradeEvent } from '@/lib/tradeNotifications';

export default function TradeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useI18n();
  const { user } = useAuth();
  const { toast } = useToast();
  const [trade, setTrade] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [myReview, setMyReview] = useState(null);
  const [blockByMe, setBlockByMe] = useState(false);
  const [blockByOther, setBlockByOther] = useState(false);
  const blockActive = blockByMe || blockByOther;

  const otherUserId = trade ? (trade.proposer_id === user?.id ? trade.receiver_id : trade.proposer_id) : null;

  const timeline = useMemo(
    () => [...messages].sort((a, b) => new Date(a.created_date) - new Date(b.created_date)),
    [messages]
  );

  const load = async () => {
    const tr = await base44.entities.Trade.get(id);
    setTrade(tr);
    const msgs = await base44.entities.Message.filter({ trade_id: id }, 'created_date', 500);
    setMessages(msgs || []);
    try {
      const revs = await base44.entities.Review.filter({ trade_id: id, reviewer_id: user.id }, 'created_date', 5);
      if (revs && revs.length) setMyReview(revs[0]);
    } catch {}
    try {
      const otherId = tr.proposer_id === user.id ? tr.receiver_id : tr.proposer_id;
      const state = await getBlockState(user.id, otherId);
      setBlockByMe(state.blockByMe);
      setBlockByOther(state.blockByOther);
    } catch {}
    setLoading(false);
  };

  useEffect(() => {
    if (user) load();
    const unsub = base44.entities.Message.subscribe((event) => {
      if (event.data?.trade_id === id) load();
    });
    return () => { unsub && unsub(); };
  }, [id, user]);

  const updateTrade = (data) => base44.entities.Trade.update(id, data).then((tr) => { setTrade(tr); return tr; });

  const accept = () => updateTrade({ status: 'accepted' });
  const decline = () => updateTrade({ status: 'cancelled' });
  const cancel = () => updateTrade({ status: 'cancelled' });

  // Counter-offer lifecycle: the receiver proposes a different listing of
  // theirs; the proposer accepts (the requested side is swapped to the counter
  // listing) or declines (the counter clears, the trade stays pending).
  const clearCounter = {
    counter_listing_id: '',
    counter_listing_title: '',
    counter_listing_value: null,
    counter_message: '',
    counter_proposed_by_id: ''
  };

  const acceptCounter = async () => {
    await updateTrade({
      requested_listing_id: trade.counter_listing_id,
      requested_listing_title: trade.counter_listing_title,
      requested_listing_value: trade.counter_listing_value,
      ...clearCounter
    });
    await base44.entities.Message.create({ trade_id: id, sender_id: user.id, kind: 'system', text: 'Counter-offer accepted' });
    notifyTradeEvent(id, 'counter');
    load();
  };

  const declineCounter = async () => {
    await updateTrade({ ...clearCounter });
    await base44.entities.Message.create({ trade_id: id, sender_id: user.id, kind: 'system', text: 'Counter-offer declined' });
    notifyTradeEvent(id, 'message');
    load();
  };

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

  const sendMessage = async (txt) => {
    await base44.entities.Message.create({ trade_id: id, sender_id: user.id, text: txt });
    notifyTradeEvent(id, 'message');
    load();
  };

  const handleBlockUser = async () => {
    if (!otherUserId) return;
    if (window.confirm(t.call.confirmBlockUser)) {
      try {
        await blockUserOp(user.id, otherUserId);
        setBlockByMe(true);
        toast({ title: t.call.blocked });
      } catch { /* already blocked */ }
    }
  };

  if (loading) return <div className="py-20 text-center text-slate-400">{t.common.loading}</div>;
  if (!trade) return <div className="py-20 text-center text-slate-400">{t.common.empty}</div>;

  const outgoing = trade.proposer_id === user.id;
  const myCompleted = outgoing ? trade.proposer_completed : trade.receiver_completed;
  const otherCompleted = outgoing ? trade.receiver_completed : trade.proposer_completed;

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <button onClick={() => navigate(-1)} className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800">
        <ArrowLeft className="h-4 w-4" /> {t.listing.back}
      </button>

      <TradeSummaryCard
        trade={trade}
        outgoing={outgoing}
        myCompleted={myCompleted}
        otherCompleted={otherCompleted}
        myReview={myReview}
        blockActive={blockActive}
        onAccept={accept}
        onDecline={decline}
        onCancel={cancel}
        onMarkComplete={markComplete}
        onAcceptCounter={acceptCounter}
        onDeclineCounter={declineCounter}
        onSafeSpotChange={async (spotId) => setTrade(await base44.entities.Trade.update(id, { safe_spot_id: spotId }))}
        onReload={load}
        onToggleReview={() => setReviewOpen((o) => !o)}
      />

      {reviewOpen && (
        <TradeReviewForm
          trade={trade}
          reviewerId={user.id}
          onClose={() => setReviewOpen(false)}
          onSubmitted={() => { setReviewOpen(false); load(); }}
        />
      )}

      <TradeChat
        tradeId={id}
        tradeStatus={trade.status}
        timeline={timeline}
        userId={user.id}
        otherUserId={otherUserId}
        blockActive={blockActive}
        blockByMe={blockByMe}
        onSend={sendMessage}
        onBlock={handleBlockUser}
      />

      <SafetyBanner />
    </div>
  );
}