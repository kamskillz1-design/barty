import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useI18n } from '@/lib/i18n';
import { useAuth } from '@/lib/AuthContext';
import SafetyBanner from '@/components/SafetyBanner';
import ValueMatchIndicator from '@/components/ValueMatchIndicator';
import { ArrowLeft, MapPin, Wrench, Package, ArrowRight, Check, X } from 'lucide-react';
import { Image } from '@/components/ui/image';

export default function ListingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useI18n();
  const { user } = useAuth();
  const [listing, setListing] = useState(null);
  const [owner, setOwner] = useState(null);
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
            const u = await base44.asServiceRole.entities.User.get(l.offering_user_id);
            setOwner(u);
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
      await base44.entities.Trade.create({
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
      setSuccess(true);
      setProposing(false);
    } finally {
      setSending(false);
    }
  };

  if (loading) return <div className="py-20 text-center text-slate-400">{t.common.loading}</div>;
  if (!listing) return <div className="py-20 text-center text-slate-400">{t.common.empty}</div>;

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

      <div className="grid md:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
          <div className="aspect-square bg-slate-100">
            {listing.image_urls && listing.image_urls.length > 0 ? (
              <Image src={listing.image_urls[0]} alt={listing.title} className="h-full w-full object-cover" fittingType="fill" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-slate-300">
                {listing.type === 'service' ? <Wrench className="h-16 w-16" /> : <Package className="h-16 w-16" />}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${(listing.intent || 'offering') === 'seeking' ? 'bg-amber-100 text-amber-700' : 'bg-sky-100 text-sky-700'}`}>
                {(listing.intent || 'offering') === 'seeking' ? t.listing.seeking : t.listing.offering}
              </span>
              <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${listing.type === 'service' ? 'bg-slate-100 text-slate-600' : 'bg-slate-100 text-slate-600'}`}>
                {listing.type === 'service' ? t.listing.service : t.listing.good}
              </span>
            </div>
            <h1 className="mt-3 text-2xl font-bold text-slate-900">{listing.title}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-slate-500">
              <span className="rounded-md bg-slate-100 px-2 py-0.5 font-medium text-slate-600">{t.categories[listing.category] || listing.category}</span>
              {loc && <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{loc}</span>}
            </div>
          </div>
          <p className="text-slate-600 leading-relaxed whitespace-pre-line">{listing.description}</p>

          {owner && (
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-100 text-sky-700 font-semibold">
                {(owner.full_name || '?').charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-900">{owner.full_name || '—'}</p>
              </div>
            </div>
          )}

          {isOwner ? (
            <div className="rounded-2xl bg-slate-100 px-4 py-3 text-sm text-slate-600">{t.listing.myListing}</div>
          ) : (
            <button
              onClick={() => setProposing(true)}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-sky-500 px-5 py-3 text-sm font-semibold text-white hover:bg-sky-600 transition"
            >
              <ArrowRight className="h-4 w-4" /> {(listing.intent || 'offering') === 'seeking' ? t.listing.fulfillRequest : t.listing.proposeTrade}
            </button>
          )}
        </div>
      </div>

      <SafetyBanner />

      {proposing && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/50 p-4" onClick={() => setProposing(false)}>
          <div className="w-full max-w-lg rounded-2xl bg-white p-5 max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">{t.listing.proposeTrade}</h3>
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
                        <div className="flex h-full w-full items-center justify-center text-slate-300">{m.type === 'service' ? <Wrench className="h-5 w-5" /> : <Package className="h-5 w-5" />}</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="truncate font-medium text-slate-900 text-sm">{m.title}</p>
                      <p className="text-xs text-slate-400">{m.type === 'service' ? t.listing.service : t.listing.good}</p>
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