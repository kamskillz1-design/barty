import React, { useState, useEffect } from 'react';
import { BadgeCheck, ShieldCheck, Clock } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useI18n } from '@/lib/i18n';
import { useAuth } from '@/lib/AuthContext';
import { VerifiedBadge } from '@/components/UserBadges';

/**
 * VerificationCard — Profile section to request the optional verified badge.
 * A request is reviewed by an admin; once approved, the verified badge shows on
 * the profile, cards and chat.
 */
export default function VerificationCard() {
  const { t } = useI18n();
  const { user } = useAuth();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!user?.id) { setLoading(false); return; }
    let alive = true;
    (async () => {
      try {
        const recs = await base44.entities.VerificationRequest.filter({ user_id: user.id }, '-created_date', 5);
        if (alive) setRequest((recs || [])[0] || null);
      } catch { /* none */ }
      finally { if (alive) setLoading(false); }
    })();
    return () => { alive = false; };
  }, [user?.id]);

  const requestVerification = async () => {
    setBusy(true);
    try {
      const rec = await base44.entities.VerificationRequest.create({
        user_id: user.id,
        method: 'email',
        status: 'pending'
      });
      setRequest(rec);
    } finally {
      setBusy(false);
    }
  };

  if (loading || !user) return null;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-center gap-2">
        <ShieldCheck className="h-5 w-5 text-sky-600" />
        <h2 className="text-lg font-bold text-slate-900">{t.v2?.verifyTitle || 'Verification'}</h2>
      </div>
      <div className="mt-3">
        {request?.status === 'approved' ? (
          <p className="flex items-center gap-2 text-sm text-emerald-700">
            <VerifiedBadge /> {t.v2?.verifyApproved || 'Your identity is verified'}
          </p>
        ) : request?.status === 'pending' ? (
          <p className="flex items-center gap-2 text-sm text-amber-700">
            <Clock className="h-4 w-4" /> {t.v2?.verifyRequested || 'Verification requested — pending review'}
          </p>
        ) : (
          <>
            {request?.status === 'rejected' && (
              <p className="mb-3 text-sm text-slate-500">{t.v2?.verifyRejected || 'Verification declined — you can request again'}</p>
            )}
            <p className="mb-3 text-sm text-slate-500">{t.v2?.verifyDesc || 'Verify your account to get a trusted badge next to your name on listings, profiles and chats.'}</p>
            <button onClick={requestVerification} disabled={busy} className="inline-flex items-center gap-2 rounded-xl bg-sky-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-sky-600 disabled:opacity-60">
              <BadgeCheck className="h-4 w-4" /> {busy ? t.common.loading : (t.v2?.verifyBtn || 'Request verification')}
            </button>
          </>
        )}
      </div>
    </div>
  );
}