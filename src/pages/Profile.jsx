import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useI18n } from '@/lib/i18n';
import { useAuth } from '@/lib/AuthContext';
import SearchableSelect from '@/components/SearchableSelect';
import ImpactStats from '@/components/ImpactStats';
import { COUNTRIES } from '@/lib/geoData';
import { Star, Plus, MapPin } from 'lucide-react';

export default function Profile() {
  const { t, lang, setLang } = useI18n();
  const { user, logout } = useAuth();
  const [form, setForm] = useState({ preferred_language: lang, country: '', city: '', town: '', bio: '', avatar_url: '' });
  const [listings, setListings] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [reviewers, setReviewers] = useState({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!user) return;
    setForm({
      preferred_language: user.preferred_language || lang,
      country: user.country || '',
      city: user.city || '',
      town: user.town || '',
      bio: user.bio || '',
      avatar_url: user.avatar_url || ''
    });
    (async () => {
      const mine = await base44.entities.Listing.filter({ offering_user_id: user.id }, '-created_date', 100);
      setListings(mine || []);
      const revs = await base44.entities.Review.filter({ reviewee_id: user.id }, '-created_date', 50);
      setReviews(revs || []);
      const map = {};
      for (const r of (revs || [])) {
        if (r.reviewer_id && !map[r.reviewer_id]) {
          try { map[r.reviewer_id] = await base44.asServiceRole.entities.User.get(r.reviewer_id); } catch { map[r.reviewer_id] = { full_name: 'User' }; }
        }
      }
      setReviewers(map);
    })();
  }, [user]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const save = async () => {
    setSaving(true);
    try {
      await base44.auth.updateMe(form);
      setLang(form.preferred_language);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  const avgRating = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : null;
  const inputCls = 'w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-sky-400 focus:bg-white';

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div className="rounded-3xl border border-slate-200 bg-white p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-sky-100 text-2xl font-bold text-sky-700">
            {(user?.full_name || '?').charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-slate-900">{user?.full_name || '—'}</h1>
            <p className="text-sm text-slate-400">{user?.email}</p>
            {avgRating && (
              <div className="mt-1.5 flex items-center gap-1 text-xs font-medium text-amber-600">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" /> {avgRating}
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 grid sm:grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">{t.profile.country}</label>
            <SearchableSelect options={COUNTRIES} value={form.country} onChange={(v) => set('country', v)} placeholder={t.profile.country} allLabel={t.search.allLocations} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">{t.profile.city}</label>
            <input value={form.city} onChange={(e) => set('city', e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">{t.profile.town}</label>
            <input value={form.town} onChange={(e) => set('town', e.target.value)} className={inputCls} />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm font-medium text-slate-700">{t.profile.bio}</label>
            <textarea rows={2} value={form.bio} onChange={(e) => set('bio', e.target.value)} className={inputCls} />
          </div>
        </div>
        <div className="mt-5 flex items-center gap-3">
          <button onClick={save} disabled={saving} className="rounded-xl bg-sky-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-sky-600 disabled:opacity-60">
            {saving ? t.common.loading : t.profile.save}
          </button>
          {saved && <span className="text-sm text-emerald-600">✓</span>}
          <button onClick={() => logout(true)} className="ms-auto rounded-xl px-4 py-2.5 text-sm font-medium text-slate-500 hover:bg-slate-100">{t.profile.logout}</button>
        </div>
      </div>

      <ImpactStats user={user} />

      <div>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">{t.profile.myListings}</h2>
          <Link to="/listings/new" className="inline-flex items-center gap-1.5 text-sm font-semibold text-sky-600"><Plus className="h-4 w-4" /> {t.listing.new}</Link>
        </div>
        {listings.length === 0 ? (
          <p className="mt-3 rounded-2xl border border-dashed border-slate-300 bg-white py-10 text-center text-sm text-slate-400">{t.profile.noListings}</p>
        ) : (
          <div className="mt-3 space-y-2">
            {listings.map((l) => (
              <Link key={l.id} to={`/listings/${l.id}`} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 hover:bg-slate-50">
                <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-slate-100 text-lg">{l.have_exchange_type === 'services' ? '🛠️' : l.have_exchange_type === 'digital' ? '💻' : '📦'}</div>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-900">{l.title}</p>
                  <p className="text-xs text-slate-400 flex items-center gap-1"><MapPin className="h-3 w-3" />{l.city || l.country || '—'}</p>
                </div>
                <span className="text-xs text-slate-400">{l.status}</span>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="text-lg font-bold text-slate-900">{t.profile.reviews}</h2>
        {reviews.length === 0 ? (
          <p className="mt-3 rounded-2xl border border-dashed border-slate-300 bg-white py-10 text-center text-sm text-slate-400">{t.profile.noReviews}</p>
        ) : (
          <div className="mt-3 space-y-2">
            {reviews.map((r) => (
              <div key={r.id} className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-900">{reviewers[r.reviewer_id]?.full_name || 'User'}</span>
                  <span className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((n) => <Star key={n} className={`h-3.5 w-3.5 ${n <= r.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />)}
                  </span>
                </div>
                {r.comment && <p className="mt-1.5 text-sm text-slate-600">{r.comment}</p>}
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}