import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { SubscribeModal } from '../components/SubscribeModal';

import type { Post } from '../types/post';
import { getPostsApi } from '../api/post';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { NewsletterSection } from '../components/NewsletterSection';
import { HomeHero } from '../components/home/HomeHero';
import { HomeArticles } from '../components/home/HomeArticles';
import { motion } from 'framer-motion';

export const Home: React.FC = () => {
  const { openLoginModal } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    if (searchParams.get('login') === 'true') {
      openLoginModal();
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('login');
      setSearchParams(newParams, { replace: true });
    }
  }, [searchParams, openLoginModal, setSearchParams]);

  const [isSubscribeOpen, setIsSubscribeOpen] = useState(false);

  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const loadPosts = async () => {
      try {
        setIsLoading(true);
        const data = await getPostsApi({ limit: 10 });
        if (active) {
          setPosts(data);
        }
      } catch (err) {
        console.error('Failed to load posts', err);
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };
    loadPosts();
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-background flex flex-col font-sans transition-colors duration-300">
      
      <Navbar activeTab="home" onSubscribe={() => setIsSubscribeOpen(true)} />

      <HomeHero />

      {/* Main Grid Content */}
      <main className="flex-grow max-w-[1600px] w-full mx-auto px-6 py-16 space-y-20">
        
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ type: "spring", stiffness: 45, damping: 14 }}
        >
          <HomeArticles
            posts={posts}
            isLoading={isLoading}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ type: "spring", stiffness: 45, damping: 14, delay: 0.1 }}
        >
          <NewsletterSection />
        </motion.div>

        {/* Quote Section */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ type: "spring", stiffness: 40, damping: 15, delay: 0.2 }}
          className="py-16 border-t border-slate-200 dark:border-border text-center"
        >
          <p className="text-2xl md:text-3xl lg:text-4xl font-extrabold italic font-heading text-slate-800 dark:text-foreground max-w-4xl mx-auto leading-relaxed">
            "A jump to the sky turns to Take off, Toward Dream."
          </p>
        </motion.section>

      </main>

      <Footer />
      <SubscribeModal isOpen={isSubscribeOpen} onClose={() => setIsSubscribeOpen(false)} />
    </div>
  );
};
export default Home;
