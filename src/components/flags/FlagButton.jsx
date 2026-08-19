import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useI18n } from '@/lib/i18n';
import { useAuth } from '@/lib/AuthContext';
import { Flag, ShieldAlert, Check } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const REASONS = ['spam', 'inappropriate', 'misleading', 'other'];

export default function FlagButton({ listingId, className = '' }) {
  const { t } = useI18n();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [already, setAlready] = useState(false);

  const c = t.community?.flag || {};
  const labels = (c.reasons) || {};

  const reset = () => { setReason(''); setNote(''); setDone(false); setAlready(false); };

  const submit = async () => {
    if (!reason || !listingId) return;
    if (!user) { setOpen(false); return; }
    setSubmitting(true);
    try {
      const res = await base44.functions.invoke('submitFlag', { listing_id: listingId, reason, note });
      const data = res.data || {};
      if (data.alreadyFlagged) { setAlready(true); setDone(true); }
      else setDone(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <button
        onClick={() => user ? setOpen(true) : (window.location.href = '/login')}
        title={c.button || 'Report'}
        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-medium text-slate-400 hover:bg-slate-100 hover:text-rose-600 transition ${className}`}
      >
        <Flag className="h-3.5 w-3.5" /> {c.button || 'Report'}
      </button>

      <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setTimeout(reset, 200); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-rose-500" />
              {c.title || 'Report this listing'}
            </DialogTitle>
            <DialogDescription>{c.subtitle || ''}</DialogDescription>
          </DialogHeader>

          {done ? (
            <div className="py-6 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                <Check className="h-6 w-6" />
              </div>
              <p className="text-sm text-slate-700">
                {already ? (c.already || '') : (c.submitted || '')}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <RadioGroup value={reason} onValueChange={setReason} className="gap-2">
                {REASONS.map((r) => (
                  <div key={r} className="flex items-center gap-2.5 rounded-xl border border-slate-200 px-3 py-2.5 hover:bg-slate-50 cursor-pointer">
                    <RadioGroupItem value={r} id={`flag-${r}`} />
                    <Label htmlFor={`flag-${r}`} className="cursor-pointer text-sm font-medium text-slate-700">{labels[r] || r}</Label>
                  </div>
                ))}
              </RadioGroup>
              <Textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                placeholder={c.notePlaceholder || 'Add a note (optional)'}
                className="resize-none"
              />
            </div>
          )}

          <DialogFooter>
            {!done && (
              <button
                onClick={submit}
                disabled={!reason || submitting}
                className="inline-flex items-center gap-2 rounded-xl bg-rose-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-rose-600 disabled:opacity-50"
              >
                {submitting ? (c.submitting || 'Submitting…') : (c.submit || 'Submit report')}
              </button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}