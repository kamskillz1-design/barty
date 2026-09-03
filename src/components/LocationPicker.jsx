import React, { useState, useEffect } from 'react';
import { useI18n } from '@/lib/i18n';
import { useLocation } from '@/lib/LocationContext';
import { geocode } from '@/lib/geocode';
import { COUNTRIES } from '@/lib/geoData';
import { MapPin, LocateFixed, Loader2 } from 'lucide-react';
import SearchableSelect from '@/components/SearchableSelect';

/**
 * UI Location Picker — reads/writes the shared LocationContext. Selecting a
 * country/city here overrides the auto-detected area for the whole app; the
 * listings fetcher listens to that context and re-filters immediately.
 *
 * Coordinates are best-effort geocoded (OSM Nominatim) so distance ranking works
 * when available; a failed geocode degrades gracefully to hierarchy ranking.
 */
async function resolveCoords(city, country) {
  const q = [city, country].filter(Boolean).join(', ');
  if (!q) return {};
  const c = await geocode(q);
  return c ? { latitude: c.lat, longitude: c.lng } : {};
}

export default function LocationPicker() {
  const { t } = useI18n();
  const { activeArea, selectArea, resetArea, resolving } = useLocation();
  const loc = t.location || {};
  const area = activeArea || {};
  const [cityDraft, setCityDraft] = useState(area.city || '');
  const [busy, setBusy] = useState(false);

  useEffect(() => { setCityDraft(area.city || ''); }, [area.city]);

  const apply = async (next) => {
    setBusy(true);
    try {
      const coords = await resolveCoords(next.city, next.country);
      selectArea({ city: next.city || '', country: next.country || '', ...coords });
    } finally {
      setBusy(false);
    }
  };

  const areaLabel = area.city
    ? `${area.city}${area.country ? ', ' + area.country : ''}`
    : (area.country || (loc.worldwide || 'Worldwide'));

  return (
    <div className="rounded-2xl border border-sky-200 bg-sky-50/40 p-4 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2 text-sm font-semibold text-slate-700">
          <MapPin className="h-4 w-4 text-sky-600" />
          <span className="text-slate-500">{loc.showing || 'Showing'}</span>
          <span className="text-slate-900">{areaLabel}</span>
        </div>
        <button
          onClick={resetArea}
          disabled={resolving || busy}
          className="inline-flex items-center gap-1.5 rounded-xl bg-white px-3 py-1.5 text-xs font-semibold text-sky-700 shadow-sm hover:bg-sky-50 disabled:opacity-60"
        >
          {(resolving || busy) ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <LocateFixed className="h-3.5 w-3.5" />}
          {loc.useMyLocation || 'Use my location'}
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <SearchableSelect
          options={COUNTRIES}
          value={area.country || ''}
          onChange={(v) => apply({ country: v, city: area.city || '' })}
          allLabel={loc.anyCountry || 'Any country'}
          placeholder={loc.anyCountry || 'Any country'}
        />
        <input
          value={cityDraft}
          onChange={(e) => setCityDraft(e.target.value)}
          onBlur={() => { if (cityDraft.trim() !== (area.city || '')) apply({ country: area.country || '', city: cityDraft.trim() }); }}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); e.currentTarget.blur(); } }}
          placeholder={loc.anyCity || 'Any city'}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-sky-400"
        />
      </div>
    </div>
  );
}