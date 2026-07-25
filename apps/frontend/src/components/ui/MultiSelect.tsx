import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, Check, X } from 'lucide-react';

interface MultiSelectItem {
  id: number;
  name: string;
}

interface MultiSelectProps {
  items: MultiSelectItem[];
  selectedIds: number[];
  onChange: (ids: number[]) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  icon?: React.ReactNode;
}

export const MultiSelect: React.FC<MultiSelectProps> = ({
  items,
  selectedIds,
  onChange,
  placeholder = 'Select items...',
  searchPlaceholder = 'Search...',
  icon
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggleItem = (id: number) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((selectedId) => selectedId !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  const handleRemoveItem = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(selectedIds.filter((selectedId) => selectedId !== id));
  };

  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedItemsList = items.filter((item) => selectedIds.includes(item.id));

  return (
    <div ref={containerRef} className="relative w-full space-y-2">
      {/* Select Box Trigger */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3.5 py-2.5 bg-white dark:bg-card border border-slate-200 dark:border-border rounded-xl cursor-pointer hover:border-slate-300 dark:hover:border-slate-700 transition-all select-none"
      >
        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
          {icon}
          <span className="font-semibold text-slate-700 dark:text-slate-300">
            {selectedIds.length > 0
              ? `${selectedIds.length} is selected`
              : placeholder}
          </span>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-slate-400 dark:text-slate-500 transition-transform duration-250 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </div>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-card border border-slate-200 dark:border-border rounded-2xl shadow-xl p-3 space-y-2.5 animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Search Box */}
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-background border border-slate-200 dark:border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary text-slate-800 dark:text-slate-200 placeholder:text-slate-400"
            />
          </div>

          {/* Items List */}
          <div className="max-h-[180px] overflow-y-auto space-y-0.5 pr-1">
            {filteredItems.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">No results found.</p>
            ) : (
              filteredItems.map((item) => {
                const isSelected = selectedIds.includes(item.id);
                return (
                  <div
                    key={item.id}
                    onClick={() => handleToggleItem(item.id)}
                    className="flex items-center justify-between px-3 py-2 rounded-xl text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                  >
                    <span className="font-semibold">{item.name}</span>
                    {isSelected && <Check className="w-4 h-4 text-primary" />}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Selected Items Tags Displayed Below */}
      {selectedItemsList.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {selectedItemsList.map((item) => (
            <span
              key={item.id}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-black border border-slate-200 dark:border-border/60"
            >
              {item.name}
              <button
                type="button"
                onClick={(e) => handleRemoveItem(item.id, e)}
                className="hover:text-red-500 text-slate-400 dark:text-slate-500 hover:bg-red-50 dark:hover:bg-red-950/20 p-0.5 rounded-full transition-colors border-0 bg-transparent cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};
