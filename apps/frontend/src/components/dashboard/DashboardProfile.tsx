import React from 'react';
import { Button } from '../ui/button';
import { LogOut, Loader2, Check, ShieldCheck, MailCheck } from 'lucide-react';
import type { User } from '../../types/auth';
import type { ReportItem } from '../../api/admin';
import type { Post } from '../../types/post';
import type { EmailChangeVerificationTarget } from '../../utils/emailChange';
import {
  getEmailChangeTargetDescription,
  getEmailChangeTargetLabel,
} from '../../utils/emailChange';

interface DashboardProfileProps {
  user: User | null;
  isAdmin: boolean;
  isManager: boolean;
  reports: ReportItem[];
  managerPosts: Post[];
  editName: string;
  setEditName: (val: string) => void;
  editNickname: string;
  setEditNickname: (val: string) => void;
  editEmail: string;
  setEditEmail: (val: string) => void;
  emailVerificationTarget: EmailChangeVerificationTarget;
  setEmailVerificationTarget: (val: EmailChangeVerificationTarget) => void;
  emailChangeNotice: string | null;
  emailChangeError: string | null;
  isSavingProfile: boolean;
  handleUpdateProfile: (e: React.FormEvent) => void;
  handleEmailUpdateSubmit: (e: React.FormEvent) => void;
  handleTriggerPasswordReset: () => void;
  setIsSignOutModalOpen: (val: boolean) => void;
  isChatbotEnabled?: boolean;
  onToggleChatbot?: () => void;
}

