import React, { useEffect, useState } from 'react';
import { supabase } from '@/api/supabaseClient';
import { useI18n } from '@/lib/i18n';
import { Activity, Globe2 } from 'lucide-react';

export default function GlobalImpactCounter() {
  const { t } = useI18n();
  const [count, setCount] = useState(0);

  useEffect(() => {
    let isMounted = true;

    const refresh = async () => {
      if (!supabase) {
        return;
      }

      try {
        const { count: tradedCount, error } = await supabase
          .from('listings')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'traded');

        if (error) {
          throw error;
        }

        if (isMounted) {
          setCount(tradedCount || 0);
        }
      } catch (error) {
        console.error('Failed to load global impact count:', error);
      }
    };

    refresh();

    if (!supabase) {
      return () => {
        isMounted = false;
      };
    }

    const channel = supabase
      .channel('global-impact-listings')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'listings',
        },
        refresh
      )
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-sky-100 bg-gradient-to-br from-sky-50 to-white p-4">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky-500 text-white shadow-sm shadow-sky-200">
        <Globe2 className="h-6 w-6" />
      </div>

      <div className="min-w-0">
        <div className="text-2xl font-bold leading-tight tabular-nums text-slate-900">
          {count.toLocaleString()}
        </div>

        <div className="text-xs font-medium text-slate-500">
          {t?.impact?.global || 'Items traded'}
        </div>
      </div>

      <span className="ms-auto inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-600">
        <Activity className="h-3.5 w-3.5" />
        {t?.impact?.globalSub || 'Live'}
      </span>
    </div>
  );
}
