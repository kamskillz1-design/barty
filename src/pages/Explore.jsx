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
import { EXCHANGE_TYPES, categoriesForType, CATEGORY_TREE, OTHER_KEY } from '@/lib/categories';
import { filterAndRankListings } from '@/lib/exploreRanking';
import { resolveUsers, buildUserMeta } from '@/lib/userMeta';
import { getBlockerIds } from '@/lib/userBlocks';
import useDetectedLocation from '@/hooks/useDetectedLocation';

export default function Explore() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [exchType, setExchType] = useState('');
  const [category, setCategory] = useState('');
  const { country: countryFilter, setCountry: setCountryFilter, town: townFilter, setTown: setTownFilter, coords: myCoords } = useDetectedLocation();
  const [ownerNames, setOwnerNames] = useState({});
  const [ownerMeta, setOwnerMeta] = useState({});

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await base44.entities.Listing.list('-created_date', 200);
        let visible = (data || []).filter((l) => l.status !== 'hidden');
        // Hide listings from owners who blocked the current viewer (one-directional).
        if (user?.id) {
          try {
            const blockedOwners = await getBlockerIds(user.id);
            if (blockedOwners.size) visible = visible.filter((l) => !blockedOwners.has(l.offering_user_id));
          } catch { /* ignore */ }
        }
        setListings(visible);
        const ids = [...new Set(visible.map((l) => l.offering_user_id).filter(Boolean))];
        if (ids.length) {
          try {
            const { names, reviewCounts, verifiedIds } = await resolveUsers(ids);
            setOwnerNames(names);
            setOwnerMeta(buildUserMeta(ids, { reviewCounts, verifiedIds }));
          } catch { /* keep generic fallback labels */ }
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(
    () => filterAndRankListings(listings, { q, category, exchType, countryFilter, townFilter, myCoords }),
    [listings, q, category, exchType, countryFilter, townFilter, myCoords]
  );

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