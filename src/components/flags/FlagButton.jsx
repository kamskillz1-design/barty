import React, { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useI18n } from '@/lib/i18n';
import { useAuth } from '@/lib/AuthContext';
import { Flag, ShieldAlert, Check } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
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
  const [errorMessage, setErrorMessage] = useState('');

  const c = t.community?.flag || {};
  const labels = c.reasons || {};

  const reset = () => {
    setReason('');
    setNote('');
    setDone(false);
    setAlready(false);
    setErrorMessage('');
  };

  const handleOpenChange = (nextOpen) => {
    setOpen(nextOpen);

    if (!nextOpen) {
      window.setTimeout(reset, 200);
    }
  };

  const submit = async () => {
    if (!reason || !listingId || !user) return;

    setSubmitting(true);
    setErrorMessage('');

    try {
      const { data: existingFlag, error: checkError } = await supabase
        .from('flags')
        .select('id')
        .eq('listing_id', listingId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (checkError) throw checkError;

      if (existingFlag) {
        setAlready(true);
        setDone(true);
        return;
      }

      const { error: insertError } = await supabase
        .from('flags')
        .insert({
          listing_id: listingId,
          user_id: user.id,
          reason,
          note: note.trim() || null,
        });

      if (insertError) throw insertError;

      setDone(true);
    } catch (error) {
      console.error('Failed to submit listing flag:', error);
      setErrorMessage(
        error.message || c.error || 'Unable to submit report. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => {
          if (user) {
            setOpen(true);
          } else {
            window.location.href = '/login';
          }
        }}
        title={c.button || 'Report'}
        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-medium text-slate-400 transition hover:bg-slate-100 hover:text-rose-600 ${className}`}
      >
        <Flag className="h-3.5 w-3.5" />
        {c.button || 'Report'}
      </button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-rose-500" />
              {c.title || 'Report this listing'}
            </DialogTitle>
            <DialogDescription>
              {c.subtitle || 'Tell us why this listing should be reviewed.'}
            </DialogDescription>
          </DialogHeader>

          {done ? (
            <div className="py-6 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                <Check className="h-6 w-6" />
              </div>

              <p className="text-sm text-slate-700">
                {already
                  ? c.already || 'You have already reported this listing.'
                  : c.submitted || 'Thank you. Your report has been submitted.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <RadioGroup
                value={reason}
                onValueChange={setReason}
                className="gap-2"
              >
                {REASONS.map((item) => (
                  <div
                    key={item}
                    className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-slate-200 px-3 py-2.5 hover:bg-slate-50"
                  >
                    <RadioGroupItem value={item} id={`flag-${item}`} />
                    <Label
                      htmlFor={`flag-${item}`}
                      className="cursor-pointer text-sm font-medium text-slate-700"
                    >
                      {labels[item] || item}
                    </Label>
                  </div>
                ))}
              </RadioGroup>

              <Textarea
                value={note}
                onChange={(event) => setNote(event.target.value)}
                rows={3}
                maxLength={500}
                placeholder={c.notePlaceholder || 'Add a note (optional)'}
                className="resize-none"
              />

              {errorMessage && (
                <p className="text-sm text-rose-600">{errorMessage}</p>
              )}
            </div>
          )}

          <DialogFooter>
            {!done && (
              <button
                type="button"
                onClick={submit}
                disabled={!reason || submitting}
                className="inline-flex items-center gap-2 rounded-xl bg-rose-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting
                  ? c.submitting || 'Submitting…'
                  : c.submit || 'Submit report'}
              </button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
