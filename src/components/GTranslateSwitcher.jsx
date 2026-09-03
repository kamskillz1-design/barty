import React, { useState } from 'react';
import { Globe, ChevronDown } from 'lucide-react';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from '@/components/ui/command';
import { LANGUAGES } from '@/lib/i18n';
import { cn } from '@/lib/utils';

// Reads GTranslate's googtrans cookie; returns the target code ('' = English source).
const readGoogTrans = () => {
  try {
    const m = document.cookie.match(/(?:^|;)\s*googtrans=([^;]+)/);
    if (!m) return '';
    const v = decodeURIComponent(m[1]); // e.g. "/en/es"
    const parts = v.split('/');
    return parts.length > 2 ? parts[parts.length - 1] : '';
  } catch { return ''; }
};

const SOURCE = 'es';

export default function GTranslateSwitcher() {
  const [open, setOpen] = useState(false);
  const [switching, setSwitching] = useState(false);
  const [current, setCurrent] = useState(() => readGoogTrans() || SOURCE);
  const currentLabel = LANGUAGES.find((l) => l.code === current)?.label || 'Español';

  const select = (code) => {
    if (switching) return;
    setOpen(false);
    if (code === current) return;
    if (code === SOURCE) {
      setSwitching(true);
      // Clear the cookie (expire in the past on every path variant GTranslate may use), then reload.
      document.cookie = 'googtrans=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/';
      document.cookie = 'googtrans=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;domain=' + window.location.hostname;
      window.location.reload();
      return;
    }
    // Non-English: persist the choice and translate the current DOM in place via
    // GTranslate's engine (no reload → fast, no stale-restore issue).
    document.cookie = `googtrans=/es/${code};path=/`;
    setSwitching(true);
    let tries = 0;
    const go = () => {
      if (typeof window.doGTranslate === 'function') {
        try { window.doGTranslate('es|' + code); } catch { /* ignore */ }
        setCurrent(code);
        setSwitching(false);
      } else if (tries++ < 40) {
        setTimeout(go, 100);
      } else {
        // Engine never exposed it — fall back to a reload so the cookie-driven
        // translation applies on the fresh English base DOM.
        window.location.reload();
      }
    };
    go();
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={switching}
          className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition disabled:opacity-60"
          aria-haspopup="listbox"
          aria-expanded={open}
        >
          <Globe className="h-4 w-4 text-sky-600" />
          <span className="truncate max-w-[7rem]">{switching ? '…' : currentLabel}</span>
          <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[min(20rem,calc(100vw-2rem))] p-0" align="end" sideOffset={6}>
        <Command shouldFilter filter={(val, search) => (val.toLowerCase().includes(search.toLowerCase()) ? 1 : 0)}>
          <CommandInput placeholder="Search languages…" />
          <CommandList className="max-h-64">
            <CommandEmpty>No match found.</CommandEmpty>
            <CommandGroup>
              {LANGUAGES.map((l) => (
                <CommandItem
                  key={l.code}
                  value={`${l.label} ${l.code}`}
                  onSelect={() => select(l.code)}
                  className={current === l.code ? 'text-sky-700 font-medium' : 'text-slate-700'}
                >
                  <span className="flex-1 truncate">{l.label}</span>
                  {current === l.code && <span className="h-2 w-2 rounded-full bg-sky-500" />}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}