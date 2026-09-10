import React, { useEffect, useState } from 'react';
import { Trophy } from 'lucide-react';
import { supabase } from '@/api/supabaseClient';
import { useI18n } from '@/lib/i18n';

const MEDALS = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣'];

export default function Leaderboard() {
  const { t } = useI18n();

  const [top, setTop] = useState([]);
  const [names, setNames] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadLeaderboard = async () => {
      if (!supabase) {
        if (isMounted) {
          setLoading(false);
        }
        return;
      }

      try {
        const monthStart = new Date();
        monthStart.setDate(1);
        monthStart.setHours(0, 0, 0, 0);

        const { data: trades, error: tradesError } = await supabase
          .from('trades')
          .select('proposer_id, receiver_id, updated_at')
          .eq('status', 'completed')
          .gte('updated_at', monthStart.toISOString())
          .order('updated_at', { ascending: false })
          .limit(500);

        if (tradesError) {
          throw tradesError;
        }

        const counts = {};

        (trades || []).forEach((trade) => {
          [trade.proposer_id, trade.receiver_id]
            .filter(Boolean)
            .forEach((userId) => {
              counts[userId] = (counts[userId] || 0) + 1;
            });
        });

        const ranked = Object.entries(counts)
          .sort(([, countA], [, countB]) => countB - countA)
          .slice(0, 5);

        if (!isMounted) return;

        setTop(ranked);

        if (ranked.length === 0) {
          setNames({});
          return;
        }

        const userIds = ranked.map(([userId]) => userId);

        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, full_name')
          .in('id', userIds);

        if (profilesError) {
          throw profilesError;
        }

        const nameMap = {};

        userIds.forEach((userId) => {
          nameMap[userId] = t?.common?.member || 'Member';
        });

        (profiles || []).forEach((profile) => {
          const fullName = profile.full_name?.trim();

          if (fullName) {
            nameMap[profile.id] = fullName;
          }
        });

        if (isMounted) {
          setNames(nameMap);
        }
      } catch (error) {
        console.error('Failed to load leaderboard:', error);

        if (isMounted) {
          setTop([]);
          setNames({});
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadLeaderboard();

    return () => {
      isMounted = false;
    };
  }, [t?.common?.member]);

  if (loading || top.length === 0) {
    return null;
  }

  return (
    <section className="rounded-2xl border border-amber-100 bg-gradient-to-br from-amber-50/70 to-white p-4 sm:p-5">
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-amber-600">
          <Trophy className="h-4 w-4" />
        </span>

        <div>
          <h2 className="text-base font-bold text-slate-900">
            {t?.v2?.leaderboardTitle || 'Community leaderboard'}
          </h2>

          <p className="text-xs text-slate-500">
            {t?.v2?.leaderboardSub || 'Most completed trades this month'}
          </p>
        </div>
      </div>

      <ol className="mt-4 space-y-2">
        {top.map(([userId, count], index) => (
          <li
            key={userId}
            className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white px-3 py-2"
          >
            <span className="w-6 text-center text-base">
              {MEDALS[index] || index + 1}
            </span>

            <span
              className="notranslate flex-1 truncate text-sm font-semibold text-slate-800"
              translate="no"
            >
              {names[userId] || t?.common?.member || 'Member'}
            </span>

            <span className="text-xs font-bold text-amber-600">
              {count} {t?.v2?.tradesCount || 'trades'}
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}
