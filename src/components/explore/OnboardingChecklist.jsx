import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, Circle, Rocket } from 'lucide-react';
import { supabase } from '@/api/supabaseClient';
import { useI18n } from '@/lib/i18n';
import { useAuth } from '@/lib/AuthContext';

export default function OnboardingChecklist() {
  const { t } = useI18n();
  const { user } = useAuth();

  const [hasListing, setHasListing] = useState(false);
  const [hasVerification, setHasVerification] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadProgress = async () => {
      if (!user?.id || !supabase) {
        if (isMounted) {
          setHasListing(false);
          setHasVerification(false);
          setLoading(false);
        }
        return;
      }

      setLoading(true);

      try {
        const { count: listingCount, error: listingsError } = await supabase
          .from('listings')
          .select('*', { count: 'exact', head: true })
          .eq('offering_user_id', user.id);

        if (listingsError) {
          throw listingsError;
        }

        if (isMounted) {
          setHasListing((listingCount || 0) > 0);
        }
      } catch (error) {
        console.error('Failed to check listings:', error);

        if (isMounted) {
          setHasListing(false);
        }
      }

      try {
        const { data: verificationRequests, error: verificationError } =
          await supabase
            .from('verification_requests')
            .select('status')
            .eq('user_id', user.id)
            .in('status', ['pending', 'approved'])
            .limit(1);

        if (verificationError) {
          throw verificationError;
        }

        if (isMounted) {
          setHasVerification((verificationRequests || []).length > 0);
        }
      } catch (error) {
        console.error('Failed to check verification status:', error);

        if (isMounted) {
          setHasVerification(false);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadProgress();

    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  if (loading || !user) {
    return null;
  }

  const hasLocation = Boolean(user.city || user.country);

  const steps = [
    {
      done: hasListing,
      label: t?.v2?.onboardingStep1 || 'Add your first listing',
      to: '/listings/new',
      cta: t?.listing?.new || 'Add listing',
    },
    {
      done: hasVerification,
      label: t?.v2?.onboardingStep2 || 'Get verified',
      to: '/profile',
      cta: t?.v2?.verifyBtn || 'Request verification',
    },
    {
      done: hasLocation,
      label: t?.v2?.onboardingStep3 || 'Set your location',
      to: '/profile',
      cta: t?.profile?.title || 'Profile',
    },
  ];

  if (steps.every((step) => step.done)) {
    return null;
  }

  return (
    <section className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50/60 to-white p-4 sm:p-5">
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
          <Rocket className="h-4 w-4" />
        </span>

        <h2 className="text-base font-bold text-slate-900">
          {t?.v2?.onboardingTitle || 'Welcome — get started'}
        </h2>
      </div>

      <ul className="mt-4 space-y-2">
        {steps.map((step) => (
          <li
            key={step.label}
            className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white px-3 py-2.5"
          >
            {step.done ? (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white">
                <Check className="h-3 w-3" />
              </span>
            ) : (
              <Circle className="h-5 w-5 text-slate-300" />
            )}

            <span
              className={`flex-1 text-sm ${
                step.done
                  ? 'text-slate-400 line-through'
                  : 'font-medium text-slate-800'
              }`}
            >
              {step.label}
            </span>

            {!step.done && (
              <Link
                to={step.to}
                className="rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-600"
              >
                {step.cta}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
