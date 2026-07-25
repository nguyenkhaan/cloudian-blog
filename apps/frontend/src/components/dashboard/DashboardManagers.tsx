import React from 'react';
import { Button } from '../ui/button';
import { Mail, KeyRound, Loader2, CheckCircle } from 'lucide-react';

interface DashboardManagersProps {
  managerName: string;
  setManagerName: (val: string) => void;
  managerNickname: string;
  setManagerNickname: (val: string) => void;
  managerEmail: string;
  setManagerEmail: (val: string) => void;
  managerPassword: string;
  setManagerPassword: (val: string) => void;
  isCreatingManager: boolean;
  managerSuccessMsg: string | null;
  handleCreateManager: (e: React.FormEvent) => Promise<void>;
}

export const DashboardManagers: React.FC<DashboardManagersProps> = ({
  managerName,
  setManagerName,
  managerNickname,
  setManagerNickname,
  managerEmail,
  setManagerEmail,
  managerPassword,
  setManagerPassword,
  isCreatingManager,
  managerSuccessMsg,
  handleCreateManager
}) => {
  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      <div>
        <h2 className="text-2xl font-black text-slate-800 dark:text-foreground tracking-tight font-heading">
          Create Manager Account
        </h2>
      </div>

      <div className="max-w-xl bg-white dark:bg-card border border-slate-200 dark:border-border rounded-2xl p-6 md:p-8 shadow-none space-y-6 transition-colors duration-300">
        {managerSuccessMsg && (
          <div className="p-4 bg-green-50 dark:bg-green-950/30 border border-green-100 dark:border-green-900/50 text-green-700 dark:text-green-400 rounded-xl text-sm font-bold flex items-start gap-2.5">
            <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <span>{managerSuccessMsg}</span>
          </div>
        )}

        <form onSubmit={handleCreateManager} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-350 block">Full Name</label>
              <input
                type="text"
                required
                placeholder="John Doe"
                value={managerName}
                onChange={(e) => setManagerName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-border bg-white dark:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm text-slate-800 dark:text-foreground font-semibold placeholder:text-slate-400 transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-350 block">Nickname</label>
              <input
                type="text"
                placeholder="john_writer"
                value={managerNickname}
                onChange={(e) => setManagerNickname(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-border bg-white dark:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm text-slate-800 dark:text-foreground font-semibold placeholder:text-slate-400 transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-350 block">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="email"
                required
                placeholder="manager@company.com"
                value={managerEmail}
                onChange={(e) => setManagerEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-border bg-white dark:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm text-slate-800 dark:text-foreground font-semibold placeholder:text-slate-400 transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-350 block">Initial Password</label>
            <div className="relative">
              <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={managerPassword}
                onChange={(e) => setManagerPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-border bg-white dark:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm text-slate-800 dark:text-foreground font-semibold placeholder:text-slate-400 transition-all"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <Button
              type="submit"
              disabled={isCreatingManager}
              className="bg-primary hover:opacity-95 text-white font-semibold text-xs rounded-xl px-5 py-3 cursor-pointer shadow-none"
            >
              {isCreatingManager ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                'Create Manager Account'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
