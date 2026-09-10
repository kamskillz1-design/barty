import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/api/supabaseClient';
import { useI18n } from '@/lib/i18n';
import { useAuth } from '@/lib/AuthContext';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { categoryLabel } from '@/lib/categories';

export default function MyListings() {
  const { t } = useI18n();
  const { user } = useAuth();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const data = await base44.entities.Listing.filter({ offering_user_id: user.id }, '-created_date', 100);
      setListings(data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (user) load(); }, [user]);

  const remove = async (id) => {
    if (!confirm('Delete this listing?')) return;
    await base44.entities.Listing.delete(id);
    load();
  };

  if (loading) return <div className="py-20 text-center text-slate-400">{t.common.loading}</div>;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">{t.nav.myListings}</h1>
        <Link to="/listings/new" className="inline-flex items-center gap-2 rounded-xl bg-sky-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-sky-600">
          <Plus className="h-4 w-4" /> {t.listing.new}
        </Link>
      </div>

      {listings.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center">
          <p className="text-slate-400">{t.profile.noListings}</p>
          <Link to="/listings/new" className="mt-3 inline-block text-sm font-semibold text-sky-600">{t.profile.createListing}</Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {listings.map((l) => (
            <div key={l.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
              <Link to={`/listings/${l.id}`} className="block">
                <div className="flex aspect-[4/3] items-center justify-center bg-slate-100 text-slate-300 text-3xl">
                  {l.have_exchange_type === 'services' ? '🛠️' : l.have_exchange_type === 'digital' ? '💻' : '📦'}
                </div>
              </Link>
              <div className="p-4">
                <Link to={`/listings/${l.id}`} className="font-semibold text-slate-900 line-clamp-1">{l.title}</Link>
                <p className="mt-1 text-xs text-slate-400">{categoryLabel(t, l.have_category)}</p>
                <div className="mt-3 flex items-center justify-between">
                  <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${l.status === 'available' ? 'bg-emerald-50 text-emerald-600' : l.status === 'reserved' ? 'bg-amber-50 text-amber-600' : 'bg-slate-100 text-slate-500'}`}>
                    {l.status}
                  </span>
                  <div className="flex gap-2">
                    <Link to={`/listings/${l.id}/edit`} className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"><Pencil className="h-4 w-4" /></Link>
                    <button onClick={() => remove(l.id)} className="rounded-lg p-1.5 text-slate-500 hover:bg-rose-50 hover:text-rose-500"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
