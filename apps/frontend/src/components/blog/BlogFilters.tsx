import React from 'react';
import { Search } from 'lucide-react';
import type { Collection } from '../../types/post';

interface BlogFiltersProps {
  search: string;
  handleSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  selectedCollection: number | null;
  handleCollectionSelect: (id: number | null) => void;
  collections: Collection[];
}

export const BlogFilters: React.FC<BlogFiltersProps> = ({
  search,
  handleSearchChange,
  selectedCollection,
  handleCollectionSelect,
  collections
}) => {
  const safeCollections = Array.isArray(collections) ? collections : [];

  return (
    <section className="space-y-6 bg-slate-50 dark:bg-card/30 p-6 rounded-2xl border border-slate-200 dark:border-border transition-colors duration-300">
      <div className="relative w-full max-w-xl">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-black dark:text-foreground" />
        <input
          type="text"
          placeholder="Search blogs by keyword..."
          value={search}
          onChange={handleSearchChange}
          className="w-full pl-11 pr-4 py-3.5 bg-white dark:bg-background border border-slate-455 dark:border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm text-black dark:text-foreground transition-all placeholder:text-slate-550 shadow-inner font-semibold"
        />
      </div>

      {/* Categories Tab Filters */}
      <div className="flex flex-wrap items-center gap-2 pt-2">
        <button
          onClick={() => handleCollectionSelect(null)}
          className={`px-4.5 py-2.5 rounded-xl text-xs font-black transition-all border cursor-pointer ${
            selectedCollection === null
              ? 'bg-primary text-white border-primary shadow-none'
              : 'border-slate-355 dark:border-border bg-white dark:bg-card text-black dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          All Topics
        </button>
        {safeCollections.map((col) => (
          <button
            key={col.id}
            onClick={() => handleCollectionSelect(col.id)}
            className={`px-4.5 py-2.5 rounded-xl text-xs font-black transition-all border cursor-pointer ${
              selectedCollection === col.id
                ? 'bg-primary text-white border-primary shadow-none'
                : 'border-slate-355 dark:border-border bg-white dark:bg-card text-black dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {col.name}
          </button>
        ))}
      </div>
    </section>
  );
};
