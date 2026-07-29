import React from 'react';
import { Settings } from 'lucide-react';
import { MultiSelect } from '../ui/MultiSelect';
import type { Collection, Tag } from '../../types/post';

interface EditorSidebarProps {
  collections: Collection[];
  tags: Tag[];
  selectedCollectionIds: number[];
  selectedTagIds: number[];
  onCollectionsChange: (ids: number[]) => void;
  onTagsChange: (ids: number[]) => void;
  slug: string;
  onSlugChange: (val: string) => void;
}

export const EditorSidebar: React.FC<EditorSidebarProps> = ({
  collections,
  tags,
  selectedCollectionIds,
  selectedTagIds,
  onCollectionsChange,
  onTagsChange,
  slug,
  onSlugChange
}) => {
  return (
    <aside className="space-y-6">
      <div className="bg-[var(--background)] rounded-2xl border border-slate-100 p-5 shadow-sm space-y-4 dark:border-slate-700">
        <h4 className="font-bold text-slate-800 flex items-center gap-2 pb-3 border-b border-slate-50 dark:text-[var(--color-foreground)] dark:border-slate-700">
          <Settings className="w-4 h-4 text-blue-600" />
          Collections
        </h4>
        <MultiSelect
          items={collections}
          selectedIds={selectedCollectionIds}
          onChange={onCollectionsChange}
          placeholder="Select collections..."
          searchPlaceholder="Search collections..."
          icon={<Settings className="w-4 h-4 text-blue-600" />}
        />
      </div>

      <div className="bg-[var(--background)] rounded-2xl border border-slate-150 p-5 shadow-sm space-y-4 dark:border-slate-700">
        <h4 className="font-bold text-slate-800 flex items-center gap-2 pb-3 border-b border-slate-50 dark:text-[var(--color-foreground)] dark:border-slate-700">
          <Settings className="w-4 h-4 text-blue-600" />
          Tags
        </h4>
        <MultiSelect
          items={tags}
          selectedIds={selectedTagIds}
          onChange={onTagsChange}
          placeholder="Select tags..."
          searchPlaceholder="Search tags..."
          icon={<Settings className="w-4 h-4 text-blue-600" />}
        />
      </div>

      <div className="bg-[var(--background)] rounded-2xl border border-slate-150 p-5 shadow-sm space-y-3 dark:border-slate-700">
        <h4 className="font-bold text-slate-800 text-sm dark:text-[var(--color-foreground)]">Permanent Link (Slug)</h4>
        <input
          type="text"
          placeholder="abbreviated-title"
          value={slug}
          onChange={(e) => onSlugChange(e.target.value)}
          className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-xs text-slate-700 bg-[var(--background)] dark:border-slate-600 dark:text-[var(--color-foreground)] dark:bg-slate-800"
        />
        <p className="text-[10px] text-slate-400 dark:text-[var(--color-muted-foreground)]">If left blank, slug will be generated automatically from the title.</p>
      </div>
    </aside>
  );
};
