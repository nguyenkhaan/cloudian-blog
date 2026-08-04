import React from 'react';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { Button } from '../ui/button';

interface EditorHeaderProps {
  isEditMode: boolean;
  isSaving: boolean;
  isAutoSaving: boolean;
  onBack: () => void;
  onSave: () => void;
}

export const EditorHeader: React.FC<EditorHeaderProps> = ({
  isEditMode,
  isSaving,
  isAutoSaving,
  onBack,
  onSave
}) => {
  const isBusy = isSaving || isAutoSaving;

  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between shadow-sm dark:bg-black dark:border-slate-800">
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-650 transition-colors cursor-pointer border-0 bg-transparent dark:hover:bg-white/10 dark:text-white dark:hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h2 className="font-extrabold text-lg text-slate-800 tracking-tight leading-none dark:text-white">
          {isEditMode ? 'Edit Blog' : 'Create New Blog'}
        </h2>
      </div>

      <div className="flex items-center gap-3">
        <Button
          onClick={onSave}
          disabled={isBusy}
          className={`bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl px-4 py-2 flex items-center gap-1.5 shadow-md shadow-blue-500/10 active:scale-95 transition-all cursor-pointer dark:bg-white dark:text-black dark:hover:bg-white/90 ${
            isBusy ? 'opacity-60' : ''
          }`}
        >
          {isBusy ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" /> {isAutoSaving ? 'Auto-saving...' : 'Saving...'}
            </>
          ) : (
            <>
              <Save className="w-3.5 h-3.5" /> Save Blog
            </>
          )}
        </Button>
      </div>
    </header>
  );
};
