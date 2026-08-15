import React, { useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from '@/components/ui/command';
import { cn } from '@/lib/utils';

/**
 * Searchable single-select combobox for long option lists (countries, languages...).
 * @param {string[]} options - list of selectable string values
 * @param {string} value - currently selected value ("" = none)
 * @param {function} onChange - (value) => void
 * @param {string} placeholder - search placeholder
 * @param {string} allLabel - label for the "All / Any" reset option (omit to disable)
 * @param {string} className - extra classes for the trigger
 */
export default function SearchableSelect({ options, value, onChange, placeholder = 'Search...', allLabel, className }) {
  const [open, setOpen] = useState(false);

  const triggerCls =
    'flex w-full items-center justify-between gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-sky-400 focus:bg-white hover:bg-slate-100/70 transition';

  const display = value || '';

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button type="button" className={cn(triggerCls, className)} aria-haspopup="listbox" aria-expanded={open}>
          <span className={display ? 'text-slate-800 truncate' : 'text-slate-400'}>
            {display || (allLabel ? allLabel : placeholder)}
          </span>
          <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[min(20rem,calc(100vw-2rem))] p-0" align="start">
        <Command shouldFilter={true} filter={(v, search) => (v.toLowerCase().includes(search.toLowerCase()) ? 1 : 0)}>
          <CommandInput placeholder={placeholder} />
          <CommandList className="max-h-64">
            <CommandEmpty>No match found.</CommandEmpty>
            {allLabel && (
              <CommandGroup>
                <CommandItem
                  value="__all__"
                  onSelect={() => { onChange(''); setOpen(false); }}
                  className="text-slate-500 italic"
                >
                  {allLabel}
                  {value === '' && <Check className="ms-auto h-4 w-4 text-sky-500" />}
                </CommandItem>
              </CommandGroup>
            )}
            <CommandGroup>
              {options.map((opt) => (
                <CommandItem
                  key={opt}
                  value={opt}
                  onSelect={() => { onChange(opt === value ? '' : opt); setOpen(false); }}
                >
                  <span className="truncate">{opt}</span>
                  {value === opt && <Check className="ms-auto h-4 w-4 text-sky-500" />}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}