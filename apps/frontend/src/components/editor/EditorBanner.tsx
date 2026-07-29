import React from 'react';
import { Image as ImageIcon, Loader2, X } from 'lucide-react';

interface EditorBannerProps {
  banner: string;
  isBannerUploading: boolean;
  onUploadClick: () => void;
  onRemove: () => void;
}

export const EditorBanner: React.FC<EditorBannerProps> = ({
  banner,
  isBannerUploading,
  onUploadClick,
  onRemove
}) => {
  return (
    <div className="relative aspect-[21/9] w-full rounded-2xl overflow-hidden bg-slate-50 dark:bg-[var(--background)] border border-slate-200 dark:border-border shadow-none group">
      {banner ? (
        <>
          <img
            src={banner}
            alt="Cover Banner"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-opacity duration-200">
            <button
              type="button"
              onClick={onUploadClick}
              className="px-4 py-2 bg-white text-slate-800 rounded-xl text-xs font-bold hover:bg-slate-100 transition-all shadow flex items-center gap-1.5 cursor-pointer border-0 dark:bg-[var(--background)] dark:text-[var(--color-foreground)] dark:hover:bg-[var(--color-secondary)]"
            >
              <ImageIcon className="w-4 h-4" /> Change Image
            </button>
            <button
              type="button"
              onClick={onRemove}
              className="px-4 py-2 bg-red-650 text-white rounded-xl text-xs font-bold hover:bg-red-700 transition-all shadow flex items-center gap-1.5 cursor-pointer border-0"
            >
              <X className="w-4 h-4" /> Remove
            </button>
          </div>
        </>
      ) : (
        <button
          type="button"
          onClick={isBannerUploading ? undefined : onUploadClick}
          disabled={isBannerUploading}
          className="w-full h-full flex flex-col items-center justify-center text-slate-400 hover:text-slate-650 dark:hover:text-slate-300 transition-all disabled:opacity-50 border-0 bg-transparent cursor-pointer"
        >
          {isBannerUploading ? (
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          ) : (
            <>
              <ImageIcon className="w-10 h-10 mb-2" />
              <span className="text-sm font-black">Upload Cover Image</span>
              <span className="text-xs text-slate-400 mt-1 dark:text-[var(--color-muted-foreground)]">Recommended ratio: 21:9 (matches detail view)</span>
            </>
          )}
        </button>
      )}
    </div>
  );
};
