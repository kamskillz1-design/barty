import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/api/base44Client';
import { useI18n } from '@/lib/i18n';
import { useAuth } from '@/lib/AuthContext';
import { MessageSquare, Send } from 'lucide-react';
import CommentItem from '@/components/comments/CommentItem';
import { withLegacyDates, withLegacyDatesList } from '@/lib/supabaseData';

export default function CommentsSection({ listingId, listingOwnerId }) {
  const { t } = useI18n();
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [posting, setPosting] = useState(false);

  const load = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('listing_id', listingId)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) {
        throw error;
      }

      setComments(withLegacyDatesList(data));
    } catch (error) {
      console.error('Failed to load comments:', error);
      setComments([]);
    } finally {
      setLoading(false);
    }
  }, [listingId]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!listingId) return;
    const channel = supabase
      .channel(`comments-${listingId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'comments',
          filter: `listing_id=eq.${listingId}`
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const comment = withLegacyDates(payload.new);
            setComments((current) => [comment, ...current.filter((item) => item.id !== comment.id)]);
          } else if (payload.eventType === 'UPDATE') {
            const comment = withLegacyDates(payload.new);
            setComments((current) => current.map((item) => (item.id === comment.id ? comment : item)));
          } else if (payload.eventType === 'DELETE') {
            setComments((current) => current.filter((item) => item.id !== payload.old?.id));
          }
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [listingId]);

  const submit = async () => {
    const body = text.trim();
    if (!body || !user) return;
    setPosting(true);
    try {
      const { data, error } = await supabase
        .from('comments')
        .insert({
        listing_id: listingId,
        author_id: user.id,
        author_name: user.full_name || 'User',
        body,
        edited: false
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      const comment = withLegacyDates(data);
      setComments((current) => [comment, ...current.filter((item) => item.id !== comment.id)]);
      setText('');
      // Realtime subscription will prepend; ensure immediate for snappy UX
    } catch (error) {
      console.error('Failed to post comment:', error);
    } finally {
      setPosting(false);
    }
  };

  const onDelete = async (id) => {
    try {
      const {
        data: { session }
      } = await supabase.auth.getSession();
      const response = await fetch('/api/delete-comment', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          ...(session?.access_token
            ? { Authorization: 'Bearer ' + session.access_token }
            : {})
        },
        body: JSON.stringify({ comment_id: id })
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || 'Unable to delete comment');
      }

      setComments((c) => c.filter((x) => x.id !== id));
    } catch (error) {
      console.error('Failed to delete comment:', error);
    }
  };

  const onEdit = async (id, newBody) => {
    try {
      const { data, error } = await supabase
        .from('comments')
        .update({ body: newBody, edited: true })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      const updated = withLegacyDates(data);
      setComments((c) => c.map((x) => x.id === id ? updated : x));
    } catch (error) {
      console.error('Failed to edit comment:', error);
    }
  };

  const canManage = (c) => user && (c.author_id === user.id || c.created_by_id === user.id || listingOwnerId === user.id || user.role === 'admin');

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
      <div className="flex items-center gap-2 mb-3">
        <MessageSquare className="h-4 w-4 text-sky-600" />
        <h2 className="text-base font-bold text-slate-900">{t.community?.comments?.title || 'Comments'}</h2>
        <span className="text-xs text-slate-400">{comments.length}</span>
      </div>

      {user ? (
        <div className="flex gap-2 mb-4">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={2}
            placeholder={t.community?.comments?.placeholder || 'Write a comment…'}
            className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-sky-400 focus:bg-white resize-none"
          />
          <button
            onClick={submit}
            disabled={!text.trim() || posting}
            className="self-end inline-flex items-center gap-1.5 rounded-xl bg-sky-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-sky-600 disabled:opacity-50"
          >
            <Send className="h-4 w-4" /> {t.community?.comments?.post || 'Post'}
          </button>
        </div>
      ) : (
        <p className="mb-4 rounded-xl bg-slate-50 px-3 py-2.5 text-sm text-slate-500">
          <Link to="/login" className="font-semibold text-sky-600">{t.community?.comments?.loginToComment || 'Log in to leave a comment'}</Link>
        </p>
      )}

      {loading ? (
        <p className="py-6 text-center text-sm text-slate-400">{t.common.loading}</p>
      ) : comments.length === 0 ? (
        <p className="py-8 text-center text-sm text-slate-400">{t.community?.comments?.empty || 'No comments yet.'}</p>
      ) : (
        <div className="space-y-3">
          {comments.map((c) => (
            <CommentItem
              key={c.id}
              comment={c}
              canManage={canManage(c)}
              onDelete={onDelete}
              onEdit={onEdit}
              t={t}
            />
          ))}
        </div>
      )}
    </div>
  );
}