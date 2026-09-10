import React, { useState } from 'react';
import { Check, ChevronDown, X } from 'lucide-react';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from '@/components/ui/command';

/**
 * Searchable multi-select combobox. Lets the user pick several options from a
 * suggestion list AND add free-text entries that don't exist in the list.
 * @param {string[]} options - suggested values to choose from
 * @param {string[]} value - currently selected values
 * @param {function} onChange - (string[]) => void
 * @param {string} placeholder - search placeholder
 * @param {string} addLabel - label shown for the "add custom" action
 * @param {string} className - extra classes for the trigger wrapper
 */
export default function MultiSearchableSelect({ options, value = [], onChange, placeholder = 'Search...', addLabel = 'Add', className }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const selected = Array.isArray(value) ? value : [];
  const ql = query.trim().toLowerCase();
  const filtered = options.filter((o) => o.toLowerCase().includes(ql));
  const exactMatch = options.some((o) => o.toLowerCase() === ql);
  const canAddCustom = ql.length > 0 && !exactMatch && !selected.some((s) => s.toLowerCase() === ql);

  const add = (val) => {
    const v = val.trim();
    if (!v) return;
    if (selected.some((s) => s.toLowerCase() === v.toLowerCase())) return;
    onChange([...selected, v]);
  };
  const remove = (val) => onChange(selected.filter((s) => s !== val));

  return (
    <div className={className}>
      <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-2 focus-within:border-sky-400 focus-within:bg-white">
        {selected.map((s) => (
          <span key={s} className="inline-flex items-center gap-1 rounded-full bg-sky-100 px-2 py-0.5 text-xs font-medium text-sky-700">
            <span className="max-w-[160px] truncate">{s}</span>
            <button type="button" onClick={() => remove(s)} className="text-sky-500 hover:text-sky-700">
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        <Popover open={open} onOpenChange={(o) => { setOpen(o); if (!o) setQuery(''); }} className="flex-1 min-w-[8rem]">
          <PopoverTrigger asChild>
            <button type="button" className="flex flex-1 items-center justify-between gap-2 text-sm outline-none" aria-haspopup="listbox" aria-expanded={open}>
              <span className={selected.length ? 'text-slate-800' : 'text-slate-400'}>
                {selected.length ? `${selected.length} selected` : placeholder}
              </span>
              <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-[min(20rem,calc(100vw-2rem))] p-0" align="start">
            <Command shouldFilter={false}>
              <CommandInput placeholder={placeholder} value={query} onValueChange={setQuery} />
              <CommandList className="max-h-64">
                <CommandEmpty>
                  {canAddCustom ? (
                    <button type="button" onClick={() => { add(query); setQuery(''); setOpen(false); }} className="w-full px-2 py-1.5 text-start text-sm text-sky-600">
                      {addLabel}: “{query.trim()}”
                    </button>
                  ) : 'No match found.'}
                </CommandEmpty>
                {filtered.length > 0 && (
                  <CommandGroup>
                    {filtered.map((opt) => (
                      <CommandItem
                        key={opt}
                        value={opt}
                        onSelect={() => { add(opt); setQuery(''); }}
                      >
                        <span className="truncate">{opt}</span>
                        {selected.some((s) => s === opt) && <Check className="ms-auto h-4 w-4 text-sky-500" />}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}
                {canAddCustom && filtered.length > 0 && (
                  <CommandGroup>
                    <CommandItem value={`__add__${query}`} onSelect={() => { add(query); setQuery(''); setOpen(false); }} className="text-sky-600">
                      {addLabel}: “{query.trim()}”
                    </CommandItem>
                  </CommandGroup>
                )}
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}