export const DashboardProfile: React.FC<DashboardProfileProps> = ({
  user,
  isAdmin,
  isManager,
  reports,
  managerPosts,
  editName,
  setEditName,
  editNickname,
  setEditNickname,
  editEmail,
  setEditEmail,
  emailVerificationTarget,
  setEmailVerificationTarget,
  emailChangeNotice,
  emailChangeError,
  isSavingProfile,
  handleUpdateProfile,
  handleEmailUpdateSubmit,
  handleTriggerPasswordReset,
  setIsSignOutModalOpen,
  isChatbotEnabled = true,
  onToggleChatbot
}) => {
  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      <div>
        <h2 className="text-2xl font-black text-slate-800 dark:text-foreground tracking-tight font-heading">
          My Account Profile
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="lg:col-span-1 bg-white dark:bg-card border border-slate-200 dark:border-border rounded-2xl p-6 text-center space-y-6 transition-colors duration-300 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-primary text-2xl font-black border border-primary/20 mx-auto shadow-none">
              {user?.name ? user.name[0].toUpperCase() : 'U'}
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-800 dark:text-foreground">
                {user?.name || 'User'}
              </h3>
              <span className="text-xs text-slate-400 mt-1 inline-block">{user?.email}</span>
            </div>
            <div className="pt-4 border-t border-slate-100 dark:border-border/50 flex flex-wrap justify-center gap-1.5">
              {isAdmin && (
                <span className="px-2.5 py-1 rounded bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 border border-red-100 dark:border-red-900/50 text-[10px] font-black uppercase tracking-wider">
                  Administrator
                </span>
              )}
              {isManager && (
                <span className="px-2.5 py-1 rounded bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 border border-blue-100 dark:border-blue-900/50 text-[10px] font-black uppercase tracking-wider">
                  Content Creator
                </span>
              )}
              <span className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-655 dark:text-slate-350 border border-slate-200 dark:border-border text-[10px] font-black uppercase tracking-wider">
                User
              </span>
            </div>
            <div className="pt-4 border-t border-slate-100 dark:border-border/50 text-left space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-505 dark:text-slate-400">
                <span>Account Status:</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                  user?.active !== 0
                    ? 'bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-450 border border-green-105 dark:border-green-900/50'
                    : 'bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-450 border border-red-105 dark:border-green-900/50'
                }`}>
                  {user?.active !== 0 ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs font-bold text-slate-505 dark:text-slate-400">
                <span>Approval Status:</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                  user?.approve !== 0
                    ? 'bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-450 border border-green-105 dark:border-green-900/50'
                    : 'bg-amber-50 text-amber-700 dark:bg-amber-955/20 dark:text-amber-450 border border-amber-105 dark:border-amber-900/50'
                }`}>
                  {user?.approve !== 0 ? 'Approved' : 'Pending'}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsSignOutModalOpen(true)}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 border border-red-200 transition-all cursor-pointer mt-4 bg-transparent"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out Account</span>
          </button>
        </div>

        {/* Settings & Info Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* <div className="rounded-2xl border border-slate-200 dark:border-border bg-slate-50/70 dark:bg-card/70 p-5 space-y-3">
            <div className="flex items-center gap-2 text-slate-800 dark:text-foreground">
              <MailCheck className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-black tracking-tight">Email change flow</h3>
            </div>
            <div className="grid gap-2 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
              <p>1. We keep your current email active until verification completes.</p>
              <p>2. We send the primary confirmation link to the current inbox.</p>
              <p>3. If you cannot access that inbox, switch to the fallback verification path.</p>
            </div>
          </div> */}

          {/* Edit Profile Form */}
          <div className="bg-white dark:bg-card border border-slate-200 dark:border-border rounded-2xl p-6 transition-colors duration-300 space-y-4">
            <h3 className="font-extrabold text-base text-slate-800 dark:text-foreground">Edit Account Information</h3>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-350 block">Name</label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-4 py-3 bg-white dark:bg-background border border-slate-300 dark:border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm text-black dark:text-foreground font-semibold"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-350 block">Nickname</label>
                  <input
                    type="text"
                    value={editNickname}
                    onChange={(e) => setEditNickname(e.target.value)}
                    placeholder="Choose nickname"
                    className="w-full px-4 py-3 bg-white dark:bg-background border border-slate-300 dark:border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm text-black dark:text-foreground font-semibold"
                  />
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <Button
                  type="submit"
                  disabled={isSavingProfile}
                  className="bg-primary hover:opacity-95 text-white font-black text-sm rounded-xl px-5 py-3 shadow-none flex items-center gap-1.5 cursor-pointer"
                >
                  {isSavingProfile ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Check className="w-4 h-4" /> Save Profile
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>

          {/* Change Email Section */}
          <div className="bg-white dark:bg-card border border-slate-200 dark:border-border rounded-2xl p-6 transition-colors duration-300 space-y-4">
            <h3 className="font-extrabold text-base text-slate-800 dark:text-foreground">Change Email Address</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              You do not need to enter a password. Choose the inbox that can still receive the confirmation link.
            </p>
            {emailChangeNotice && (
              <div className="rounded-xl border border-emerald-100 bg-emerald-50/80 dark:bg-emerald-950/20 dark:border-emerald-900/40 p-4 text-sm text-slate-700 dark:text-slate-200">
                <div className="flex items-start gap-2.5">
                  <MailCheck className="w-4.5 h-4.5 text-emerald-600 mt-0.5" />
                  <p className="leading-relaxed">{emailChangeNotice}</p>
                </div>
              </div>
            )}
            {emailChangeError && (
              <div className="rounded-xl border border-red-100 bg-red-50/80 dark:bg-red-950/20 dark:border-red-900/40 p-4 text-sm text-red-700 dark:text-red-300">
                <p className="leading-relaxed font-medium">{emailChangeError}</p>
              </div>
            )}
            <form onSubmit={handleEmailUpdateSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-350 block">New Email Address</label>
                <input
                  type="email"
                  required
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-white dark:bg-background border border-slate-300 dark:border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm text-black dark:text-foreground font-semibold"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-350 block">
                  Verification method
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {(['old', 'new'] as EmailChangeVerificationTarget[]).map((target) => {
                    const active = emailVerificationTarget === target;
                    return (
                      <button
                        key={target}
                        type="button"
                        onClick={() => setEmailVerificationTarget(target)}
                        className={`text-left rounded-2xl border p-4 transition-all cursor-pointer ${
                          active
                            ? 'border-primary bg-primary/5 shadow-sm'
                            : 'border-slate-200 dark:border-border bg-white dark:bg-background hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-start gap-2.5">
                          <div className={`mt-0.5 rounded-full p-1 ${
                            active ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-300'
                          }`}>
                            {target === 'old' ? <ShieldCheck className="w-3.5 h-3.5" /> : <MailCheck className="w-3.5 h-3.5" />}
                          </div>
                          <div className="space-y-1">
                            <div className="text-sm font-extrabold text-slate-800 dark:text-foreground">
                              {getEmailChangeTargetLabel(target)}
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                              {getEmailChangeTargetDescription(target)}
                            </p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={isSavingProfile}
                  className="bg-primary hover:opacity-95 text-white font-black text-sm rounded-xl px-5 py-3 shadow-none flex items-center gap-1.5 cursor-pointer"
                >
                  {isSavingProfile ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    'Send Verification Link'
                  )}
                </Button>
              </div>
            </form>
          </div>

          {/* Security / Password Section */}
          <div className="bg-white dark:bg-card border border-slate-200 dark:border-border rounded-2xl p-6 transition-colors duration-300 space-y-4">
            <h3 className="font-extrabold text-base text-slate-800 dark:text-foreground">Security Settings</h3>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-sm font-extrabold text-slate-800 dark:text-foreground block">Change Password</span>
                <span className="text-xs text-slate-400 block leading-tight">
                  Receive a secure link in your email to reset your account password.
                </span>
              </div>
              <Button
                type="button"
                onClick={handleTriggerPasswordReset}
                disabled={isSavingProfile}
                className="bg-primary hover:opacity-95 text-white font-black text-sm rounded-xl px-5 py-3 shadow-none cursor-pointer self-start sm:self-auto"
              >
                Change Password
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {isAdmin && (
              <>
                <div className="bg-white dark:bg-card border border-slate-200 dark:border-border rounded-2xl p-5 transition-colors duration-300">
                  <span className="text-xs font-bold text-slate-405 block uppercase tracking-wider">
                    Reports Pending
                  </span>
                  <span className="text-3xl font-black text-slate-800 dark:text-foreground mt-2 block">
                    {reports.filter(r => r.status === 'pending').length}
                  </span>
                </div>
                
                <div className="bg-white dark:bg-card border border-slate-200 dark:border-border rounded-2xl p-5 transition-colors duration-300 flex flex-col justify-center">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-405 uppercase tracking-wider">
                        AI Assistant Toggle
                      </span>
                      <button
                        type="button"
                        onClick={onToggleChatbot}
                        className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 border-0 ${
                          isChatbotEnabled ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-700'
                        }`}
                      >
                        <div
                          className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${
                            isChatbotEnabled ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                    <span className="text-[11px] text-slate-400 block leading-tight">
                      Enable or disable floating chatbot globally
                    </span>
                  </div>
                </div>
              </>
            )}

            {isManager && (
              <div className="bg-white dark:bg-card border border-slate-200 dark:border-border rounded-2xl p-5 transition-colors duration-300">
                <span className="text-xs font-bold text-slate-405 block uppercase tracking-wider">
                  My Blogs
                </span>
                <span className="text-3xl font-black text-slate-800 dark:text-foreground mt-2 block">
                  {managerPosts.length}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
