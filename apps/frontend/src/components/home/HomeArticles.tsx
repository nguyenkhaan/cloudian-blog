import React from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '../../hooks/useToast';
import { Calendar, Clock, ArrowRight, Share2, Loader2 } from 'lucide-react';
import type { Post } from '../../types/post';

interface HomeArticlesProps {
  posts: Post[];
  isLoading: boolean;
}

export const HomeArticles: React.FC<HomeArticlesProps> = ({ posts, isLoading }) => {
  const { toast } = useToast();
  const spotlightPost = posts[0];
  const secondaryPosts = posts.slice(1);

  const handleCopyLink = (slugOrId: string) => {
    const url = `${window.location.origin}/posts/${slugOrId}`;
    navigator.clipboard.writeText(url);
    toast({
      description: 'Blog link copied to clipboard!',
      variant: 'success'
    });
  };

  return (
    <section className="space-y-8">
      <div className="flex items-end justify-between border-b border-slate-200 dark:border-border pb-5">
        <h2 className="text-3xl font-black text-black dark:text-foreground tracking-tight font-heading">
          Editorial Spotlight
        </h2>
        <Link to="/blog" className="text-sm font-black text-primary hover:underline flex items-center gap-1">
          View all Blogs. <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
          <span className="text-slate-400 text-base font-extrabold">Loading blogs...</span>
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-24 bg-white dark:bg-card border border-dashed border-slate-300 dark:border-border p-8 rounded-2xl">
          <p className="text-slate-550 dark:text-muted-foreground font-black text-base">No blogs found.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Massive Spotlight Post spanning full layout width */}
          {spotlightPost && (
            <article className="border border-slate-355 dark:border-border rounded-2xl overflow-hidden bg-white dark:bg-card transition-all duration-300 flex flex-col lg:flex-row group shadow-none animate-fade-up">
              <div className="lg:w-3/5 bg-slate-50 dark:bg-background relative overflow-hidden min-h-[300px] lg:border-r border-slate-200 dark:border-border">
                <img
                  src={spotlightPost.banner || 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&auto=format&fit=crop&q=80'}
                  alt={spotlightPost.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-101"
                />
                {spotlightPost.collections && spotlightPost.collections.length > 0 && (
                  <div className="absolute top-5 left-5 flex flex-wrap gap-2">
                    {spotlightPost.collections.slice(0, 2).map(c => (
                      <span key={c.id} className="bg-primary text-white text-xs font-black px-4 py-2 rounded-xl uppercase tracking-wider shadow-none">
                        {c.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="lg:w-2/5 p-8 md:p-10 flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <Link to={`/posts/${spotlightPost.slug || spotlightPost.id}`} className="block">
                    <h3 className="text-2xl md:text-3xl font-black font-heading text-black dark:text-foreground leading-tight group-hover:text-primary transition-colors">
                      {spotlightPost.title}
                    </h3>
                  </Link>
                  <p className="text-slate-650 dark:text-muted-foreground text-base leading-relaxed font-bold">
                    {spotlightPost.summary || 'Detailed architecture reviews, scaling benchmarks, state management optimizations, and core security configurations engineered for deployment-ready applications.'}
                  </p>
                </div>

                <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-border/50">
                  <div className="flex flex-wrap items-center gap-4 text-sm font-extrabold text-black dark:text-muted-foreground">
                    <span className="flex items-center gap-2">
                      <Calendar className="w-4.5 h-4.5 text-black dark:text-muted-foreground" />
                      {spotlightPost.publishedAt ? new Date(spotlightPost.publishedAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      }) : 'Draft'}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-2">
                      <Clock className="w-4.5 h-4.5 text-black dark:text-muted-foreground" />
                      10 min read
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <Link to={`/posts/${spotlightPost.slug || spotlightPost.id}`} className="inline-flex items-center gap-2 text-sm font-black text-primary uppercase tracking-wider hover:underline pb-0.5">
                      Read More <ArrowRight className="w-4.5 h-4.5" />
                    </Link>
                    
                    <div className="flex items-center gap-2.5">
                      <button onClick={() => handleCopyLink(spotlightPost.slug || spotlightPost.id.toString())} className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:text-primary transition-colors cursor-pointer border-0 bg-transparent" title="Copy Link">
                        <Share2 className="w-4 h-4 text-black dark:text-foreground" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          )}

          {/* Sub-grid of secondary articles in a full width grid (No Sidebar) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {secondaryPosts.map((post, index) => (
              <article
                key={post.id}
                className={`border border-slate-355 dark:border-border rounded-2xl overflow-hidden bg-white dark:bg-card flex flex-col group transition-all duration-300 animate-fade-up ${
                  index % 3 === 0 ? 'delay-75' : index % 3 === 1 ? 'delay-150' : 'delay-300'
                }`}
              >
                <div className="aspect-[16/10] w-full bg-slate-50 dark:bg-background relative overflow-hidden border-b border-slate-200 dark:border-border">
                  <img
                    src={post.banner || 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&auto=format&fit=crop&q=80'}
                    alt={post.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-101"
                  />
                  {post.collections && post.collections.length > 0 && (
                    <div className="absolute top-4 left-4 flex flex-wrap gap-1.5">
                      {post.collections.slice(0, 2).map(c => (
                        <span key={c.id} className="bg-primary text-white text-[10px] font-black px-3.5 py-1.5 rounded-xl uppercase tracking-wider shadow-none">
                          {c.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="p-6 flex-grow flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <Link to={`/posts/${post.slug || post.id}`} className="block">
                      <h4 className="text-lg font-black font-heading text-black dark:text-foreground leading-snug group-hover:text-primary transition-colors line-clamp-2">
                        {post.title}
                      </h4>
                    </Link>
                    <div className="flex flex-wrap gap-1.5">
                      {post.tags.map(t => (
                        <span key={t.id} className="text-[10px] bg-slate-100 dark:bg-background px-2.5 py-1 rounded-md text-black dark:text-slate-350 font-bold">
                          #{t.name}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 dark:border-border/50 flex items-center justify-between text-xs font-bold text-black dark:text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-black dark:text-muted-foreground" />
                      <span>{post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric'
                      }) : 'Draft'}</span>
                    </div>
                    <span className="text-black dark:text-slate-350">By {post.author.name}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};
