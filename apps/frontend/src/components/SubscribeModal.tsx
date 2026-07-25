import React, { useState } from 'react';
import { subscribeApi } from '../api/subscriber';
import { Button } from './ui/button';
import { X, Mail, ShieldCheck, Loader2 } from 'lucide-react';
import { useToast } from '../hooks/useToast';

interface SubscribeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SubscribeModal: React.FC<SubscribeModalProps> = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !name.trim()) {
      setError('Please fill in both name and email address.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await subscribeApi({
        email: email.trim(),
        name: name.trim(),
      });
      setIsSuccess(true);
      toast({
        description: 'Thank you for subscribing to CloudianZea!',
        variant: 'success',
      });
      setTimeout(() => {
        setIsSuccess(false);
        setEmail('');
        setName('');
        onClose();
      }, 2500);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to subscribe. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-card w-full max-w-md rounded-2xl border border-slate-100 dark:border-border shadow-xl overflow-hidden flex flex-col transform transition-all scale-100 scale-in duration-200">
        
        {/* Modal Header */}
        <div className="border-b border-slate-100 dark:border-border px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-800 dark:text-foreground">
            <Mail className="w-5 h-5 text-primary" />
            <h3 className="font-bold text-base font-heading">Subscribe Newsletter</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content */}
        {isSuccess ? (
          <div className="p-8 flex flex-col items-center justify-center text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-green-50 dark:bg-green-950/40 text-green-600 dark:text-green-400 flex items-center justify-center shadow-sm">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-slate-800 dark:text-foreground text-base">Subscription Confirmed!</h4>
            <p className="text-xs text-slate-400 dark:text-muted-foreground max-w-xs leading-relaxed">
              We have sent a welcome newsletter to <strong className="text-slate-600 dark:text-foreground">{email}</strong>. Stay tuned for modern tech updates!
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <p className="text-xs text-slate-500 dark:text-muted-foreground leading-relaxed">
              Join our mailing list to receive deep dives on systems architecture, visual design tips, and latest blogs straight to your inbox.
            </p>

            {error && (
              <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/50 text-red-600 dark:text-red-400 text-xs font-semibold">
                {error}
              </div>
            )}

            <div className="space-y-3">
              {/* Name Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-350">Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. John Doe"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-background border border-slate-200 dark:border-border rounded-xl focus:outline-none focus:ring-1 focus:ring-primary text-xs text-slate-800 dark:text-foreground"
                />
              </div>

              {/* Email Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-350">Email Address</label>
                <input
                  type="email"
                  placeholder="e.g. john@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-background border border-slate-200 dark:border-border rounded-xl focus:outline-none focus:ring-1 focus:ring-primary text-xs text-slate-800 dark:text-foreground"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-border/50">
              <Button
                type="button"
                variant="ghost"
                onClick={onClose}
                disabled={isSubmitting}
                className="text-slate-500 dark:text-muted-foreground hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold px-4 py-2.5 rounded-xl"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-primary hover:opacity-95 text-white text-xs font-bold px-5 py-2.5 rounded-xl flex items-center gap-1.5 shadow-sm"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Subscribing...
                  </>
                ) : (
                  'Subscribe Now'
                )}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
