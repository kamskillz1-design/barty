import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/api/base44Client';
import { useI18n } from '@/lib/i18n';
import ListingForm from '@/components/ListingForm';
import { ArrowLeft } from 'lucide-react';
import { withLegacyDates } from '@/lib/supabaseData';

export default function EditListing() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useI18n();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { data, error } = await supabase
          .from('listings')
          .select('*')
          .eq('id', id)
          .maybeSingle();

        if (error) {
          throw error;
        }

        setListing(withLegacyDates(data));
      } catch (error) {
        console.error('Failed to load listing for editing:', error);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleUpdate = async (data) => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('listings')
        .update(data)
        .eq('id', id);

      if (error) {
        throw error;
      }

      navigate(`/listings/${id}`);
    } catch (error) {
      console.error('Failed to update listing:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="py-20 text-center text-slate-400">{t.common.loading}</div>;
  if (!listing) return <div className="py-20 text-center text-slate-400">{t.common.empty}</div>;

  return (
    <div className="max-w-2xl mx-auto">
      <button onClick={() => navigate(-1)} className="mb-4 inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800">
        <ArrowLeft className="h-4 w-4" /> {t.listing.back}
      </button>
      <h1 className="text-2xl font-bold text-slate-900">{t.listing.edit}</h1>
      <ListingForm initialValues={listing} onSubmit={handleUpdate} saving={saving} submitLabel={t.listing.save} onCancel={() => navigate(-1)} />
    </div>
  );
}