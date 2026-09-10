import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/api/base44Client';
import { useI18n } from '@/lib/i18n';
import { useAuth } from '@/lib/AuthContext';
import { Star, MapPin, Package, ShieldX, Unlock } from 'lucide-react';
import { Image } from '@/components/ui/image';
import { categoryLabel, subcatLabel } from '@/lib/categories';
import ReviewsList from '@/components/reviews/ReviewsList';
import ReportUserButton from '@/components/report/ReportUserButton';
import { VerifiedBadge } from '@/components/UserBadges';
import { getBlockState, blockUser as blockUserOp, unblockUser as unblockUserOp } from '@/lib/userBlocks';
import { resolveUsers } from '@/lib/userMeta';
import { withLegacyDatesList } from '@/lib/supabaseData';

export default function PublicProfile() {
  const { id } = useParams();
  const { t } = useI18n();
  const { user: viewer } = useAuth();
  const [user, setUser] = useState(null);
  const [listings, setListings] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('listings');
  const [blockByMe, setBlockByMe] = useState(false);
  const [blockByOther, setBlockByOther] = useState(false);
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        try {
          const [{ data: profile, error: profileError }, { data: mine, error: listingsError }, { data: revs, error: reviewsError }, { data: vr, error: verificationError }, nameData] = await Promise.all([
            supabase
              .from('profiles')
              .select('id, full_name, city, country, bio')
              .eq('id', id)
              .maybeSingle(),
            supabase
              .from('listings')
              .select('*')
              .eq('offering_user_id', id)
              .eq('status', 'available')
              .order('created_at', { ascending: false })
              .limit(50),
            supabase
              .from('reviews')
              .select('*')
              .eq('reviewee_id', id)
              .order('created_at', { ascending: false })
              .limit(50),
            supabase
              .from('verification_requests')
              .select('id')
              .eq('user_id', id)
              .eq('status', 'approved')
              .limit(1)
              .maybeSingle(),
            resolveUsers([id]).catch(() => ({ names: {} }))
          ]);

          if (profileError) {
            throw profileError;
          }

          if (listingsError) {
            throw listingsError;
          }

          if (reviewsError) {
            throw reviewsError;
          }

          if (verificationError) {
            throw verificationError;
          }

          const fallbackName = nameData.names[id] || '';
          setUser(
            profile
              ? { ...profile, full_name: profile.full_name || fallbackName }
              : (fallbackName || mine?.length || revs?.length || vr
                ? {
                    id,
                    full_name: fallbackName,
                    city: '',
                    country: '',
                    bio: ''
                  }
                : null)
          );
          setListings(withLegacyDatesList(mine));
          setReviews(withLegacyDatesList(revs));
          setVerified(Boolean(vr));
        } catch (error) {
          console.error('Failed to load public profile:', error);
        }

        if (viewer?.id && viewer.id !== id) {
          try {
            const state = await getBlockState(viewer.id, id);
            setBlockByMe(state.blockByMe);
            setBlockByOther(state.blockByOther);
          } catch { /* ignore */ }
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [id, viewer?.id]);

  const c = t.community?.reviews || {};
  const avg = reviews.length ? (reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length).toFixed(1) : null;
  const initial = (user?.full_name || '?').charAt(0).toUpperCase();

  const blockUser = async () => {
    try { await blockUserOp(viewer.id, id); setBlockByMe(true); }
    catch { /* already blocked */ }
  };
  const unblockUser = async () => {
    try { await unblockUserOp(viewer.id, id); setBlockByMe(false); }
    catch { /* ignore */ }
  };

  if (loading) return <div className="py-20 text-center text-slate-400">{t.common.loading}</div>;
  if (!user) return <div className="py-20 text-center text-slate-400">{t.common.empty}</div>;
  if (blockByOther) return <div className="py-20 text-center text-slate-400">{t.call.profileUnavailable}</div>;

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div className="rounded-3xl border border-slate-200 bg-white p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-sky-100 text-2xl font-bold text-sky-700">
            {initial}
          </div>
          <div className="flex-1">
            <h1 className="flex flex-wrap items-center gap-2 text-xl font-bold text-slate-900">
              <span className="notranslate" translate="no">{user.full_name || '—'}</span>
              {verified && <VerifiedBadge />}
            </h1>
            {user.city && <p className="mt-1 flex items-center gap-1 text-sm text-slate-500"><MapPin className="h-3.5 w-3.5" />{user.city}{user.country ? `, ${user.country}` : ''}</p>}
            {avg && (
              <div className="mt-1.5 flex items-center gap-1 text-sm font-medium text-amber-600">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" /> {avg}
                <span className="text-xs text-slate-400">({reviews.length})</span>
              </div>
            )}
          </div>
          {viewer?.id && viewer.id !== id && (
            <ReportUserButton userId={id} />
          )}
          {viewer?.id && viewer.id !== id && (
            blockByMe ? (
              <button onClick={unblockUser} className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200">
                <Unlock className="h-3.5 w-3.5" /> {t.call.unblock}
              </button>
            ) : (
              <button onClick={blockUser} className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200">
                <ShieldX className="h-3.5 w-3.5" /> {t.call.blockUser}
              </button>
            )
          )}
        </div>
        {user.bio && <p className="mt-4 text-sm text-slate-600 leading-relaxed whitespace-pre-line">{user.bio}</p>}
      </div>

      <div className="flex gap-2 rounded-2xl border border-slate-200 bg-white p-1.5">
        <button
          onClick={() => setTab('listings')}
          className={`flex-1 rounded-xl px-4 py-2 text-sm font-semibold transition ${tab === 'listings' ? 'bg-sky-500 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
        >
          {c.listings || t.profile.myListings} ({listings.length})
        </button>
        <button
          onClick={() => setTab('reviews')}
          className={`flex-1 rounded-xl px-4 py-2 text-sm font-semibold transition ${tab === 'reviews' ? 'bg-sky-500 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
        >
          {c.reviewsTab || c.title || t.profile.reviews} ({reviews.length})
        </button>
      </div>

      {tab === 'listings' ? (
        listings.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-slate-300 bg-white py-10 text-center text-sm text-slate-400">{t.profile.noListings}</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {listings.map((l) => (
              <Link key={l.id} to={`/listings/${l.id}`} className="flex gap-3 rounded-xl border border-slate-200 bg-white p-3 hover:bg-slate-50 transition">
                <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                  {l.image_urls && l.image_urls[0] ? (
                    <Image src={l.image_urls[0]} alt={l.title} className="h-full w-full object-cover" fittingType="fill" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-slate-300"><Package className="h-5 w-5" /></div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-900">{l.title}</p>
                  <p className="text-xs text-slate-400">{l.have_category ? categoryLabel(t, l.have_category) : ''}{l.have_subcategory ? ` · ${subcatLabel(t, l.have_subcategory)}` : ''}</p>
                  <p className="mt-0.5 text-xs text-slate-400 flex items-center gap-1"><MapPin className="h-3 w-3" />{l.city || l.country || '—'}</p>
                </div>
              </Link>
            ))}
          </div>
        )
      ) : (
        <ReviewsList userId={id} />
      )}
    </div>
  );
}