import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useI18n } from '@/lib/i18n';
import { useAuth } from '@/lib/AuthContext';
import { MessageSquare, Send, Pencil, Trash2, X, Check } from 'lucide-react';
import CommentItem from '@/components/comments/CommentItem';
import { useCanAct } from '@/hooks/useSuspension';

export default function CommentsSection({ listingId, listingOwnerId }) {
  const { t } = useI18n();
  const { user } = useAuth();
  const assertCanAct = useCanAct();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [posting, setPosting] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await base44.entities.Comment.filter({ listing_id: listingId }, '-created_date', 100);
      setComments(data || []);
    } finally {
      setLoading(false);
    }
  }, [listingId]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!listingId) return;
    const unsub = base44.entities.Comment.subscribe((event) => {
      const ev = event?.type;
      if (ev === 'create') setComments((c) => event.data ? [event.data, ...c.filter((x) => x.id !== event.data.id)] : c);
      else if (ev === 'update') setComments((c) => c.map((x) => x.id === event.data?.id ? event.data : x));
      else if (ev === 'delete') setComments((c) => c.filter((x) => x.id !== event?.data?.id));
    });
    return () => { unsub && unsub(); };
  }, [listingId]);

  const submit = async () => {
    const body = text.trim();
    if (!body || !user) return;
    if (!(await assertCanAct())) return;
    setPosting(true);
    try {
      await base44.entities.Comment.create({
        listing_id: listingId,
        author_id: user.id,
        author_name: user.full_name || 'User',
        body,
        edited: false
      });
      setText('');
      // Realtime subscription will prepend; ensure immediate for snappy UX
    } finally {
      setPosting(false);
    }
  };

  const onDelete = async (id) => {
    try {
      await base44.functions.invoke('deleteComment', { comment_id: id });
      setComments((c) => c.filter((x) => x.id !== id));
    } catch { /* RLS/backend reports forbidden as error */ }
  };

  const onEdit = async (id, newBody) => {
    await base44.entities.Comment.update(id, { body: newBody, edited: true });
    setComments((c) => c.map((x) => x.id === id ? { ...x, body: newBody, edited: true } : x));
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