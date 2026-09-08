import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useI18n } from '@/lib/i18n';
import { useAuth } from '@/lib/AuthContext';
import BarterCard from '@/components/BarterCard';
import SafetyBanner from '@/components/SafetyBanner';
import SearchableSelect from '@/components/SearchableSelect';
import { COUNTRIES } from '@/lib/geoData';
import { Search, Plus, Package, Scale, Globe2, Sparkles, SlidersHorizontal } from 'lucide-react';
import GlobalImpactCounter from '@/components/GlobalImpactCounter';
import LocalDiscovery from '@/components/LocalDiscovery';
import SuggestedForYou from '@/components/explore/SuggestedForYou';
import Leaderboard from '@/components/explore/Leaderboard';
import OnboardingChecklist from '@/components/explore/OnboardingChecklist';
import { approxDistanceKm } from '@/lib/matching';
import { EXCHANGE_TYPES, categoriesForType, CATEGORY_TREE, OTHER_KEY } from '@/lib/categories';
import { getUserLocation, reverseGeocode } from '@/lib/geocode';

const SESSION_KEY = 'ibarti_explore_loc';

export default function Explore() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [exchType, setExchType] = useState('');
  const [category, setCategory] = useState('');
  const [countryFilter, setCountryFilter] = useState('');
  const [townFilter, setTownFilter] = useState('');
  const [ownerNames, setOwnerNames] = useState({});
  const [ownerMeta, setOwnerMeta] = useState({});
  const [myCoords, setMyCoords] = useState(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await base44.entities.Listing.list('-created_date', 200);
        let visible = (data || []).filter((l) => l.status !== 'hidden');
        // Hide listings from owners who blocked the current viewer (one-directional).
        if (user?.id) {
          try {
            const bl = await base44.entities.UserBlock.filter({ blocked_id: user.id, active: true });
            const blockedOwners = new Set((bl || []).map((b) => b.blocker_id).filter(Boolean));
            if (blockedOwners.size) visible = visible.filter((l) => !blockedOwners.has(l.offering_user_id));
          } catch { /* ignore */ }
        }
        setListings(visible);
        const ids = [...new Set(visible.map((l) => l.offering_user_id).filter(Boolean))];
        if (ids.length) {
          try {
            const res = await base44.functions.invoke('resolveUserNames', { ids });
            const names = res?.data?.names || res?.names || {};
            const reviewCounts = res?.data?.reviewCounts || res?.reviewCounts || {};
            const verifiedIds = res?.data?.verified || res?.verified || [];
            setOwnerNames(names);
            const meta = {};
            ids.forEach((uid) => { meta[uid] = { reviewCount: reviewCounts[uid] ?? 0, verified: verifiedIds.includes(uid) }; });
            setOwnerMeta(meta);
          } catch { /* keep generic fallback labels */ }
        }
      } finally {
        setLoading(false);
      }
    })();

    // Auto-detect location once per session and pre-fill filters.
    (async () => {
      let loc = null;
      try { loc = JSON.parse(sessionStorage.getItem(SESSION_KEY) || 'null'); } catch { /* ignore */ }
      if (!loc) {
        const coords = await getUserLocation();
        if (coords) {
          const rev = await reverseGeocode(coords[0], coords[1]);
          if (rev && (rev.country || rev.city)) {
            loc = { ...rev, lat: coords[0], lng: coords[1] };
            try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(loc)); } catch { /* ignore */ }
          }
        }
      }
      if (loc) {
        if (loc.country) setCountryFilter(loc.country);
        if (loc.city) setTownFilter(loc.city);
        if (typeof loc.lat === 'number' && typeof loc.lng === 'number') setMyCoords([loc.lat, loc.lng]);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    const ql = q.trim().toLowerCase();
    const tl = townFilter.trim().toLowerCase();
    const base = listings.filter((l) => {
      if (l.status === 'traded') return false;
      if (ql && !(`${l.title || ''} ${l.description || ''} ${(l.tags || []).join(' ')}`.toLowerCase().includes(ql))) return false;
      const isOnline = l.exchange_location === 'online';
      if (category && l.have_category !== category) return false;
      if (exchType && l.have_exchange_type !== exchType) return false;
      // Online listings bypass the local-area filters so they remain available as
      // fallback even when a city/country has been auto-detected.
      if (!isOnline) {
        if (countryFilter && (l.country || '').toLowerCase() !== countryFilter.toLowerCase()) return false;
        if (tl && !(`${l.town || ''} ${l.city || ''}`).toLowerCase().includes(tl)) return false;
      }
      return true;
    });
    // Order: city matches first, then same-country, then online listings, then the rest.
    // Within a tier, nearest first when coordinates are known; listings whose
    // owner hasn't confirmed them in ~60 days are demoted to the bottom.
    const cl = tl;
    const cf = countryFilter.trim().toLowerCase();
    const STALE_MS = 60 * 24 * 60 * 60 * 1000;
    const isStale = (l) => {
      const c = l.last_confirmed_date ? new Date(l.last_confirmed_date).getTime() : 0;
      return !c || Date.now() - c > STALE_MS;
    };
    const dist = (l) => (myCoords && typeof l.lat === 'number' && typeof l.lng === 'number')
      ? approxDistanceKm(myCoords[0], myCoords[1], l.lat, l.lng)
      : Infinity;
    const rank = (l) => {
      let r;
      if (cl && (`${l.town || ''} ${l.city || ''}`).toLowerCase().includes(cl)) r = 0;
      else if (cf && (l.country || '').toLowerCase() === cf) r = 1;
      else if (l.exchange_location === 'online') r = 2;
      else r = 3;
      return isStale(l) ? r + 4 : r;
    };
    return [...base].sort((a, b) => (rank(a) - rank(b)) || (dist(a) - dist(b)));
  }, [listings, q, category, exchType, countryFilter, townFilter, myCoords]);

  return (
    <div className="space-y-7">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-sky-500 via-sky-400 to-cyan-400 px-6 py-8 sm:px-10 sm:py-12 text-white shadow-lg shadow-sky-200">
        <div className="absolute -top-10 -end-10 h-40 w-40 rounded-full bg-white/10" />
        <div className="absolute -bottom-12 start-10 h-32 w-32 rounded-full bg-white/10" />
        <div className="relative max-w-2xl">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur">
            <Sparkles className="h-3.5 w-3.5" /> {t.appName}
          </div>
          <h1 className="mt-3 text-3xl sm:text-4xl font-bold leading-tight tracking-tight">{t.landing.hero}</h1>
          <p className="mt-3 text-sm sm:text-base text-white/90 max-w-xl">{t.landing.sub}</p>
          <button
            onClick={() => navigate('/listings/new')}
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-sky-700 shadow-sm hover:bg-sky-50 transition"
          >
            <Plus className="h-4 w-4" /> {t.listing.new}
          </button>
        </div>
      </section>

      <GlobalImpactCounter />

      <div className="grid sm:grid-cols-3 gap-3">
        <Feature icon={Package} title={t.landing.feature1} desc={t.landing.feature1d} />
        <Feature icon={Scale} title={t.landing.feature2} desc={t.landing.feature2d} />
        <Feature icon={Globe2} title={t.landing.feature3} desc={t.landing.feature3d} />
      </div>

      <SafetyBanner />

      <OnboardingChecklist />
      <SuggestedForYou listings={listings} ownerNames={ownerNames} ownerMeta={ownerMeta} />
      <Leaderboard />

      {/* Filters */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3">
        <div className="flex items-center gap-2 text-slate-700">
          <SlidersHorizontal className="h-4 w-4 text-sky-600" />
          <span className="text-sm font-semibold">{t.search.search}</span>
        </div>
        <div className="relative">
          <Search className="absolute top-1/2 -translate-y-1/2 start-3 h-4 w-4 text-slate-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t.search.placeholder}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 ps-9 pe-3 py-2.5 text-sm outline-none focus:border-sky-400 focus:bg-white"
          />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          <select value={exchType} onChange={(e) => { setExchType(e.target.value); setCategory(''); }} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-sky-400">
            <option value="">{t.listing.exchangeType}: {t.search.allTypes}</option>
            {EXCHANGE_TYPES.map((x) => <option key={x.id} value={x.id}>{x.icon} {t.exchType[x.id]}</option>)}
          </select>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-sky-400">
            <option value="">{t.search.allCategories}</option>
            {(exchType ? categoriesForType(exchType) : CATEGORY_TREE).map((c) => <option key={c.id} value={c.id}>{t.v1cat[c.id]}</option>)}
            <option value={OTHER_KEY}>{t.listing.otherCategory}</option>
          </select>
          <SearchableSelect options={COUNTRIES} value={countryFilter} onChange={setCountryFilter} allLabel={t.search.allLocations} placeholder={t.search.allLocations} />
          <input value={townFilter} onChange={(e) => setTownFilter(e.target.value)} placeholder={t.search.anyTown} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-sky-400 focus:bg-white" />
        </div>
      </div>

      {/* Local discovery */}
      <LocalDiscovery listings={listings} user={user} />

      {/* Grid */}
      {loading ? (
        <div className="grid place-items-center py-20 text-slate-400">{t.common.loading}</div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center text-slate-400">
          {t.common.empty}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((l) => <BarterCard key={l.id} listing={l} ownerName={ownerNames[l.offering_user_id]} ownerMeta={ownerMeta[l.offering_user_id]} />)}
        </div>
      )}
    </div>
  );
}

function Feature({ icon: Icon, title, desc }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="mt-3 font-semibold text-slate-900">{title}</h3>
      <p className="mt-1 text-sm text-slate-500 leading-snug">{desc}</p>
    </div>
  );
}