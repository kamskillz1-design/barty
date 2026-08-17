import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useI18n } from '@/lib/i18n';
import { useAuth } from '@/lib/AuthContext';
import ListingForm from '@/components/ListingForm';
import { ArrowLeft } from 'lucide-react';

export default function CreateListing() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);

  const initialValues = {
    title: '', description: '', intent: 'offering', type: 'good', category: 'electronics',
    country: user?.country || '', city: user?.city || '', town: '',
    baseline_value: 50, seeking_interests: [], is_seeking_anything: false,
    item_seeking_title: '', item_seeking_description: ''
  };

  const handleCreate = async (data) => {
    setSaving(true);
    try {
      await base44.entities.Listing.create({
        ...data,
        status: 'available',
        offering_user_id: user.id
      });
      navigate('/my-listings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <button onClick={() => navigate(-1)} className="mb-4 inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800">
        <ArrowLeft className="h-4 w-4" /> {t.listing.back}
      </button>
      <h1 className="text-2xl font-bold text-slate-900">{t.listing.new}</h1>
      <ListingForm initialValues={initialValues} onSubmit={handleCreate} saving={saving} submitLabel={t.listing.save} onCancel={() => navigate(-1)} />
    </div>
  );
}