import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Check, Circle, Rocket } from 'lucide-react';
import { supabase } from '@/api/supabaseClient';
import { useI18n } from '@/lib/i18n';
import { useAuth } from '@/lib/AuthContext';

/**
 * OnboardingChecklist — guided first steps for members who haven't settled in
 * yet: add a first listing, request verification, set a location. Each step
 * derives its done-state from live data; the card disappears once complete.
 */
export default function OnboardingChecklist() {
  const { t } = useI18n();
  const { user } = useAuth();
  const [hasListing, setHasListing] = useState(false);
  const [hasVerification, setHasVerification] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) { setLoading(false); return; }
    let alive = true;
    (async () => {
      try {
        const mine = await base44.entities.Listing.filter({ offering_user_id: user.id }, '-created_date', 1);
        if (alive) setHasListing((mine || []).length > 0);
      } catch { /* treat as no listing */ }
      try {
        const vr = await base44.entities.VerificationRequest.filter({ user_id: user.id });
        if (alive) setHasVerification((vr || []).some((r) => r.status === 'pending' || r.status === 'approved'));
      } catch { /* treat as not requested */ }
      if (alive) setLoading(false);
    })();
    return () => { alive = false; };
  }, [user?.id]);

  if (loading || !user) return null;

  const hasLocation = !!(user.city || user.country);
  const steps = [
    { done: hasListing, label: t.v2?.onboardingStep1 || 'Add your first listing', to: '/listings/new', cta: t.listing.new },
    { done: hasVerification, label: t.v2?.onboardingStep2 || 'Get verified', to: '/profile', cta: t.v2?.verifyBtn || 'Request verification' },
    { done: hasLocation, label: t.v2?.onboardingStep3 || 'Set your location', to: '/profile', cta: t.profile.title }
  ];
  if (steps.every((s) => s.done)) return null;

  return (
    <section className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50/60 to-white p-4 sm:p-5">
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-600"><Rocket className="h-4 w-4" /></span>
        <h2 className="text-base font-bold text-slate-900">{t.v2?.onboardingTitle || 'Welcome — get started'}</h2>
      </div>
      <ul className="mt-4 space-y-2">
        {steps.map((s) => (
          <li key={s.label} className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white px-3 py-2.5">
            {s.done
              ? <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white"><Check className="h-3 w-3" /></span>
              : <Circle className="h-5 w-5 text-slate-300" />}
            <span className={`flex-1 text-sm ${s.done ? 'text-slate-400 line-through' : 'font-medium text-slate-800'}`}>{s.label}</span>
            {!s.done && (
              <Link to={s.to} className="rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-600">{s.cta}</Link>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
