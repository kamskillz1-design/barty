import React, { useState, useMemo } from 'react';
import { Globe, Check, ChevronDown, Loader2 } from 'lucide-react';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from '@/components/ui/command';
import { useI18n, LANGUAGES } from '@/lib/i18n';
import { cn } from '@/lib/utils';

/**
 * Searchable single-select for UI language across all supported world languages.
 * Displays a human label but emits the ISO code. Two trigger styles:
 *  - header: compact pill with a globe icon (top navigation)
 *  - form: full-width field styled to match other form inputs
 */
export default function LanguagePicker({ value, onChange, variant = 'header', className, placeholder }) {
  const { t, translating, dir } = useI18n();
  const [open, setOpen] = useState(false);
  const current = useMemo(() => LANGUAGES.find((l) => l.code === value), [value]);

  const triggerCls =
    variant === 'form'
      ? cn(
          'flex w-full items-center justify-between gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-sky-400 focus:bg-white hover:bg-slate-100/70 transition',
          className
        )
      : cn(
          'flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition',
          className
        );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button type="button" className={triggerCls} aria-haspopup="listbox" aria-expanded={open}>
          {variant === 'header' && <Globe className="h-4 w-4 text-sky-600" />}
          <span className={cn(current ? 'text-slate-800' : 'text-slate-400', 'truncate')}>
            {current ? current.label : placeholder || t.search.searchLang}
          </span>
          {translating ? (
            <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin text-sky-500" />
          ) : (
            <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" />
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[min(20rem,calc(100vw-2rem))] p-0" align={variant === 'header' ? 'end' : 'start'} sideOffset={6}>
        <Command
          shouldFilter
          filter={(val, search) => {
            const v = val.toLowerCase();
            const s = search.toLowerCase();
            return v.includes(s) ? 1 : 0;
          }}
        >
          <CommandInput placeholder={t.search.searchLang} />
          <CommandList className="max-h-64">
            <CommandEmpty>{t.common.empty}</CommandEmpty>
            <CommandGroup>
              {LANGUAGES.map((l) => (
                <CommandItem
                  key={l.code}
                  value={`${l.label} ${l.code}`}
                  onSelect={() => {
                    onChange(l.code);
                    setOpen(false);
                  }}
                  className={value === l.code ? 'text-sky-700 font-medium' : 'text-slate-700'}
                  dir={dir}
                >
                  <span className="flex-1 truncate">{l.label}</span>
                  {value === l.code && <Check className="h-4 w-4 text-sky-500" />}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}