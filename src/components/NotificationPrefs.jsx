import React, { useState, useEffect } from 'react';
import { Bell, BellOff } from 'lucide-react';
import { supabase } from '@/api/base44Client';
import { useI18n } from '@/lib/i18n';
import { useAuth } from '@/lib/AuthContext';

/**
 * NotificationPrefs — Profile toggle for trade activity emails (proposals,
 * messages, counter-offers, completion nudges). Defaults to on; the preference
 * record only exists once the user touches the toggle.
 */
export default function NotificationPrefs() {
  const { t } = useI18n();
  const { user } = useAuth();
  const [rec, setRec] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!user?.id) { setLoading(false); return; }
    let alive = true;
    (async () => {
      try {
        const { data, error } = await supabase
          .from('notification_preferences')
          .select('*')
          .eq('user_id', user.id)
          .limit(1)
          .maybeSingle();

        if (error) {
          throw error;
        }

        if (alive) setRec(data || null);
      } catch (error) {
        console.error('Failed to load notification preferences:', error);
      }
      finally { if (alive) setLoading(false); }
    })();
    return () => { alive = false; };
  }, [user?.id]);

  const enabled = rec ? rec.email_notifications !== false : true;

  const toggle = async () => {
    setBusy(true);
    try {
      if (rec) {
        const { data, error } = await supabase
          .from('notification_preferences')
          .update({ email_notifications: !enabled })
          .eq('id', rec.id)
          .select()
          .single();

        if (error) {
          throw error;
        }

        setRec(data);
      } else {
        const { data, error } = await supabase
          .from('notification_preferences')
          .insert({ user_id: user.id, email_notifications: !enabled })
          .select()
          .single();

        if (error) {
          throw error;
        }

        setRec(data);
      }
    } catch (error) {
      console.error('Failed to update notification preferences:', error);
    }
    finally { setBusy(false); }
  };

  if (loading || !user) return null;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-center gap-2">
        {enabled ? <Bell className="h-5 w-5 text-sky-600" /> : <BellOff className="h-5 w-5 text-slate-400" />}
        <h2 className="text-lg font-bold text-slate-900">{t.v2?.notifTitle || 'Email notifications'}</h2>
      </div>
      <p className="mt-1 text-sm text-slate-500">{t.v2?.notifSub || 'Get an email when you receive trade proposals, messages, and counter-offers'}</p>
      <button
        onClick={toggle}
        disabled={busy}
        className={`mt-3 inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition disabled:opacity-60 ${enabled ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
      >
        <span className={`h-2 w-2 rounded-full ${enabled ? 'bg-emerald-500' : 'bg-slate-400'}`} />
        {enabled ? (t.v2?.notifOn || 'On') : (t.v2?.notifOff || 'Off')}
      </button>
    </div>
  );
}