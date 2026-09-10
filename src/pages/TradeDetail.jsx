import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/api/base44Client';
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
import { withLegacyDates, withLegacyDatesList } from '@/lib/supabaseData';

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
    try {
      setLoading(true);
      const {
        data: { session }
      } = await supabase.auth.getSession();
      const { data: tradeData, error: tradeError } = await supabase
        .from('trades')
        .select('*')
        .eq('id', id)
        .or(`proposer_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .maybeSingle();

      if (tradeError) {
        throw tradeError;
      }

      const tr = withLegacyDates(tradeData);
      setTrade(tr);

      if (!tr) {
        setMessages([]);
        setMyReview(null);
        return;
      }

      const messageResponse = await fetch('/api/trade-messages', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          ...(session?.access_token
            ? { Authorization: 'Bearer ' + session.access_token }
            : {})
        },
        body: JSON.stringify({ trade_id: id })
      });
      const messagePayload = await messageResponse.json().catch(() => ({}));

      if (!messageResponse.ok) {
        throw new Error(messagePayload.error || 'Unable to load trade messages');
      }

      setMessages(withLegacyDatesList(messagePayload.messages));

      if (user?.id) {
        const { data: reviewData, error: reviewError } = await supabase
          .from('reviews')
          .select('*')
          .eq('trade_id', id)
          .eq('reviewer_id', user.id)
          .order('created_at', { ascending: true })
          .limit(5);

        if (reviewError) {
          throw reviewError;
        }

        const reviews = withLegacyDatesList(reviewData);
        setMyReview(reviews[0] || null);

        try {
          const otherId = tr.proposer_id === user.id ? tr.receiver_id : tr.proposer_id;
          const state = await getBlockState(user.id, otherId);
          setBlockByMe(state.blockByMe);
          setBlockByOther(state.blockByOther);
        } catch (error) {
          console.error('Failed to load trade block state:', error);
        }
      }
    } catch (error) {
      console.error('Failed to load trade detail:', error);
      setTrade(null);
      setMessages([]);
      setMyReview(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!id) return undefined;

    if (user) {
      void load();
    }

    const tradeChannel = supabase
      .channel(`trade-${id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'trades', filter: `id=eq.${id}` },
        () => {
          if (user) {
            void load();
          }
        }
      )
      .subscribe();

    const messageChannel = supabase
      .channel(`trade-messages-${id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'messages', filter: `trade_id=eq.${id}` },
        () => {
          if (user) {
            void load();
          }
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(tradeChannel);
      void supabase.removeChannel(messageChannel);
    };
  }, [id, user]);

  const updateTrade = async (data) => {
    const { data: updatedTrade, error } = await supabase
      .from('trades')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    const normalizedTrade = withLegacyDates(updatedTrade);
    setTrade(normalizedTrade);
    return normalizedTrade;
  };

  const addMessage = async (message) => {
    const { data, error } = await supabase
      .from('messages')
      .insert(message)
      .select()
      .single();

    if (error) {
      throw error;
    }

    const normalizedMessage = withLegacyDates(data);
    setMessages((current) => {
      const next = [...current.filter((item) => item.id !== normalizedMessage.id), normalizedMessage];
      return next.sort((a, b) => new Date(a.created_date) - new Date(b.created_date));
    });
    return normalizedMessage;
  };

  const accept = async () => {
    try {
      await updateTrade({ status: 'accepted' });
    } catch (error) {
      console.error('Failed to accept trade:', error);
    }
  };
  const decline = async () => {
    try {
      await updateTrade({ status: 'cancelled' });
    } catch (error) {
      console.error('Failed to decline trade:', error);
    }
  };
  const cancel = async () => {
    try {
      await updateTrade({ status: 'cancelled' });
    } catch (error) {
      console.error('Failed to cancel trade:', error);
    }
  };

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
    try {
      await updateTrade({
        requested_listing_id: trade.counter_listing_id,
        requested_listing_title: trade.counter_listing_title,
        requested_listing_value: trade.counter_listing_value,
        ...clearCounter
      });
      await addMessage({ trade_id: id, sender_id: user.id, kind: 'system', text: 'Counter-offer accepted' });
      notifyTradeEvent(id, 'counter');
      await load();
    } catch (error) {
      console.error('Failed to accept counter-offer:', error);
    }
  };

  const declineCounter = async () => {
    try {
      await updateTrade({ ...clearCounter });
      await addMessage({ trade_id: id, sender_id: user.id, kind: 'system', text: 'Counter-offer declined' });
      notifyTradeEvent(id, 'message');
      await load();
    } catch (error) {
      console.error('Failed to decline counter-offer:', error);
    }
  };

  const markComplete = async () => {
    try {
      const isProposer = trade.proposer_id === user.id;
      const patch = isProposer ? { proposer_completed: true } : { receiver_completed: true };
      const updated = await updateTrade(patch);
      if (updated.proposer_completed && updated.receiver_completed) {
        const final = await updateTrade({ status: 'completed' });
        setTrade(final);
        try {
          const [{ error: offeredError }, { error: requestedError }] = await Promise.all([
            supabase
              .from('listings')
              .update({ status: 'traded' })
              .eq('id', trade.offered_listing_id),
            supabase
              .from('listings')
              .update({ status: 'traded' })
              .eq('id', trade.requested_listing_id)
          ]);

          if (offeredError) {
            throw offeredError;
          }

          if (requestedError) {
            throw requestedError;
          }
        } catch (error) {
          console.error('Failed to mark traded listings as completed:', error);
        }
      } else {
        setTrade(updated);
      }
    } catch (error) {
      console.error('Failed to mark trade complete:', error);
    }
  };

  const sendMessage = async (txt) => {
    try {
      await addMessage({ trade_id: id, sender_id: user.id, text: txt });
      notifyTradeEvent(id, 'message');
      await load();
    } catch (error) {
      console.error('Failed to send trade message:', error);
    }
  };

  const handleSafeSpotChange = async (spotId) => {
    try {
      return await updateTrade({ safe_spot_id: spotId || null });
    } catch (error) {
      console.error('Failed to update trade safe spot:', error);
      return trade;
    }
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
        onSafeSpotChange={handleSafeSpotChange}
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