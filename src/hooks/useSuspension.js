import { base44 } from '@/api/base44Client';
import { useI18n } from '@/lib/i18n';
import { useToast } from '@/components/ui/use-toast';

/**
 * useCanAct — returns an async `assertCanAct()` that asks the server whether the
 * current user may perform a gated action. If the user is suspended/banned it
 * shows a toast and resolves false; otherwise resolves true. Fails open on
 * error so a transient backend hiccup never locks everyone out.
 */
export function useCanAct() {
  const { t } = useI18n();
  const { toast } = useToast();
  const mod = t.moderation || {};
  return async function assertCanAct() {
    try {
      const res = await base44.functions.invoke('checkCanAct', {});
      const d = res?.data || res || {};
      if (d.blocked) {
        const when = d.suspendedUntil ? new Date(d.suspendedUntil).toLocaleDateString() : '';
        const notice = (mod.suspendedNotice || 'Your account is temporarily suspended. Actions are blocked until {date}.').replace('{date}', when);
        toast({ title: mod.suspendedTitle || 'Temporarily suspended', description: notice });
        return false;
      }
    } catch { /* fail open */ }
    return true;
  };
}