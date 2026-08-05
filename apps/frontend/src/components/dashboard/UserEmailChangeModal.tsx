import React from 'react';
import { Mail, Loader2, ShieldAlert } from 'lucide-react';
import { Button } from '../ui/button';
import type { AdminUserItem } from '../../api/admin';

interface UserEmailChangeModalProps {
  isOpen: boolean;
  user: AdminUserItem | null;
  email: string;
  setEmail: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  isSubmitting: boolean;
  errorMessage?: string | null;
}

export const UserEmailChangeModal: React.FC<UserEmailChangeModalProps> = ({
  isOpen,
  user,
  email,
  setEmail,
  onSubmit,
  onCancel,
  isSubmitting,
  errorMessage,
}) => {
  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        role="dialog"
        aria-modal="true"
        className="w-full max-w-lg bg-white dark:bg-card border border-slate-200 dark:border-border rounded-2xl p-6 shadow-2xl space-y-6 animate-in zoom-in-95 duration-200"
      >
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-lg font-black text-slate-800 dark:text-foreground tracking-tight">
              Edit user email
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
              The current email stays active until the user verifies the new inbox. We will send the confirmation link to the new address.
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-border bg-slate-50/80 dark:bg-slate-900/30 p-4 space-y-1.5">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Selected user</div>
          <div className="font-black text-slate-800 dark:text-foreground">{user.name}</div>
          <div className="text-sm text-slate-500 dark:text-slate-400">{user.email}</div>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-350 block">
              New email address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="new-email@example.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-border bg-white dark:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm text-slate-800 dark:text-foreground font-semibold placeholder:text-slate-400 transition-all"
              />
            </div>
            {errorMessage && (
              <p className="text-xs font-semibold text-red-600 dark:text-red-400">{errorMessage}</p>
            )}
          </div>

          <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="w-full sm:w-auto px-5 py-3 rounded-xl border border-slate-200 dark:border-border text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 shadow-none cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto bg-primary hover:opacity-95 text-white font-semibold text-xs rounded-xl px-5 py-3 cursor-pointer shadow-none"
            >
              {isSubmitting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                'Send verification email'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
