import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useI18n } from '@/lib/i18n';
import { useAuth } from '@/lib/AuthContext';
import SearchableSelect from '@/components/SearchableSelect';
import HubsMap from '@/components/HubsMap';
import SafetyBanner from '@/components/SafetyBanner';
import { geocode, getUserLocation } from '@/lib/geocode';
import { COUNTRIES } from '@/lib/geoData';
import { Plus, MapPin, BadgeCheck, ShieldCheck, Loader2, BookOpen, Building2, Landmark, Shield, Store, X, ThumbsUp, Info } from 'lucide-react';

const SPOT_TYPE_KEYS = ['library', 'community_center', 'public_square', 'police_station', 'market', 'other'];
const TYPE_ICON = { library: BookOpen, community_center: Building2, public_square: Landmark, police_station: Shield, market: Store, other: MapPin };
const VOTE_THRESHOLD = 3;

export default function SafeSpots() {
  const { t } = useI18n();
  const { user } = useAuth();
  const [spots, setSpots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [userLoc, setUserLoc] = useState(null);
  const [locating, setLocating] = useState(false);
  const [form, setForm] = useState({ name: '', type: 'library', country: user?.country || '', city: user?.city || '', address: '' });

  const load = async () => {
    setLoading(true);
    try {
      const data = await base44.entities.SafeSpot.list('-created_date', 200);
      setSpots(data || []);
    } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const locate = async () => {
    setLocating(true);
    const loc = await getUserLocation();
    if (loc) setUserLoc(loc);
    setLocating(false);
  };
  useEffect(() => { locate(); }, []);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const query = [form.name, form.address, form.city, form.country].filter(Boolean).join(', ');
      const coords = await geocode(query);
      await base44.entities.SafeSpot.create({
        ...form,
        suggested_by_user_id: user?.id,
        verified: false,
        vote_count: 1,
        voter_ids: user?.id ? [user.id] : [],
        lat: coords?.lat,
        lng: coords?.lng
      });
      setShowForm(false);
      setForm({ name: '', type: 'library', country: user?.country || '', city: user?.city || '', address: '' });
      load();
    } finally { setSaving(false); }
  };

  const vote = async (s) => {
    if (!user?.id || (s.voter_ids || []).includes(user.id)) return;
    const voter_ids = [...(s.voter_ids || []), user.id];
    const vote_count = (s.vote_count || 0) + 1;
    const patch = { voter_ids, vote_count };
    if (vote_count >= VOTE_THRESHOLD && !s.verified) patch.verified = true;
    await base44.entities.SafeSpot.update(s.id, patch);
    load();
  };

  const inputCls = 'w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-sky-400 focus:bg-white';
  const visibleSpots = verifiedOnly ? spots.filter((s) => s.verified) : spots;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-50 text-sky-600"><ShieldCheck className="h-5 w-5" /></div>
          <h1 className="text-xl font-bold text-slate-900">{t.hubs.title}</h1>
        </div>
        <button onClick={() => setShowForm((s) => !s)} className="inline-flex items-center gap-1.5 rounded-full bg-sky-500 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-600">
          {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showForm ? t.hubs.cancel : t.hubs.suggest}
        </button>
      </div>
      <p className="text-sm text-slate-500">{t.hubs.sub}</p>

      {/* Disclaimer */}
      <div className="flex items-start gap-2.5 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-amber-800">
        <Info className="mt-0.5 h-4 w-4 shrink-0" />
        <p className="text-xs leading-snug">{t.hubs.disclaimer}</p>
      </div>

      {/* Map + controls */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <button onClick={locate} disabled={locating} className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-200 disabled:opacity-60">
            <MapPin className="h-3.5 w-3.5" /> {locating ? t.hubs.locating : t.hubs.useLocation}
          </button>
          <label className="inline-flex items-center gap-2 text-xs font-medium text-slate-700">
            <input type="checkbox" checked={verifiedOnly} onChange={(e) => setVerifiedOnly(e.target.checked)} className="h-4 w-4 accent-sky-500" />
            {t.hubs.verifiedOnly}
          </label>
        </div>
        <HubsMap spots={visibleSpots} userLocation={userLoc} />
      </div>

      {showForm && (
        <form onSubmit={submit} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">{t.hubs.name}</label>
              <input required value={form.name} onChange={(e) => set('name', e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">{t.hubs.type}</label>
              <select value={form.type} onChange={(e) => set('type', e.target.value)} className={inputCls}>
                {SPOT_TYPE_KEYS.map((k) => <option key={k} value={k}>{t.hubs.types[k]}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">{t.hubs.country}</label>
              <SearchableSelect options={COUNTRIES} value={form.country} onChange={(v) => set('country', v)} placeholder={t.hubs.country} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">{t.hubs.city}</label>
              <input required value={form.city} onChange={(e) => set('city', e.target.value)} className={inputCls} />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-slate-700">{t.hubs.address}</label>
              <input value={form.address} onChange={(e) => set('address', e.target.value)} placeholder="Bilbao Public Library" className={inputCls} />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => setShowForm(false)} className="rounded-xl px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100">{t.hubs.cancel}</button>
            <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-sky-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-sky-600 disabled:opacity-60">
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}{saving ? t.common.loading : t.hubs.save}
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="grid place-items-center py-16 text-slate-400">{t.common.loading}</div>
      ) : visibleSpots.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center text-slate-400">{t.hubs.empty}</div>
      ) : (
        <div className="space-y-3">
          <p className="text-xs text-slate-500">{t.hubs.thresholdHint}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {visibleSpots.map((s) => {
              const Icon = TYPE_ICON[s.type] || MapPin;
              const hasVoted = user && (s.voter_ids || []).includes(user.id);
              return (
                <div key={s.id} className="rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-600"><Icon className="h-5 w-5" /></div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="truncate font-semibold text-slate-900">{s.name}</h3>
                        {s.verified ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600"><BadgeCheck className="h-4 w-4" /> {t.hubs.verified}</span>
                        ) : (
                          <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-600">{t.hubs.notVerified}</span>
                        )}
                      </div>
                      <p className="mt-0.5 text-xs text-slate-500">{t.hubs.types[s.type] || s.type}</p>
                      <p className="mt-2 flex items-start gap-1 text-xs text-slate-500">
                        <MapPin className="h-3.5 w-3.5 shrink-0" />
                        {[s.address, s.city, s.country].filter(Boolean).join(', ')}
                      </p>
                      <div className="mt-3 flex items-center gap-2">
                        <button onClick={() => vote(s)} disabled={hasVoted || !user} className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${hasVoted ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'} disabled:opacity-60`}>
                          <ThumbsUp className="h-3.5 w-3.5" /> {hasVoted ? t.hubs.voted : t.hubs.vote}
                        </button>
                        <span className="text-xs text-slate-400">{s.vote_count || 0} {t.hubs.votesLabel}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <SafetyBanner />
    </div>
  );
}