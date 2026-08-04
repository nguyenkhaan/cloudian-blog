import React, { useEffect } from 'react';
import type { PostDetail } from '../../types/post';
import hljs from 'highlight.js';

interface PostDetailContentProps {
  contentHtml: string;
  tags: NonNullable<PostDetail['tags']>;
}

export const PostDetailContent: React.FC<PostDetailContentProps> = React.memo(({
  contentHtml,
  tags
}) => {
  useEffect(() => {
    const frameId = window.requestAnimationFrame(() => {
      document.querySelectorAll('.markdown-content pre code').forEach((block) => {
        hljs.highlightElement(block as HTMLElement);
      });
    });
    return () => window.cancelAnimationFrame(frameId);
  }, [contentHtml]);

  return (
    <div className="space-y-8">
      <div
        className="markdown-content text-base leading-relaxed font-medium"
        dangerouslySetInnerHTML={{ __html: contentHtml }}
      />

      {tags && tags.length > 0 && (
        <div className="pt-6 border-t border-slate-200 dark:border-border flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag.id}
              className="px-3 py-1.5 rounded-md bg-slate-50 dark:bg-background text-slate-500 dark:text-muted-foreground text-xs font-bold transition-all border border-slate-150 dark:border-border/50 hover:bg-slate-100 hover:text-slate-800"
            >
              #{tag.name}
            </span>
          ))}
        </div>
      )}
    </div>
  );
});
