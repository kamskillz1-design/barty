import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
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

  useEffect(() => {
    (async () => {
      try {
        const l = await base44.entities.Listing.get(id);
        setListing(l);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleUpdate = async (data) => {
    setSaving(true);
    try {
      await base44.entities.Listing.update(id, data);
      navigate(`/listings/${id}`);
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