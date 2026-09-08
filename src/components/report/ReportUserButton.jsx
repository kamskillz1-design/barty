import React, { useState } from 'react';
import { Flag, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useI18n } from '@/lib/i18n';
import { useAuth } from '@/lib/AuthContext';
import { useToast } from '@/components/ui/use-toast';

const REASONS = ['harassment', 'scam', 'inappropriate', 'other'];

/**
 * ReportUserButton — files a UserReport against a member from trade chat or a
 * public profile. Reports land in the admin moderation queue (/admin/reports).
 */
export default function ReportUserButton({ userId, tradeId }) {
  const { t } = useI18n();
  const { user } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('harassment');
  const [note, setNote] = useState('');
  const [sending, setSending] = useState(false);

  if (!user || user.id === userId) return null;

  const submit = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      await base44.entities.UserReport.create({
        reported_user_id: userId,
        reporter_id: user.id,
        trade_id: tradeId || '',
        reason,
        note: note.trim(),
        status: 'open'
      });
      setOpen(false);
      setNote('');
      setReason('harassment');
      toast({ title: t.v2?.reportSent || 'Thank you — your report has been submitted for review.' });
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        title={t.v2?.reportUser || 'Report user'}
        className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-orange-100 hover:text-orange-600"
      >
        <Flag className="h-4 w-4" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/50 p-4" onClick={() => setOpen(false)}>
          <form onSubmit={submit} onClick={(e) => e.stopPropagation()} className="w-full max-w-md rounded-2xl bg-white p-5">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">{t.v2?.reportTitle || 'Report this user'}</h3>
              <button type="button" onClick={() => setOpen(false)}><X className="h-5 w-5 text-slate-400" /></button>
            </div>
            <div className="mt-4 space-y-3">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">{t.v2?.reportReason || 'Reason'}</label>
                <select value={reason} onChange={(e) => setReason(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-sky-400">
                  {REASONS.map((r) => (
                    <option key={r} value={r}>{(t.v2?.reasons || {})[r] || r}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">{t.v2?.reportNote || 'Details (optional)'}</label>
                <textarea rows={3} value={note} onChange={(e) => setNote(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-sky-400 focus:bg-white" />
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-3">
              <button type="button" onClick={() => setOpen(false)} className="rounded-xl px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-100">{t.common.close}</button>
              <button type="submit" disabled={sending} className="rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-60">
                {sending ? t.common.loading : (t.v2?.reportSubmit || 'Submit report')}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}