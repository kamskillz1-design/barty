import React, { useState, useEffect } from 'react';
import { useI18n } from '@/lib/i18n';
import { useAuth } from '@/lib/AuthContext';
import SearchableSelect from '@/components/SearchableSelect';
import { COUNTRIES } from '@/lib/geoData';
import { EXCHANGE_TYPES, categoriesForType, getCategory, EXCHANGE_LOCATIONS, subcatKey, OTHER_KEY } from '@/lib/categories';
import { ImagePlus, X, Save, ArrowLeftRight } from 'lucide-react';
import { base44 } from '@/api/base44Client';

/**
 * Reusable listing form (I Have / I Want architecture) used by CreateListing
 * and EditListing.
 * Props:
 *  - initialValues: listing object (or empty for create)
 *  - onSubmit: (data) => Promise
 *  - saving: boolean
 *  - submitLabel: string
 */
export default function ListingForm({ initialValues, onSubmit, saving, submitLabel }) {
  const { t } = useI18n();
  const { user } = useAuth();

  const [form, setForm] = useState(() => ({
    title: '', description: '',
    have_exchange_type: '',
    have_category: '',
    have_subcategory: '',
    want_exchange_type: '',
    want_category: '',
    want_subcategory: '',
    is_open_to_anything: false,
    exchange_location: 'local',
    tags: [],
    country: user?.country || '', city: user?.city || '', town: '',
    baseline_value: 50,
    ...initialValues
  }));
  const [imageUrls, setImageUrls] = useState(() => initialValues?.image_urls || []);
  const [uploading, setUploading] = useState(false);
  const [tagInput, setTagInput] = useState('');

  // Re-hydrate when initialValues change (after async load in EditListing)
  useEffect(() => {
    if (!initialValues) return;
    setForm((f) => ({
      ...f,
      ...initialValues,
      tags: initialValues.tags || [],
      is_open_to_anything: !!initialValues.is_open_to_anything,
      exchange_location: initialValues.exchange_location || 'local'
    }));
    setImageUrls(initialValues.image_urls || []);
  }, [initialValues]);

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

  const addTag = () => {
    const val = tagInput.trim();
    if (!val) return;
    if (!form.tags.includes(val)) set('tags', [...form.tags, val]);
    setTagInput('');
  };
  const removeTag = (i) => set('tags', form.tags.filter((_, idx) => idx !== i));

  const submit = async (e) => {
    e.preventDefault();
    const data = {
      ...form,
      baseline_value: Number(form.baseline_value) || 50,
      image_urls: imageUrls,
      // clear WANT side when open to anything
      want_exchange_type: form.is_open_to_anything ? '' : form.want_exchange_type,
      want_category: form.is_open_to_anything ? '' : form.want_category,
      want_subcategory: form.is_open_to_anything ? '' : form.want_subcategory
    };
    await onSubmit(data);
  };

  const inputCls = 'w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-sky-400 focus:bg-white';

  const TypeButtons = ({ value, onChange, tone }) => (
    <div className="grid grid-cols-3 gap-2">
      {EXCHANGE_TYPES.map((x) => {
        const active = value === x.id;
        const activeCls = tone === 'want'
          ? 'border-amber-400 bg-amber-50 text-amber-700'
          : 'border-sky-400 bg-sky-50 text-sky-700';
        return (
          <button
            key={x.id}
            type="button"
            onClick={() => onChange(x.id)}
            className={`flex flex-col items-center gap-1 rounded-xl border px-2 py-2.5 text-xs font-medium transition ${active ? activeCls : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
          >
            <span className="text-lg leading-none">{x.icon}</span>
            {t.exchType[x.id]}
          </button>
        );
      })}
    </div>
  );

  const SideSelector = ({ prefix, tone }) => {
    const typeVal = form[`${prefix}_exchange_type`];
    const catVal = form[`${prefix}_category`];
    const subVal = form[`${prefix}_subcategory`];
    const cats = typeVal ? categoriesForType(typeVal) : [];
    const subs = catVal ? (getCategory(catVal)?.subcategories || []) : [];

    const setType = (v) => {
      set(`${prefix}_exchange_type`, v);
      set(`${prefix}_category`, '');
      set(`${prefix}_subcategory`, '');
    };
    const setCat = (v) => { set(`${prefix}_category`, v); set(`${prefix}_subcategory`, ''); };

    return (
      <div className="space-y-3">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">{t.listing.exchangeType}</label>
          <TypeButtons value={typeVal} onChange={setType} tone={tone} />
        </div>
        {typeVal && (
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">{t.listing.category}</label>
            <select value={catVal} onChange={(e) => setCat(e.target.value)} className={inputCls}>
              <option value="">{t.listing.selectCategory}</option>
              {cats.map((c) => <option key={c.id} value={c.id}>{t.v1cat[c.id]}</option>)}
              <option value={OTHER_KEY}>{t.listing.otherCategory}</option>
            </select>
          </div>
        )}
        {catVal && (
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">{t.listing.subcategory}</label>
            <select value={subVal} onChange={(e) => set(`${prefix}_subcategory`, e.target.value)} className={inputCls}>
              <option value="">{t.listing.selectSubcategory}</option>
              {subs.map((s) => {
                const key = subcatKey(catVal, s);
                return <option key={s} value={key}>{t.v1sub?.[key] || s}</option>;
              })}
              <option value={OTHER_KEY}>{t.listing.otherSubcategory}</option>
            </select>
          </div>
        )}
      </div>
    );
  };

  return (
    <form onSubmit={submit} className="mt-5 space-y-5">
      {/* I HAVE section */}
      <section className="rounded-2xl border border-sky-200 bg-sky-50/40 p-5">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-7 items-center rounded-full bg-sky-500 px-3 text-xs font-bold text-white">{t.listing.have}</span>
          <p className="text-sm text-slate-500">{t.listing.valueHint}</p>
        </div>
        <div className="mt-4">
          <label className="mb-1.5 block text-sm font-medium text-slate-700">{t.listing.title}</label>
          <input required value={form.title} onChange={(e) => set('title', e.target.value)} className={inputCls} />
        </div>
        <div className="mt-4">
          <label className="mb-1.5 block text-sm font-medium text-slate-700">{t.listing.description}</label>
          <textarea required rows={3} value={form.description} onChange={(e) => set('description', e.target.value)} className={inputCls} />
        </div>
        <div className="mt-4"><SideSelector prefix="have" tone="have" /></div>
      </section>

      <div className="flex justify-center"><ArrowLeftRight className="h-5 w-5 text-slate-400" /></div>

      {/* I WANT section */}
      <section className="rounded-2xl border border-amber-200 bg-amber-50/40 p-5">
        <div className="flex items-center justify-between gap-2">
          <span className="inline-flex h-7 items-center rounded-full bg-amber-500 px-3 text-xs font-bold text-white">{t.listing.want}</span>
          <button type="button" onClick={() => set('is_open_to_anything', !form.is_open_to_anything)} className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition ${form.is_open_to_anything ? 'bg-emerald-500 text-white' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'}`}>
            ✨ {t.listing.openAnythingEditor}
          </button>
        </div>
        {form.is_open_to_anything ? (
          <p className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{t.listing.openAnythingEditorHint}</p>
        ) : (
          <div className="mt-4"><SideSelector prefix="want" tone="want" /></div>
        )}
      </section>

      {/* Exchange location */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <label className="mb-1.5 block text-sm font-medium text-slate-700">{t.listing.exchangeLocation} *</label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {EXCHANGE_LOCATIONS.map((l) => (
            <button key={l} type="button" onClick={() => set('exchange_location', l)} className={`rounded-xl border px-3 py-2.5 text-sm font-medium transition ${form.exchange_location === l ? 'border-sky-400 bg-sky-50 text-sky-700' : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'}`}>
              {t.exchLoc[l]}
            </button>
          ))}
        </div>
      </section>

      {/* Tags */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <label className="mb-1.5 block text-sm font-medium text-slate-700">{t.tags.label}</label>
        <div className="flex gap-2">
          <input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            placeholder={t.tags.placeholder}
            className={inputCls}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
          />
          <button type="button" onClick={addTag} className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 px-3 text-sm font-medium text-slate-700 hover:bg-slate-200">{t.tags.add}</button>
        </div>
        {form.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {form.tags.map((tag, i) => (
              <span key={tag} className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                #{tag}
                <button type="button" onClick={() => removeTag(i)}><X className="h-3.5 w-3.5 text-slate-400 hover:text-rose-500" /></button>
              </span>
            ))}
          </div>
        )}
        <p className="mt-2 text-xs text-slate-400">{t.tags.hint}</p>
      </section>

      {/* Location + images */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">{t.listing.country}</label>
            <SearchableSelect options={COUNTRIES} value={form.country} onChange={(v) => set('country', v)} placeholder={t.listing.country} />
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
      </section>

      <div className="flex justify-end gap-3 pt-1">
        <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-sky-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-sky-600 disabled:opacity-60">
          <Save className="h-4 w-4" /> {saving ? t.common.loading : submitLabel}
        </button>
      </div>
    </form>
  );
}