import React, { useState } from 'react';
import { Folder, Calendar, User, Link2 } from 'lucide-react';
import type { PostDetail } from '../../types/post';
import { downloadPost } from '@/api/post';
import { useToast } from '../../hooks/useToast';

interface PostDetailHeaderProps {
  post: PostDetail;
  readingTime: number;
  handleCopyLink: () => void;
}

export const PostDetailHeader: React.FC<PostDetailHeaderProps> = ({
  post,
  readingTime,
  handleCopyLink
}) => {
  const { toast } = useToast();
  const [isDownloading, setIsDownloading] = useState(false);
  const [showDownloadStatus, setShowDownloadStatus] = useState(false);

  const handleDownload = async (postId: number | string) => {
    if (isDownloading) return;

    setIsDownloading(true);
    setShowDownloadStatus(true);

    try {
      const { blob, fileName } = await downloadPost(Number(postId));
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => window.URL.revokeObjectURL(url), 100);

      toast({
        title: 'Download successful',
        description: 'The post PDF has been downloaded.',
        variant: 'success',
        duration: 3000,
      });
    } catch (error: any) {
      const status = error?.response?.status;
      const message =
        status === 401
          ? 'Please sign in to download this post.'
          : status === 403
            ? 'You do not have permission to download this post.'
            : status === 404
              ? 'The post could not be found for download.'
              : status === 429
                ? 'You must to wait 3 minutes until the next download.'
                : 'Unable to download the post. Please try again later.';

      toast({
        title: 'Download failed',
        description: message,
        variant: 'destructive',
        duration: 4000,
      });
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="space-y-6">
      {post.collections && post.collections.length > 0 && (
        <div className="flex items-center gap-1.5 text-xs font-bold text-primary bg-primary/10 border border-primary/20 w-fit px-3 py-1.5 rounded-md">
          <Folder className="w-3.5 h-3.5" />
          <span>{post.collections[0]?.name}</span>
        </div>
      )}

      <h1 className="text-2xl md:text-4xl font-extrabold font-heading text-slate-800 dark:text-foreground tracking-tight leading-tight">
        {post.title}
      </h1>

      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-border">
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs font-bold text-slate-400">
          <span className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4" />
            {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            }) : 'Draft'}
          </span>
          <span className="flex items-center gap-1.5">
            <User className="w-4 h-4" />
            By {post.author?.name || 'Author'}
          </span>
          <span>•</span>
          <span>{readingTime} min read</span>
        </div>

        {/* Share Post Widget - Light rounded-md corners */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyLink}
            title="Copy Link to Clipboard"
            className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-primary transition-colors active:scale-95 border border-slate-100 dark:border-border bg-transparent cursor-pointer"
          >
            <Link2 className="w-4 h-4" />
          </button>
          <a
            href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(post.title)}`}
            target="_blank"
            rel="noopener noreferrer"
            title="Share on Twitter/X"
            className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-primary transition-colors active:scale-95 flex items-center justify-center border border-slate-100 dark:border-border"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </a>
          <a
            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
            target="_blank"
            rel="noopener noreferrer"
            title="Share on Facebook"
            className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-primary transition-colors active:scale-95 flex items-center justify-center border border-slate-100 dark:border-border"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
              <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
            </svg>
          </a>
          <button
            type="button"
            title={isDownloading ? 'Preparing download...' : 'Download blog'}
            onClick={() => handleDownload(Number(post.id))}
            disabled={isDownloading}
            className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-primary transition-colors active:scale-95 flex items-center justify-center border border-slate-100 dark:border-border disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isDownloading ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            ) : (
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M13 12H21M13 8H21M13 16H21M6 7V17M6 17L3 14M6 17L9 14" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {showDownloadStatus && (
        <div className="fixed right-4 top-20 z-50 w-[min(92vw,22rem)] rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl dark:border-slate-700 dark:bg-slate-900">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <div>
                <p className="font-semibold text-slate-800 dark:text-slate-100">Preparing your download</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">Please wait while the PDF is being generated.</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowDownloadStatus(false)}
              className="rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
              aria-label="Close download status"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
