import React, { useState } from 'react';
import { Button } from './ui/button';
import { useToast } from '../hooks/useToast';
import { subscribeApi } from '../api/subscriber';
import { getErrorMessage } from '../utils/errors';

export const NewsletterSection: React.FC = () => {
  const { toast } = useToast();
  const [newsletterName, setNewsletterName] = useState('');
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim() || !newsletterName.trim()) return;
    setIsSubmitting(true);
    try {
      await subscribeApi({
        email: newsletterEmail.trim(),
        name: newsletterName.trim(),
      });
      toast({
        description: 'Thank you! You have successfully subscribed to our newsletter.',
        variant: 'success',
      });
      setNewsletterName('');
      setNewsletterEmail('');
    } catch (err: any) {
      toast({
        description: getErrorMessage(err, 'Subscription failed. Please try again.'),
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="bg-slate-50 dark:bg-card border border-slate-350 dark:border-border rounded-2xl p-8 md:p-10 space-y-6 transition-colors duration-300">
      <div>
        <h2 className="text-2xl md:text-3xl font-black text-black dark:text-foreground font-heading">
          Subscribe to Newsletter
        </h2>
      </div>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
        <div className="space-y-2">
          <label className="text-sm font-extrabold text-black dark:text-slate-300 block">
            Full Name
          </label>
          <input
            type="text"
            placeholder="Enter your name..."
            required
            value={newsletterName}
            onChange={(e) => setNewsletterName(e.target.value)}
            disabled={isSubmitting}
            className="w-full px-4 py-3.5 bg-white dark:bg-background border border-slate-400 dark:border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm text-black dark:text-foreground disabled:opacity-60 transition-all placeholder:text-slate-500 font-semibold"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-extrabold text-black dark:text-slate-300 block">
            Email Address
          </label>
          <input
            type="email"
            placeholder="Enter your email..."
            required
            value={newsletterEmail}
            onChange={(e) => setNewsletterEmail(e.target.value)}
            disabled={isSubmitting}
            className="w-full px-4 py-3.5 bg-white dark:bg-background border border-slate-400 dark:border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm text-black dark:text-foreground disabled:opacity-60 transition-all placeholder:text-slate-500 font-semibold"
          />
        </div>
        <div>
          <Button type="submit" disabled={isSubmitting} className="w-full bg-primary hover:opacity-95 text-white font-black py-4 rounded-xl text-base shadow-none cursor-pointer min-h-[48px]">
            {isSubmitting ? 'Subscribing...' : 'Subscribe'}
          </Button>
        </div>
      </form>
    </section>
  );
};
