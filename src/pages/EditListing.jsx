import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/api/supabaseClient';
import { useI18n } from '@/lib/i18n';
import ListingForm from '@/components/ListingForm';
import { ArrowLeft } from 'lucide-react';

export default function EditListing() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useI18n();

  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let cancelled = false;

    const loadListing = async () => {
      if (!id) {
        if (!cancelled) {
          setErrorMessage('Listing ID is missing.');
          setLoading(false);
        }
        return;
      }

      try {
        const { data, error } = await supabase
          .from('listings')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;

        if (!cancelled) {
          setListing(data);
        }
      } catch (error) {
        console.error('Failed to load listing:', error);

        if (!cancelled) {
          setErrorMessage(
            error?.message || 'Unable to load this listing.'
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadListing();

    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleUpdate = async (formData) => {
    if (!id) return;

    setSaving(true);
    setErrorMessage('');

    try {
      const { data, error } = await supabase
        .from('listings')
        .update(formData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      navigate(`/listings/${data.id}`);
    } catch (error) {
      console.error('Failed to update listing:', error);

      setErrorMessage(
        error?.message || 'Unable to save changes. Please try again.'
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-400">
        {t.common.loading}
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="mx-auto max-w-2xl py-20 text-center">
        <p className="text-sm text-rose-600">{errorMessage}</p>

        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mt-4 inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800"
        >
          <ArrowLeft className="h-4 w-4" />
          {t.listing.back}
        </button>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="py-20 text-center text-slate-400">
        {t.common.empty}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800"
      >
        <ArrowLeft className="h-4 w-4" />
        {t.listing.back}
      </button>

      <h1 className="text-2xl font-bold text-slate-900">
        {t.listing.edit}
      </h1>

      <ListingForm
        initialValues={listing}
        onSubmit={handleUpdate}
        saving={saving}
        submitLabel={t.listing.save}
        onCancel={() => navigate(-1)}
      />
    </div>
  );
}
