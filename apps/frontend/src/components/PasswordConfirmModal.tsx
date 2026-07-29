import React, { useState } from 'react';
import { KeyRound, X, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { getErrorMessage } from '../utils/errors';

interface PasswordConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (password: string) => Promise<void>;
}

export const PasswordConfirmModal: React.FC<PasswordConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setError('Please enter your current password.');
      return;
    }
    setError(null);
    setIsSubmitting(true);
    try {
      await onConfirm(password);
      setPassword('');
      onClose();
    } catch (err: any) {
      setError(getErrorMessage(err, 'Incorrect password.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setPassword('');
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-card w-full max-w-md rounded-2xl border border-slate-200 dark:border-border shadow-xl overflow-hidden flex flex-col transform transition-all scale-100 scale-in duration-200">
        
        {/* Header */}
        <div className="border-b border-slate-200 dark:border-border px-6 py-4 flex items-center justify-between bg-white dark:bg-card">
          <div className="flex items-center gap-2.5 text-black dark:text-foreground">
            <KeyRound className="w-5.5 h-5.5 text-primary" />
            <h3 className="font-black text-lg font-heading tracking-tight text-black dark:text-foreground">
              Confirm Password
            </h3>
          </div>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-black dark:text-foreground transition-colors disabled:opacity-50 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 bg-white dark:bg-card">
          <p className="text-xs text-slate-450 dark:text-muted-foreground leading-relaxed">
            For security, please enter your current password to confirm your email change.
          </p>

          {error && (
            <div className="p-3 rounded-lg bg-red-100 dark:bg-red-955/20 border border-red-200 dark:border-red-900/40 text-red-700 dark:text-red-400 text-xs font-bold">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-700 dark:text-slate-355 block">
              Current Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              required
              value={password}
              disabled={isSubmitting}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-white dark:bg-background border border-slate-300 dark:border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-lg font-bold tracking-widest text-black dark:text-foreground disabled:opacity-60 transition-all"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-border/60">
            <Button
              type="button"
              variant="ghost"
              disabled={isSubmitting}
              onClick={handleClose}
              className="text-black dark:text-muted-foreground hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-extrabold px-4 py-2.5 rounded-xl cursor-pointer shadow-none"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className={`bg-primary hover:opacity-95 text-white text-xs font-black px-5 py-2.5 rounded-xl flex items-center justify-center gap-2 shadow-none cursor-pointer min-h-[38px] ${
                isSubmitting ? 'opacity-70 pointer-events-none' : ''
              }`}
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              Confirm
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
