import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useI18n } from '@/lib/i18n';
import { ArrowLeft, ShieldCheck, Ban, RotateCcw, Trash2, Flag, Clock, Unlock } from 'lucide-react';

export default function Admin() {
  const { t } = useI18n();
  const a = t.admin || {};
  const c = t.community?.flag || {};
  const m = t.moderation || {};
  const [tab, setTab] = useState('flags');
  const [listingFlags, setListingFlags] = useState([]);
  const [userFlags, setUserFlags] = useState([]);
  const [listings, setListings] = useState({});
  const [names, setNames] = useState({});
  const [users, setUsers] = useState({});
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const [lf, uf] = await Promise.all([
        base44.entities.ListingFlag.list('-created_date', 200),
        base44.entities.UserFlag.list('-created_date', 200)
      ]);
      setListingFlags(lf || []);
      setUserFlags(uf || []);

      const lIds = [...new Set((lf || []).map((f) => f.listing_id).filter(Boolean))];
      const lMap = {};
      await Promise.all(lIds.map(async (id) => {
        try { const l = await base44.entities.Listing.get(id); lMap[id] = l?.title || '—'; } catch { lMap[id] = '—'; }
      }));
      setListings(lMap);

      const ids = [...new Set([
        ...(uf || []).map((f) => f.reported_user_id),
        ...(uf || []).map((f) => f.reporter_id),
        ...(lf || []).map((f) => f.created_by_id)
      ].filter(Boolean))];
      if (ids.length) {
        try { const res = await base44.functions.invoke('resolveUserNames', { ids }); setNames(res?.data?.names || res?.names || {}); } catch {}
      }

      const uIds = [...new Set((uf || []).map((f) => f.reported_user_id).filter(Boolean))];
      const uMap = {};
      await Promise.all(uIds.map(async (id) => { try { uMap[id] = await base44.entities.User.get(id); } catch {} }));
      setUsers(uMap);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const act = async (payload) => {
    setBusy(true);
    try { await base44.functions.invoke('adminModerate', payload); await load(); }
    finally { setBusy(false); }
  };

  const reasonLabel = (r) => (c.reasons && c.reasons[r]) || r;
  const statusBadge = (s) => {
    const map = { open: 'bg-amber-50 text-amber-700', hidden: 'bg-slate-100 text-slate-600', restored: 'bg-emerald-50 text-emerald-700', removed: 'bg-rose-50 text-rose-700' };
    return <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${map[s] || 'bg-slate-100 text-slate-500'}`}>{s}</span>;
  };

  const lfCount = {};
  listingFlags.forEach((f) => { lfCount[f.listing_id] = (lfCount[f.listing_id] || 0) + 1; });
  const ufCount = {};
  userFlags.forEach((f) => { ufCount[f.reported_user_id] = (ufCount[f.reported_user_id] || 0) + 1; });
  const flaggedUserIds = Object.keys(ufCount);

  const flags = [
    ...(listingFlags || []).map((f) => ({ ...f, _kind: 'listing' })),
    ...(userFlags || []).map((f) => ({ ...f, _kind: 'user' }))
  ].sort((x, y) => new Date(y.created_date) - new Date(x.created_date));

  return (
    <div className="min-h-screen bg-slate-50/60">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-sky-600" />
            <h1 className="text-lg font-bold text-slate-900">{a.title || 'Moderation'}</h1>
          </div>
          <Link to="/explore" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800">
            <ArrowLeft className="h-4 w-4" /> {a.back || 'Back to app'}
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6 space-y-4">
        <div className="flex gap-2 rounded-2xl border border-slate-200 bg-white p-1.5">
          {[['flags', a.tabs?.flags || 'Recent flags'], ['users', a.tabs?.users || 'Suspended & flagged users']].map(([k, label]) => (
            <button key={k} onClick={() => setTab(k)} className={`flex-1 rounded-xl px-4 py-2 text-sm font-semibold transition ${tab === k ? 'bg-sky-500 text-white' : 'text-slate-600 hover:bg-slate-50'}`}>{label}</button>
          ))}
        </div>

        {loading ? (
          <p className="py-16 text-center text-sm text-slate-400">{a.loading || 'Loading…'}</p>
        ) : tab === 'flags' ? (
          <div className="space-y-3">
            {flags.length === 0 && <p className="py-12 text-center text-sm text-slate-400">{a.empty || 'Nothing to review'}</p>}
            {flags.map((f) => (
              <div key={f._kind + f.id} className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold text-white ${f._kind === 'listing' ? 'bg-indigo-600' : 'bg-rose-500'}`}>{f._kind === 'listing' ? (a.listingFlags || 'Listing flag') : (a.userFlags || 'User flag')}</span>
                      {statusBadge(f.status)}
                      <span className="text-xs text-slate-400">{new Date(f.created_date).toLocaleString()}</span>
                    </div>
                    <p className="mt-2 text-sm font-semibold text-slate-900">
                      {f._kind === 'listing'
                        ? <Link to={`/listings/${f.listing_id}`} className="hover:underline">{listings[f.listing_id] || f.listing_id}</Link>
                        : <Link to={`/users/${f.reported_user_id}`} className="hover:underline notranslate" translate="no">{names[f.reported_user_id] || f.reported_user_id}</Link>}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">{a.reporters || 'Reporter'}: <span className="notranslate" translate="no">{names[f.created_by_id] || f.reporter_id || '—'}</span></p>
                    <p className="mt-1 text-xs text-slate-600"><span className="font-medium">{a.reason || 'Reason'}:</span> {reasonLabel(f.reason)}</p>
                    {f.note && <p className="mt-1 text-xs text-slate-500">{a.note || 'Note'}: {f.note}</p>}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {f._kind === 'listing' && f.status !== 'restored' && (
                      <button disabled={busy} onClick={() => act({ action: 'restore_listing', listing_id: f.listing_id, flag_id: f.id })} className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100"><RotateCcw className="h-3.5 w-3.5" /> {a.restoreListing || 'Restore'}</button>
                    )}
                    {f._kind === 'listing' && f.status !== 'removed' && (
                      <button disabled={busy} onClick={() => act({ action: 'remove_listing', listing_id: f.listing_id, flag_id: f.id })} className="inline-flex items-center gap-1 rounded-lg bg-rose-50 px-2.5 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100"><Trash2 className="h-3.5 w-3.5" /> {a.removeListing || 'Remove'}</button>
                    )}
                    {f._kind === 'user' && f.status !== 'restored' && (
                      <button disabled={busy} onClick={() => act({ action: 'restore_user', user_id: f.reported_user_id })} className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100"><Unlock className="h-3.5 w-3.5" /> {a.restoreUser || 'Restore'}</button>
                    )}
                    {f._kind === 'user' && f.status !== 'removed' && (
                      <button disabled={busy} onClick={() => { if (window.confirm(a.confirmBan || 'Ban this user permanently?')) act({ action: 'ban_user', user_id: f.reported_user_id }); }} className="inline-flex items-center gap-1 rounded-lg bg-rose-50 px-2.5 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100"><Ban className="h-3.5 w-3.5" /> {a.banUser || 'Ban'}</button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {flaggedUserIds.length === 0 && <p className="py-12 text-center text-sm text-slate-400">{a.empty || 'Nothing to review'}</p>}
            {flaggedUserIds.map((uid) => {
              const u = users[uid];
              const status = u?.status || 'active';
              const cnt = ufCount[uid] || 0;
              const until = u?.suspended_until;
              const expired = status === 'suspended' && until && new Date(until).getTime() <= Date.now();
              return (
                <div key={uid} className="rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <Link to={`/users/${uid}`} className="text-sm font-semibold text-slate-900 hover:underline notranslate" translate="no">{names[uid] || uid}</Link>
                        <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${status === 'suspended' ? 'bg-amber-50 text-amber-700' : status === 'banned' ? 'bg-rose-50 text-rose-700' : 'bg-slate-100 text-slate-600'}`}>{status}</span>
                        <span className="inline-flex items-center gap-1 text-xs text-slate-500"><Flag className="h-3 w-3" /> {cnt}</span>
                      </div>
                      {status === 'suspended' && until && !expired && <p className="mt-1 inline-flex items-center gap-1 text-xs text-amber-700"><Clock className="h-3 w-3" /> {a.suspendedUntil || 'Suspended until'}: {new Date(until).toLocaleString()}</p>}
                      {expired && <p className="mt-1 text-xs text-emerald-700">{m.expired || 'Window passed — will auto-restore'}</p>}
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {status !== 'active' && <button disabled={busy} onClick={() => act({ action: 'restore_user', user_id: uid })} className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100"><Unlock className="h-3.5 w-3.5" /> {a.restoreUser || 'Restore'}</button>}
                      {status !== 'banned' && <button disabled={busy} onClick={() => { if (window.confirm(a.confirmBan || 'Ban this user permanently?')) act({ action: 'ban_user', user_id: uid }); }} className="inline-flex items-center gap-1 rounded-lg bg-rose-50 px-2.5 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100"><Ban className="h-3.5 w-3.5" /> {a.banUser || 'Ban'}</button>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}