import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useI18n } from '@/lib/i18n';
import { useAuth } from '@/lib/AuthContext';
import SafetyBanner from '@/components/SafetyBanner';
import ValueMatchIndicator from '@/components/ValueMatchIndicator';
import FlagButton from '@/components/flags/FlagButton';
import CommentsSection from '@/components/comments/CommentsSection';
import SavedButton from '@/components/SavedButton';
import OwnerBadges from '@/components/UserBadges';
import { ArrowLeft, MapPin, Wrench, Package, ArrowRight, Check, X, Pencil, Globe, ShieldAlert } from 'lucide-react';
import { Image } from '@/components/ui/image';
import { EXCHANGE_TYPES, getCategory, subcatLabel, categoryLabel } from '@/lib/categories';
import { isListingStale } from '@/lib/listingFreshness';
import { notifyTradeEvent } from '@/lib/tradeNotifications';
import { resolveUsers, buildUserMeta } from '@/lib/userMeta';

export default function ListingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useI18n();
  const { user } = useAuth();
  const [listing, setListing] = useState(null);
  const [owner, setOwner] = useState(null);
  const [ownerMeta, setOwnerMeta] = useState(null);
  const [stillConfirmed, setStillConfirmed] = useState(false);
  const [myListings, setMyListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [proposing, setProposing] = useState(false);
  const [selected, setSelected] = useState(null);
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const l = await base44.entities.Listing.get(id);
        setListing(l);
        if (l.offering_user_id) {
          try {
            const { names, reviewCounts, verifiedIds } = await resolveUsers([l.offering_user_id]);
            setOwner({ full_name: names[l.offering_user_id] || 'User' });
            setOwnerMeta(buildUserMeta([l.offering_user_id], { reviewCounts, verifiedIds })[l.offering_user_id]);
          } catch {}
        }
        if (user) {
          const mine = await base44.entities.Listing.filter({ offering_user_id: user.id, status: 'available' }, '-created_date', 100);
          setMyListings(mine || []);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [id, user]);

  const isOwner = user && listing && listing.offering_user_id === user.id;

  const submitProposal = async () => {
    if (!selected) return;
    setSending(true);
    try {
      const offered = myListings.find((m) => m.id === selected);
      const tr = await base44.entities.Trade.create({
        offered_listing_id: offered.id,
        offered_listing_title: offered.title,
        offered_listing_value: offered.baseline_value,
        requested_listing_id: listing.id,
        requested_listing_title: listing.title,
        requested_listing_value: listing.baseline_value,
        proposer_id: user.id,
        receiver_id: listing.offering_user_id,
        status: 'pending',
        proposer_completed: false,
        receiver_completed: false
      });
      // Email the owner about the new proposal (non-blocking).
      notifyTradeEvent(tr.id, 'proposal');
      setSuccess(true);
      setProposing(false);
    } finally {
      setSending(false);
    }
  };

  if (loading) return <div className="py-20 text-center text-slate-400">{t.common.loading}</div>;
  if (!listing) return <div className="py-20 text-center text-slate-400">{t.common.empty}</div>;

  // Owners of listings unconfirmed for ~60 days see a one-tap re-confirmation.
  const confirmStillAvailable = async () => {
    const now = new Date().toISOString();
    try {
      await base44.entities.Listing.update(listing.id, { last_confirmed_date: now });
      setListing((cur) => ({ ...cur, last_confirmed_date: now }));
      setStillConfirmed(true);
    } catch { /* try again later */ }
  };
  const isStale = isOwner && isListingStale(listing);

  const loc = [listing.town, listing.city, listing.country].filter(Boolean).join(', ');

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <button onClick={() => navigate(-1)} className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800">
        <ArrowLeft className="h-4 w-4" /> {t.listing.back}
      </button>

      {success && (
        <div className="flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          <Check className="h-4 w-4" /> {t.trade.title} → <Link to="/trades" className="underline">{t.trade.offered}</Link>
        </div>
      )}

      {listing.status === 'hidden' && (
        <div className="flex items-center gap-2 rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
          <ShieldAlert className="h-4 w-4" /> {t.community?.flag?.hiddenNotice || 'This listing has been hidden pending moderator review.'}
        </div>
      )}

      {isStale && (
        <div className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-900">
          <p className="font-semibold">{t.v2?.stillAvailableTitle || 'Still offering this?'}</p>
          <p className="mt-0.5 text-sky-700">{t.v2?.stillAvailableHint || 'This listing has not been confirmed in a while. Confirm it stays visible in Explore.'}</p>
          <button onClick={confirmStillAvailable} className="mt-2 rounded-xl bg-sky-500 px-4 py-2 text-xs font-semibold text-white hover:bg-sky-600">
            {stillConfirmed ? (t.v2?.stillAvailableDone || 'Thanks — confirmed as active.') : (t.v2?.stillAvailableBtn || 'Yes, still available')}
          </button>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
          <div className="aspect-square bg-slate-100">
            {listing.image_urls && listing.image_urls.length > 0 ? (
              <Image src={listing.image_urls[0]} alt={listing.title} className="h-full w-full object-cover" fittingType="fill" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-slate-300">
                {listing.have_exchange_type === 'services' ? <Wrench className="h-16 w-16" /> : <Package className="h-16 w-16" />}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-block rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-700">
                {(EXCHANGE_TYPES.find((x) => x.id === listing.have_exchange_type)?.icon || '📦')} {t.listing.haveLabel}
              </span>
              {listing.exchange_location && (
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                  <Globe className="h-3.5 w-3.5" /> {t.exchLoc[listing.exchange_location]}
                </span>
              )}
            </div>
            <div className="mt-3 flex items-start justify-between gap-2">
              <h1 className="text-2xl font-bold text-slate-900">{listing.title}</h1>
              <div className="flex shrink-0 items-center gap-2">
                {!isOwner && user && <SavedButton listing={listing} />}
                {!isOwner && <FlagButton listingId={listing.id} />}
              </div>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-slate-500">
              {listing.have_category && <span className="rounded-md bg-slate-100 px-2 py-0.5 font-medium text-slate-600">{categoryLabel(t, listing.have_category)}{listing.have_subcategory ? ` · ${subcatLabel(t, listing.have_subcategory)}` : ''}</span>}
              {loc && <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{loc}</span>}
            </div>
          </div>
          <p className="text-slate-600 leading-relaxed whitespace-pre-line">{listing.description}</p>

          {/* WANT side */}
          <div className="rounded-2xl border border-amber-200 bg-amber-50/50 px-4 py-3">
            <p className="text-[11px] font-bold uppercase tracking-wide text-amber-600">{t.listing.wantLabel}</p>
            {listing.is_open_to_anything ? (
              <p className="mt-1 text-sm font-semibold text-emerald-700">✨ {t.listing.openToAnything}</p>
            ) : (
              <>
                <p className="mt-1 text-sm font-semibold text-slate-800">
                  {listing.want_title
                    ? listing.want_title
                    : listing.want_category
                      ? `${categoryLabel(t, listing.want_category)}${listing.want_subcategory ? ` · ${subcatLabel(t, listing.want_subcategory)}` : ''}`
                      : <span className="italic text-slate-400">{t.listing.lookingFor}</span>}
                </p>
                {listing.want_description && (
                  <p className="mt-1 text-sm text-slate-600 leading-snug whitespace-pre-line">{listing.want_description}</p>
                )}
              </>
            )}
          </div>

          {listing.tags && listing.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {listing.tags.map((tg) => (
                <span key={tg} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">#{tg}</span>
              ))}
            </div>
          )}

          {owner && (
            <Link to={`/users/${listing.offering_user_id}`} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 hover:bg-slate-50 transition">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-100 text-sky-700 font-semibold">
                {(owner.full_name || '?').charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  <p className="text-sm font-semibold text-slate-900 notranslate" translate="no">{owner.full_name || '—'}</p>
                  <OwnerBadges meta={ownerMeta} />
                </div>
              </div>
            </Link>
          )}

          {isOwner ? (
            <button
              onClick={() => navigate(`/listings/${listing.id}/edit`)}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800 transition"
            >
              <Pencil className="h-4 w-4" /> {t.listing.edit}
            </button>
          ) : (
            <button
              onClick={() => (user ? setProposing(true) : navigate('/login'))}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-sky-500 px-5 py-3 text-sm font-semibold text-white hover:bg-sky-600 transition"
            >
              <ArrowRight className="h-4 w-4" /> {listing.is_open_to_anything ? t.listing.counterOffer : t.listing.proposeTrade}
            </button>
          )}
        </div>
      </div>

      <SafetyBanner />

      <CommentsSection listingId={listing.id} listingOwnerId={listing.offering_user_id} />

      {proposing && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/50 p-4" onClick={() => setProposing(false)}>
          <div className="w-full max-w-lg rounded-2xl bg-white p-5 max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">{listing.is_open_to_anything ? t.listing.counterOffer : t.listing.proposeTrade}</h3>
              <button onClick={() => setProposing(false)}><X className="h-5 w-5 text-slate-400" /></button>
            </div>
            <p className="mt-1 text-sm text-slate-500">{t.listing.valueHint}</p>
            <div className="mt-4 space-y-3">
              <p className="text-sm font-medium text-slate-700">{t.nav.myListings}:</p>
              {myListings.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-300 p-4 text-center text-sm text-slate-400">
                  {t.profile.noListings}.{' '}
                  <Link to="/listings/new" className="text-sky-600 font-medium">{t.profile.createListing}</Link>
                </div>
              ) : (
                myListings.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setSelected(m.id)}
                    className={`flex w-full items-center gap-3 rounded-xl border p-3 text-start transition ${selected === m.id ? 'border-sky-400 bg-sky-50' : 'border-slate-200 hover:bg-slate-50'}`}
                  >
                    <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                      {m.image_urls && m.image_urls[0] ? (
                        <Image src={m.image_urls[0]} alt={m.title} className="h-full w-full object-cover" fittingType="fill" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-slate-300">{m.have_exchange_type === 'services' ? <Wrench className="h-5 w-5" /> : <Package className="h-5 w-5" />}</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="truncate font-medium text-slate-900 text-sm">{m.title}</p>
                      <p className="text-xs text-slate-400">{EXCHANGE_TYPES.find((x) => x.id === m.have_exchange_type)?.icon} {m.have_exchange_type ? t.exchType[m.have_exchange_type] : ''}</p>
                    </div>
                    {selected === m.id && <Check className="h-5 w-5 text-sky-600" />}
                  </button>
                ))
              )}
            </div>

            {selected && (
              <div className="mt-4">
                <ValueMatchIndicator
                  offeredValue={myListings.find((m) => m.id === selected)?.baseline_value}
                  requestedValue={listing.baseline_value}
                />
              </div>
            )}

            <div className="mt-5 flex justify-end gap-3">
              <button onClick={() => setProposing(false)} className="rounded-xl px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100">{t.listing.cancel}</button>
              <button onClick={submitProposal} disabled={!selected || sending} className="inline-flex items-center gap-2 rounded-xl bg-sky-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-sky-600 disabled:opacity-60">
                {sending ? t.common.loading : t.listing.propose}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}