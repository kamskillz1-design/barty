import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useI18n } from '@/lib/i18n';
import { useAuth } from '@/lib/AuthContext';
import SearchableSelect from '@/components/SearchableSelect';

import { COUNTRIES, LANGUAGES } from '@/lib/geoData';
import { ArrowLeft, ImagePlus, X, Save } from 'lucide-react';

const CATEGORY_KEYS = ['electronics', 'clothing', 'home', 'tools', 'books', 'toys', 'sports', 'tutoring', 'repairs', 'design', 'transport', 'cooking', 'other'];

export default function CreateListing() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: '', description: '', intent: 'offering', type: 'good', category: 'electronics',
    country: user?.country || '', city: user?.city || '', town: user?.town || '',
    language: '', baseline_value: 50, seeking_interests: []
  });
  const [imageUrls, setImageUrls] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [seekingInput, setSeekingInput] = useState('');

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    try {
      const uploaded = await Promise.all(
        files.map((file) => base44.integrations.Core.UploadFile({ file }))
      );
      setImageUrls((arr) => [...arr, ...uploaded.map((u) => u.file_url).filter(Boolean)]);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };
  const removeImage = (i) => setImageUrls((arr) => arr.filter((_, idx) => idx !== i));

  const addSeekingInterest = () => {
    const val = seekingInput.trim();
    if (!val) return;
    if (!form.seeking_interests.includes(val)) {
      set('seeking_interests', [...form.seeking_interests, val]);
    }
    setSeekingInput('');
  };
  const removeSeekingInterest = (i) =>
    set('seeking_interests', form.seeking_interests.filter((_, idx) => idx !== i));

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await base44.entities.Listing.create({
        ...form,
        baseline_value: Number(form.baseline_value) || 50,
        image_urls: imageUrls,
        status: 'available',
        offering_user_id: user.id
      });
      navigate('/my-listings');
    } finally {
      setSaving(false);
    }
  };

  const inputCls = 'w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-sky-400 focus:bg-white';

  return (
    <div className="max-w-2xl mx-auto">
      <button onClick={() => navigate(-1)} className="mb-4 inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800">
        <ArrowLeft className="h-4 w-4" /> {t.listing.back}
      </button>
      <h1 className="text-2xl font-bold text-slate-900">{t.listing.new}</h1>
      <form onSubmit={submit} className="mt-5 space-y-5 rounded-2xl border border-slate-200 bg-white p-5">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">{t.listing.title}</label>
          <input required value={form.title} onChange={(e) => set('title', e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">{t.listing.description}</label>
          <textarea required rows={4} value={form.description} onChange={(e) => set('description', e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">{t.listing.intent}</label>
          <div className="grid grid-cols-2 gap-2">
            <button type="button" onClick={() => set('intent', 'offering')} className={`rounded-xl border px-3 py-2.5 text-sm font-medium transition ${form.intent === 'offering' ? 'border-sky-400 bg-sky-50 text-sky-700' : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'}`}>
              {t.listing.offering}
            </button>
            <button type="button" onClick={() => set('intent', 'seeking')} className={`rounded-xl border px-3 py-2.5 text-sm font-medium transition ${form.intent === 'seeking' ? 'border-amber-400 bg-amber-50 text-amber-700' : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'}`}>
              {t.listing.seeking}
            </button>
          </div>
          <p className="mt-1.5 text-xs text-slate-400">{form.intent === 'seeking' ? t.listing.seekingHint : t.listing.offeringHint}</p>
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-sm font-medium text-slate-700">{t.listing.seekingField}</label>
          <div className="flex gap-2">
            <input
              value={seekingInput}
              onChange={(e) => setSeekingInput(e.target.value)}
              placeholder={t.listing.seekingPlaceholder}
              className={inputCls}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSeekingInterest(); } }}
            />
            <button type="button" onClick={addSeekingInterest} className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 px-3 text-sm font-medium text-slate-700 hover:bg-slate-200">
              {t.listing.seekingAdd}
            </button>
          </div>
          {form.seeking_interests.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {form.seeking_interests.map((s, i) => (
                <span key={s} className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700">
                  {s}
                  <button type="button" onClick={() => removeSeekingInterest(i)}><X className="h-3.5 w-3.5 text-amber-500 hover:text-rose-500" /></button>
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">{t.listing.type}</label>
            <select value={form.type} onChange={(e) => set('type', e.target.value)} className={inputCls}>
              <option value="good">{t.listing.good}</option>
              <option value="service">{t.listing.service}</option>
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">{t.listing.category}</label>
            <select value={form.category} onChange={(e) => set('category', e.target.value)} className={inputCls}>
              {CATEGORY_KEYS.map((k) => <option key={k} value={k}>{t.categories[k]}</option>)}
            </select>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">{t.listing.country}</label>
            <SearchableSelect options={COUNTRIES} value={form.country} onChange={(v) => set('country', v)} placeholder={t.listing.country} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">{t.listing.language}</label>
            <SearchableSelect options={LANGUAGES} value={form.language} onChange={(v) => set('language', v)} placeholder={t.listing.language} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">{t.listing.city}</label>
            <input value={form.city} onChange={(e) => set('city', e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">{t.listing.town}</label>
            <input value={form.town} onChange={(e) => set('town', e.target.value)} className={inputCls} />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">{t.listing.images}</label>
          <label className={`inline-flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 ${uploading ? 'opacity-60 pointer-events-none' : ''}`}>
            <ImagePlus className="h-4 w-4" />
            {uploading ? t.common.loading : t.listing.addImage}
            <input type="file" accept="image/*" multiple className="hidden" onChange={handleFileUpload} disabled={uploading} />
          </label>
          {imageUrls.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {imageUrls.map((u, i) => (
                <span key={u} className="relative inline-block h-16 w-16 overflow-hidden rounded-lg bg-slate-100">
                  <img src={u} alt="" className="h-full w-full object-cover" />
                  <button type="button" onClick={() => removeImage(i)} className="absolute end-0 top-0 flex h-5 w-5 items-center justify-center rounded-bl-lg bg-rose-500 text-white">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={() => navigate(-1)} className="rounded-xl px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100">{t.listing.cancel}</button>
          <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-sky-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-sky-600 disabled:opacity-60">
            <Save className="h-4 w-4" /> {saving ? t.common.loading : t.listing.save}
          </button>
        </div>
      </form>
    </div>
  );
}