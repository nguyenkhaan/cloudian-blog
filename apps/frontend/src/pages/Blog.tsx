import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getPostsApi, getCollectionsApi } from '../api/post';
import { SubscribeModal } from '../components/SubscribeModal';
import type { Post, Collection } from '../types/post';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { NewsletterSection } from '../components/NewsletterSection';
import { BlogFilters } from '../components/blog/BlogFilters';
import { Pagination } from '../components/blog/Pagination';
import { BlogCardSkeleton } from '../components/ui/Skeleton';
import { 
  ArrowRight, 
  Calendar, 
  Clock
} from 'lucide-react';

export const Blog: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [isSubscribeOpen, setIsSubscribeOpen] = useState(false);

  const [posts, setPosts] = useState<Post[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [selectedCollection, setSelectedCollection] = useState<number | null>(null);

  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const postsLimit = 9;

  const collectionParam = searchParams.get('collection');
  const keywordParam = searchParams.get('keyword');

  useEffect(() => {
    if (collectionParam) {
      setSelectedCollection(parseInt(collectionParam, 10));
    } else {
      setSelectedCollection(null);
    }
  }, [collectionParam]);

  useEffect(() => {
    if (keywordParam) {
      setSearch(keywordParam);
    }
  }, [keywordParam]);

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const collectionsData = await getCollectionsApi();
        setCollections(collectionsData);
      } catch (err) {
        console.error('Failed to load collections:', err);
      }
    };
    fetchMetadata();
  }, []);

  // Reset page to 1 whenever filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedCollection]);

  useEffect(() => {
    const fetchPosts = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getPostsApi({
          keyword: search || undefined,
          collection: selectedCollection ? selectedCollection.toString() : undefined,
          limit: postsLimit,
          offset: (currentPage - 1) * postsLimit,
        });
        setPosts(data);
      } catch (err) {
        setError('Failed to load blogs. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    const delayDebounce = setTimeout(() => {
      fetchPosts();
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [search, selectedCollection, currentPage]);

  const handleCollectionSelect = (id: number | null) => {
    const params: { [key: string]: string } = {};
    if (id !== null) {
      params.collection = id.toString();
    }
    if (search.trim()) {
      params.keyword = search.trim();
    }
    setSearchParams(params);
    setSelectedCollection(id);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearch(val);
    
    const params: { [key: string]: string } = {};
    if (selectedCollection !== null) {
      params.collection = selectedCollection.toString();
    }
    if (val.trim()) {
      params.keyword = val.trim();
    }
    setSearchParams(params);
  };




  const getCollectionBadgeStyle = (name: string) => {
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const styles = [
      'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-300 border border-blue-100 dark:border-blue-900/50',
      'bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-300 border border-purple-100 dark:border-purple-900/50',
      'bg-pink-50 dark:bg-pink-950/40 text-pink-600 dark:text-pink-300 border border-pink-100 dark:border-pink-900/50',
      'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-900/50',
      'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-300 border border-amber-100 dark:border-amber-900/50',
    ];
    return styles[hash % styles.length];
  };

  return (
    <div className="min-h-screen bg-white dark:bg-background flex flex-col font-sans transition-colors duration-300">
      
      <Navbar activeTab="blog" onSubscribe={() => setIsSubscribeOpen(true)} />

      {/* Breadcrumb line */}
      <div className="bg-slate-50 dark:bg-card border-b border-slate-200 dark:border-border transition-colors duration-300">
        <div className="max-w-[1600px] mx-auto px-6 py-4 flex items-center gap-2 text-sm text-slate-500 font-extrabold">
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          <span>&gt;</span>
          <span className="text-black dark:text-slate-350 font-black">Blogs</span>
        </div>
      </div>

      <main className="flex-grow max-w-[1600px] w-full mx-auto px-6 py-12 space-y-12">
        
        {/* Page Section Header - Flat Heading */}
        <section className="space-y-4">
          <h1 className="text-3xl md:text-5xl font-black text-black dark:text-foreground tracking-tight leading-none font-heading">
            All Blogs
          </h1>
        </section>

        <BlogFilters
          search={search}
          handleSearchChange={handleSearchChange}
          selectedCollection={selectedCollection}
          handleCollectionSelect={handleCollectionSelect}
          collections={collections}
        />

        {/* Dynamic Articles grid view */}
        {error && (
          <div className="p-6 rounded-xl bg-red-50 border border-red-100 text-red-600 text-center font-bold">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <BlogCardSkeleton key={i} />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-24 bg-white dark:bg-card border border-dashed border-slate-300 dark:border-border p-8 rounded-2xl">
            <p className="text-slate-500 dark:text-muted-foreground font-black text-base">No blogs found matching your query.</p>
          </div>
        ) : (
          <div className="space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post) => {
                const formattedDate = post.publishedAt
                  ? new Date(post.publishedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })
                  : 'Draft';

                return (
                  <article key={post.id} className="bg-white dark:bg-card border border-slate-355 dark:border-border rounded-2xl overflow-hidden hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between h-full group shadow-none">
                    <div>
                      <div className="aspect-[16/10] w-full bg-slate-50 dark:bg-background relative overflow-hidden border-b border-slate-200 dark:border-border">
                        <img
                          src={post.banner || 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=500&auto=format&fit=crop&q=80'}
                          alt={post.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-101"
                          loading="lazy"
                        />
                        {post.collections && post.collections.length > 0 && (
                          <div className="absolute top-4 left-4 flex flex-wrap gap-1.5">
                            {post.collections.slice(0, 2).map(c => (
                              <span key={c.id} className={`inline-block text-[10px] font-black px-3.5 py-1.5 rounded-xl uppercase tracking-wider ${getCollectionBadgeStyle(c.name)}`}>
                                {c.name}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="p-6 space-y-4">
                        <Link to={`/posts/${post.slug || post.id}`} className="block">
                          <h4 className="text-xl font-black font-heading text-black dark:text-foreground leading-snug group-hover:text-primary transition-colors line-clamp-2">
                            {post.title}
                          </h4>
                        </Link>
                        <p className="text-slate-600 dark:text-muted-foreground text-sm leading-relaxed line-clamp-3 font-bold">
                          {post.summary || 'Detailed architecture reviews, scaling benchmarks, state management optimizations, and core security configurations engineered for deployment-ready applications.'}
                        </p>

                        <div className="flex items-center gap-4 text-xs font-bold text-slate-500 dark:text-muted-foreground pt-1">
                          <span className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            {formattedDate}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            8 min read
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="p-6 pt-0 border-t border-slate-100 dark:border-border/50 flex items-center justify-between mt-auto">
                      <div className="flex items-center gap-1 text-slate-500 dark:text-muted-foreground text-xs font-bold">
                        <span>By</span>
                        <span className="text-xs font-black text-black dark:text-slate-355">
                          {post.author?.name || 'Engineer'}
                        </span>
                      </div>
                      <Link 
                        to={`/posts/${post.slug || post.id}`} 
                        className="text-xs font-black text-primary hover:underline flex items-center gap-0.5"
                      >
                        Read More <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>

            <Pagination
              currentPage={currentPage}
              onPageChange={setCurrentPage}
              hasMore={posts.length >= postsLimit}
              isLoading={isLoading}
            />
          </div>
        )}

        <NewsletterSection />

        {/* Quote Section */}
        <section className="py-16 border-t border-slate-200 dark:border-border text-center">
          <p className="text-2xl md:text-3xl lg:text-4xl font-extrabold italic font-heading text-slate-800 dark:text-foreground max-w-4xl mx-auto leading-relaxed">
            "A jump to the sky turns to Take off, Toward Dream."
          </p>
        </section>

      </main>

      <Footer />
      <SubscribeModal isOpen={isSubscribeOpen} onClose={() => setIsSubscribeOpen(false)} />
    </div>
  );
};
export default Blog;
