import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/api/supabaseClient';
import { useI18n } from '@/lib/i18n';
import { useAuth } from '@/lib/AuthContext';
import BarterCard from '@/components/BarterCard';
import SafetyBanner from '@/components/SafetyBanner';
import SearchableSelect from '@/components/SearchableSelect';
import { COUNTRIES } from '@/lib/geoData';
import {
  Search,
  Plus,
  Package,
  Scale,
  Globe2,
  Sparkles,
  SlidersHorizontal,
} from 'lucide-react';
import GlobalImpactCounter from '@/components/GlobalImpactCounter';
import LocalDiscovery from '@/components/LocalDiscovery';
import SuggestedForYou from '@/components/explore/SuggestedForYou';
import Leaderboard from '@/components/explore/Leaderboard';
import OnboardingChecklist from '@/components/explore/OnboardingChecklist';
import {
  EXCHANGE_TYPES,
  categoriesForType,
  CATEGORY_TREE,
  OTHER_KEY,
} from '@/lib/categories';
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
  const [ownerNames, setOwnerNames] = useState({});
  const [ownerMeta, setOwnerMeta] = useState({});

  const {
    country: countryFilter,
    setCountry: setCountryFilter,
    town: townFilter,
    setTown: setTownFilter,
    coords: myCoords,
  } = useDetectedLocation();

  useEffect(() => {
    let isMounted = true;

    const loadListings = async () => {
      if (!supabase) {
        if (isMounted) {
          setListings([]);
          setOwnerNames({});
          setOwnerMeta({});
          setLoading(false);
        }
        return;
      }

      setLoading(true);

      try {
        const { data, error } = await supabase
          .from('listings')
          .select('*')
          .neq('status', 'hidden')
          .order('created_at', { ascending: false })
          .limit(200);

        if (error) {
          throw error;
        }

        let visibleListings = data || [];

        if (user?.id) {
          try {
            const blockedOwners = await getBlockerIds(user.id);

            if (blockedOwners?.size) {
              visibleListings = visibleListings.filter(
                (listing) => !blockedOwners.has(listing.offering_user_id)
              );
            }
          } catch (error) {
            console.error('Failed to filter blocked users:', error);
          }
        }

        if (!isMounted) return;

        setListings(visibleListings);

        const ownerIds = [
          ...new Set(
            visibleListings
              .map((listing) => listing.offering_user_id)
              .filter(Boolean)
          ),
        ];

        if (ownerIds.length === 0) {
          setOwnerNames({});
          setOwnerMeta({});
          return;
        }

        try {
          const { names, reviewCounts, verifiedIds } = await resolveUsers(
            ownerIds
          );

          if (!isMounted) return;

          setOwnerNames(names);
          setOwnerMeta(
            buildUserMeta(ownerIds, {
              reviewCounts,
              verifiedIds,
            })
          );
        } catch (error) {
          console.error('Failed to load listing owners:', error);

          if (!isMounted) return;

          setOwnerNames({});
          setOwnerMeta({});
        }
      } catch (error) {
        console.error('Failed to load listings:', error);

        if (!isMounted) return;

        setListings([]);
        setOwnerNames({});
        setOwnerMeta({});
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadListings();

    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  const filtered = useMemo(
    () =>
      filterAndRankListings(listings, {
        q,
        category,
        exchType,
        countryFilter,
        townFilter,
        myCoords,
      }),
    [listings, q, category, exchType, countryFilter, townFilter, myCoords]
  );

  return (
    <div className="space-y-7">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-sky-500 via-sky-400 to-cyan-400 px-6 py-8 text-white shadow-lg shadow-sky-200 sm:px-10 sm:py-12">
        <div className="absolute -top-10 -end-10 h-40 w-40 rounded-full bg-white/10" />
        <div className="absolute -bottom-12 start-10 h-32 w-32 rounded-full bg-white/10" />

        <div className="relative max-w-2xl">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur">
            <Sparkles className="h-3.5 w-3.5" />
            {t.appName}
          </div>

          <h1 className="mt-3 text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
            {t.landing.hero}
          </h1>

          <p className="mt-3 max-w-xl text-sm text-white/90 sm:text-base">
            {t.landing.sub}
          </p>

          <button
            type="button"
            onClick={() => navigate('/listings/new')}
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-sky-700 shadow-sm transition hover:bg-sky-50"
          >
            <Plus className="h-4 w-4" />
            {t.listing.new}
          </button>
        </div>
      </section>

      <GlobalImpactCounter />

      <div className="grid gap-3 sm:grid-cols-3">
        <Feature
          icon={Package}
          title={t.landing.feature1}
          desc={t.landing.feature1d}
        />
        <Feature
          icon={Scale}
          title={t.landing.feature2}
          desc={t.landing.feature2d}
        />
        <Feature
          icon={Globe2}
          title={t.landing.feature3}
          desc={t.landing.feature3d}
        />
      </div>

      <SafetyBanner />

      <OnboardingChecklist />

      <SuggestedForYou
        listings={listings}
        ownerNames={ownerNames}
        ownerMeta={ownerMeta}
      />

      <Leaderboard />

      <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4">
        <div className="flex items-center gap-2 text-slate-700">
          <SlidersHorizontal className="h-4 w-4 text-sky-600" />
          <span className="text-sm font-semibold">{t.search.search}</span>
        </div>

        <div className="relative">
          <Search className="absolute top-1/2 start-3 h-4 w-4 -translate-y-1/2 text-slate-400" />

          <input
            value={q}
            onChange={(event) => setQ(event.target.value)}
            placeholder={t.search.placeholder}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 ps-9 pe-3 text-sm outline-none focus:border-sky-400 focus:bg-white"
          />
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          <select
            value={exchType}
            onChange={(event) => {
              setExchType(event.target.value);
              setCategory('');
            }}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-sky-400"
          >
            <option value="">
              {t.listing.exchangeType}: {t.search.allTypes}
            </option>

            {EXCHANGE_TYPES.map((type) => (
              <option key={type.id} value={type.id}>
                {type.icon} {t.exchType[type.id]}
              </option>
            ))}
          </select>

          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-sky-400"
          >
            <option value="">{t.search.allCategories}</option>

            {(exchType
              ? categoriesForType(exchType)
              : CATEGORY_TREE
            ).map((item) => (
              <option key={item.id} value={item.id}>
                {t.v1cat[item.id]}
              </option>
            ))}

            <option value={OTHER_KEY}>{t.listing.otherCategory}</option>
          </select>

          <SearchableSelect
            options={COUNTRIES}
            value={countryFilter}
            onChange={setCountryFilter}
            allLabel={t.search.allLocations}
            placeholder={t.search.allLocations}
          />

          <input
            value={townFilter}
            onChange={(event) => setTownFilter(event.target.value)}
            placeholder={t.search.anyTown}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-sky-400 focus:bg-white"
          />
        </div>
      </div>

      <LocalDiscovery listings={listings} user={user} />

      {loading ? (
        <div className="grid place-items-center py-20 text-slate-400">
          {t.common.loading}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center text-slate-400">
          {t.common.empty}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((listing) => (
            <BarterCard
              key={listing.id}
              listing={listing}
              ownerName={ownerNames[listing.offering_user_id]}
              ownerMeta={ownerMeta[listing.offering_user_id]}
            />
          ))}
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

      <p className="mt-1 text-sm leading-snug text-slate-500">{desc}</p>
    </div>
  );
}
