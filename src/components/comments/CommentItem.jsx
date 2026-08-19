import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Pencil, Trash2, X, Check } from 'lucide-react';

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

export default function CommentItem({ comment, canManage, onDelete, onEdit, t }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(comment.body || '');

  const save = () => {
    const v = draft.trim();
    if (!v) return;
    onEdit(comment.id, v);
    setEditing(false);
  };

  const initial = (comment.author_name || '?').charAt(0).toUpperCase();

  return (
    <div className="flex gap-3 rounded-xl bg-slate-50/60 p-3">
      <Link to={`/users/${comment.author_id}`} className="shrink-0">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sky-100 text-sm font-bold text-sky-700">
          {initial}
        </div>
      </Link>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <Link to={`/users/${comment.author_id}`} className="text-sm font-semibold text-slate-900 hover:underline">
            {comment.author_name || 'User'}
          </Link>
          <span className="text-xs text-slate-400">{timeAgo(comment.created_date)}{comment.edited ? ` · ${t.community?.comments?.edited || 'edited'}` : ''}</span>
          {canManage && !editing && (
            <span className="ms-auto inline-flex gap-1">
              <button onClick={() => { setDraft(comment.body); setEditing(true); }} className="rounded-md p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700">
                <Pencil className="h-3.5 w-3.5" />
              </button>
              <button onClick={() => onDelete(comment.id)} className="rounded-md p-1 text-slate-400 hover:bg-rose-100 hover:text-rose-600">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </span>
          )}
        </div>
        {editing ? (
          <div className="mt-1.5">
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              rows={2}
              className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-sm outline-none focus:border-sky-400 resize-none"
            />
            <div className="mt-1.5 flex gap-2">
              <button onClick={save} className="inline-flex items-center gap-1 rounded-md bg-sky-500 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-sky-600">
                <Check className="h-3.5 w-3.5" /> {t.community?.comments?.save || 'Save'}
              </button>
              <button onClick={() => setEditing(false)} className="inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium text-slate-500 hover:bg-slate-200">
                <X className="h-3.5 w-3.5" /> {t.community?.comments?.cancel || 'Cancel'}
              </button>
            </div>
          </div>
        ) : (
          <p className="mt-1 text-sm text-slate-700 leading-relaxed whitespace-pre-line break-words">{comment.body}</p>
        )}
      </div>
    </div>
  );
}