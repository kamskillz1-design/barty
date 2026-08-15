import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useI18n } from '@/lib/i18n';
import { useAuth } from '@/lib/AuthContext';
import SearchableSelect from '@/components/SearchableSelect';
import { COUNTRIES } from '@/lib/geoData';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ShieldCheck, Loader2 } from 'lucide-react';

/**
 * Government ID verification flow (mock integration).
 * Captures document metadata, simulates a verification handshake, persists the
 * `verified` flag on the user record, then asks the parent to refresh the auth
 * user so the verified badge reflects the new state. Swap the simulated delay
 * for a real provider webhook call without changing the surrounding contract.
 */
export default function VerifyIdDialog({ open, onOpenChange, onVerified, defaultValue }) {
  const { t } = useI18n();
  const { user } = useAuth();
  const [form, setForm] = useState({ legalName: '', docType: 'passport', docNumber: '', country: '' });
  const [ack, setAck] = useState(false);
  const [status, setStatus] = useState('idle'); // idle | verifying | error

  useEffect(() => {
    if (open) {
      setForm({
        legalName: user?.full_name || '',
        docType: 'passport',
        docNumber: '',
        country: user?.country || defaultValue || ''
      });
      setAck(false);
      setStatus('idle');
    }
  }, [open, user, defaultValue]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const canSubmit = form.legalName.trim() && form.docNumber.trim() && form.country && ack && status !== 'verifying';

  const DOC_TYPES = [
    { key: 'passport', label: t.profile.dtPassport },
    { key: 'national_id', label: t.profile.dtNationalID },
    { key: 'license', label: t.profile.dtLicense },
    { key: 'res_permit', label: t.profile.dtResPermit }
  ];

  const submit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    setStatus('verifying');
    try {
      // Mock verification handshake — replace with a secure third-party call.
      await new Promise((res) => setTimeout(res, 1200));
      await base44.auth.updateMe({ verified: true, verification_date: new Date().toISOString() });
      setStatus('success');
      if (typeof onVerified === 'function') await onVerified();
      setTimeout(() => onOpenChange(false), 1200);
    } catch {
      setStatus('error');
    }
  };

  const inputCls = 'w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-sky-400 focus:bg-white';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-50 text-sky-600">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <DialogTitle className="text-lg font-bold text-slate-900">{t.profile.verifyTitle}</DialogTitle>
          <DialogDescription className="text-sm text-slate-500">{t.profile.verifyDesc}</DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <Label className="mb-1.5 block text-sm font-medium text-slate-700">{t.profile.legalName}</Label>
            <Input value={form.legalName} onChange={(e) => set('legalName', e.target.value)} className={inputCls} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="mb-1.5 block text-sm font-medium text-slate-700">{t.profile.docType}</Label>
              <select value={form.docType} onChange={(e) => set('docType', e.target.value)} className={inputCls}>
                {DOC_TYPES.map((d) => <option key={d.key} value={d.key}>{d.label}</option>)}
              </select>
            </div>
            <div>
              <Label className="mb-1.5 block text-sm font-medium text-slate-700">{t.profile.docNumber}</Label>
              <Input value={form.docNumber} onChange={(e) => set('docNumber', e.target.value)} className={inputCls} />
            </div>
          </div>
          <div>
            <Label className="mb-1.5 block text-sm font-medium text-slate-700">{t.profile.issuingCountry}</Label>
            <SearchableSelect options={COUNTRIES} value={form.country} onChange={(v) => set('country', v)} placeholder={t.profile.issuingCountry} />
          </div>

          <label className="flex items-start gap-2.5 cursor-pointer">
            <div className="pt-0.5">
              <Checkbox id="ack" checked={ack} onCheckedChange={(c) => setAck(c === true)} />
            </div>
            <span className="text-xs leading-snug text-slate-600">{t.profile.ack}</span>
          </label>

          {status === 'error' && (
            <p className="text-xs font-medium text-rose-600">{t.profile.verifyError}</p>
          )}
          {status === 'success' && (
            <p className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600">
              <ShieldCheck className="h-4 w-4" /> {t.profile.verifySuccess}
            </p>
          )}

          <DialogFooter className="gap-2 sm:gap-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="text-sm font-medium text-slate-600 hover:bg-slate-100">
              {t.listing.cancel}
            </Button>
            <Button
              type="submit"
              disabled={!canSubmit || status === 'success'}
              className="inline-flex items-center gap-2 rounded-xl bg-sky-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-sky-600 disabled:opacity-60"
            >
              {status === 'verifying' && <Loader2 className="h-4 w-4 animate-spin" />}
              {status === 'success' ? t.profile.verifySuccess : status === 'verifying' ? t.profile.verifying : t.profile.verifyNow}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}