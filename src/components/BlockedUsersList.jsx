import React, { useState, useEffect } from 'react';
import { supabase } from '@/api/supabaseClient';
import { useI18n } from '@/lib/i18n';
import { ShieldX, Unlock } from 'lucide-react';
import { resolveUsers } from '@/lib/userMeta';

/**
 * BlockedUsersList — Settings section listing users the current user has
 * blocked, with an Unblock action. Block records are retained (active=false)
 * rather than deleted, so block/unblock history stays for accountability.
 */
export default function BlockedUsersList() {
  const { t } = useI18n();
  const [blocks, setBlocks] = useState([]);
  const [names, setNames] = useState({});
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const recs = await base44.entities.UserBlock.filter({ active: true }, '-created_date', 100);
      setBlocks(recs || []);
      const ids = [...new Set((recs || []).map((b) => b.blocked_id).filter(Boolean))];
      if (ids.length) {
        try {
          const { names } = await resolveUsers(ids);
          setNames(names);
        } catch { /* keep placeholder */ }
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const unblock = async (b) => {
    try {
      await base44.entities.UserBlock.update(b.id, { active: false, unblocked_date: new Date().toISOString() });
      setBlocks((cur) => cur.filter((x) => x.id !== b.id));
    } catch { /* ignore */ }
  };

  return (
    <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-center gap-2">
        <ShieldX className="h-5 w-5 text-slate-500" />
        <h2 className="text-lg font-bold text-slate-900">{t.call.blockedUsers}</h2>
      </div>
      {loading ? (
        <p className="mt-3 text-sm text-slate-400">{t.common.loading}</p>
      ) : blocks.length === 0 ? (
        <p className="mt-3 text-sm text-slate-400">{t.call.noBlocked}</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {blocks.map((b) => (
            <li key={b.id} className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5">
              <span className="truncate text-sm font-medium text-slate-700">{names[b.blocked_id] || t.common.member}</span>
              <button onClick={() => unblock(b)} className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-100">
                <Unlock className="h-3.5 w-3.5" /> {t.call.unblock}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
