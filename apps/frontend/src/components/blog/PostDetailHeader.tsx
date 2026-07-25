import React from 'react';
import { Folder, Calendar, User, Link2 } from 'lucide-react';
import type { PostDetail } from '../../types/post';

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
        </div>
      </div>
    </div>
  );
};
