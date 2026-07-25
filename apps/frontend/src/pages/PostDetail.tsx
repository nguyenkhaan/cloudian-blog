import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getPostDetailApi } from '../api/post';
import type { PostDetail as PostDetailType } from '../types/post';
import { useToast } from '../hooks/useToast';
import { Button } from '../components/ui/button';
import { SubscribeModal } from '../components/SubscribeModal';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { PostDetailHeader } from '../components/blog/PostDetailHeader';
import { PostDetailContent } from '../components/blog/PostDetailContent';
import { PostDetailSkeleton } from '../components/ui/Skeleton';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import hljs from 'highlight.js';
import 'highlight.js/styles/github-dark.css';
import {
  ArrowLeft,
  MessageSquare,
  AlertCircle
} from 'lucide-react';
import { CommentSection } from '../components/CommentSection';

export const PostDetail: React.FC = () => {
  const { slugOrId } = useParams<{ slugOrId: string }>();
  const { toast } = useToast();

  const [isSubscribeOpen, setIsSubscribeOpen] = useState(false);
  const [post, setPost] = useState<PostDetailType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const fetchPostDetail = async () => {
      if (!slugOrId) return;
      setIsLoading(true);
      setError(null);
      try {
        const data = await getPostDetailApi(slugOrId);
        setPost(data);
      } catch (err) {
        setError('Failed to load post content. Please check the URL.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchPostDetail();
  }, [slugOrId]);

  useEffect(() => {
    if (post) {
      (window as any).__activePostId = post.id;
    }
    return () => {
      delete (window as any).__activePostId;
    };
  }, [post]);

  useEffect(() => {
    if (post && !isLoading) {
      const timer = setTimeout(() => {
        document.querySelectorAll('.markdown-content pre code').forEach((block) => {
          hljs.highlightElement(block as HTMLElement);
        });
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [post, isLoading]);

  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (totalScroll > 0) {
        const progress = (window.scrollY / totalScroll) * 100;
        setScrollProgress(progress);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const getHtmlContent = (markdownText: string) => {
    const rawHtml = marked.parse(markdownText || '') as string;
    return DOMPurify.sanitize(rawHtml, {
      ADD_TAGS: ['pre', 'code', 'span'],
      ADD_ATTR: ['class', 'style'],
    });
  };

  const getReadingTime = (text: string) => {
    const wordsPerMinute = 200;
    const cleanText = text.replace(/[#*`_]/g, '');
    const words = cleanText.split(/\s+/).filter((w) => w.length > 0).length;
    return Math.max(1, Math.ceil(words / wordsPerMinute));
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      description: 'Blog link copied to clipboard!',
      variant: 'success',
    });
  };

  const defaultBanner = 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1200&auto=format&fit=crop&q=80';

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50/20 dark:bg-background flex flex-col transition-colors duration-300">
        <Navbar />
        <main className="flex-grow py-12">
          <PostDetailSkeleton />
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-slate-50/20 dark:bg-background flex flex-col items-center justify-center p-6 text-center gap-4 transition-colors duration-300">
        <div className="w-16 h-16 rounded-md bg-red-50 text-red-500 flex items-center justify-center border border-red-100">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-800 dark:text-foreground">An error occurred</h2>
        <p className="text-slate-500 max-w-sm">{error || 'Post not found.'}</p>
        <Link to="/">
          <Button className="bg-primary hover:bg-primary/90 text-white font-semibold flex items-center gap-1.5 px-4 rounded-md shadow-none">
            <ArrowLeft className="w-4 h-4" /> Go back to Homepage
          </Button>
        </Link>
      </div>
    );
  }

  const readingTime = getReadingTime(post.content || '');

  return (
    <div className="min-h-screen bg-white dark:bg-background flex flex-col font-sans transition-colors duration-300">

      {/* Scroll Progress Indicator */}
      <div
        className="fixed top-0 left-0 h-1 bg-primary z-50 transition-all duration-75"
        style={{ width: `${scrollProgress}%` }}
      />

      <Navbar activeTab="blog" homeLabel="Trang Chủ" blogsLabel="Bài Viết" onSubscribe={() => setIsSubscribeOpen(true)} />

      <main className="flex-grow max-w-[1600px] w-full mx-auto px-0 md:px-6 py-8 space-y-12">
        <div className="px-6 md:px-0 max-w-5xl mx-auto w-full">
          <Link to="/blog" className="inline-flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-primary transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to blogs list
          </Link>
        </div>

        {/* Light rounded-lg banner container */}
        <div className="aspect-[21/9] w-full md:rounded-2xl overflow-hidden bg-slate-100 dark:bg-card border-y md:border border-slate-200 dark:border-border shadow-none">
          <img
            src={post.banner || defaultBanner}
            alt={post.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Light rounded-lg article card */}
        <article className="bg-white dark:bg-card md:rounded-2xl border-y md:border border-slate-200 dark:border-border p-6 md:p-12 space-y-8 max-w-5xl mx-auto w-full transition-colors duration-300 shadow-none">
          <PostDetailHeader
            post={post}
            readingTime={readingTime}
            handleCopyLink={handleCopyLink}
          />

          <PostDetailContent
            contentHtml={getHtmlContent(post.content)}
            tags={post.tags || []}
          />
        </article>

        {/* Light rounded-lg comments container */}
        <section className="bg-white dark:bg-card md:rounded-2xl border-y md:border border-slate-200 dark:border-border p-6 md:p-12 space-y-6 max-w-5xl mx-auto w-full transition-colors duration-300 shadow-none">
          <h3 className="text-xl font-bold text-slate-800 dark:text-foreground flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary" />
            Comments
          </h3>
          <CommentSection postId={post.id} />
        </section>
      </main>

      <Footer />
      <SubscribeModal isOpen={isSubscribeOpen} onClose={() => setIsSubscribeOpen(false)} />
    </div>
  );
};
