import React from 'react';
import { Link } from 'react-router-dom';
import type { Post } from '../types/post';

interface PostCardProps {
  post: Post;
}

export const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const formattedDate = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : 'Draft';

  const defaultBanner = 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=400&auto=format&fit=crop&q=80';
  const summaryPlaceholder = `Discover key takeaways, developer insights, and deep-dive technical guidelines about this topic, written by our engineering team at CloudianZea.`;

  return (
    <article className="flex flex-col-reverse sm:flex-row gap-6 items-start justify-between py-8 border-b border-slate-100 dark:border-border group transition-colors duration-300">
      <div className="flex-1 space-y-3">
        <span className="text-xs font-bold text-slate-400 dark:text-muted-foreground block tracking-wider uppercase">
          {formattedDate}
        </span>

        <Link to={`/posts/${post.slug || post.id}`} className="block">
          <h3 className="text-xl md:text-2xl font-bold font-heading text-slate-800 dark:text-foreground leading-tight group-hover:text-primary transition-colors line-clamp-2">
            {post.title}
          </h3>
        </Link>

        <p className="text-slate-500 dark:text-muted-foreground text-sm leading-relaxed line-clamp-2">
          {post.summary || summaryPlaceholder}
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2 text-xs font-semibold text-slate-400 dark:text-muted-foreground">
          {post.collections && post.collections.length > 0 ? (
            <span className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold uppercase tracking-wider text-[10px]">
              {post.collections[0].name}
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold uppercase tracking-wider text-[10px]">
              Blog
            </span>
          )}
          
          <span>By {post.author?.name || 'Author'}</span>
          <span>•</span>
          <span>5 min read</span>
        </div>
      </div>

      <Link 
        to={`/posts/${post.slug || post.id}`} 
        className="w-full sm:w-40 h-40 aspect-square rounded-2xl overflow-hidden bg-slate-50 dark:bg-card shrink-0 border border-slate-100/50 dark:border-border block"
      >
        <img
          src={post.banner || defaultBanner}
          alt={post.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
      </Link>
    </article>
  );
};
