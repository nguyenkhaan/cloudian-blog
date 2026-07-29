import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import type { CredentialResponse } from '@react-oauth/google';
import { useAuth } from '../hooks/useAuth';
import { Button } from './ui/button';
import { X, KeyRound, Mail, LogIn, Loader2, CheckCircle2 } from 'lucide-react';
import { useToast } from '../hooks/useToast';
import { forgotPasswordApi } from '../api/auth';
import { getErrorMessage } from '../utils/errors';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const { loginWithGoogle, loginLocal } = useAuth();
  const { toast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Password recovery states
  const [view, setView] = useState<'signin' | 'forgot'>('signin');
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState(false);

  if (!isOpen) return null;

  const handleClose = () => {
    setView('signin');
    setForgotEmail('');
    setForgotSuccess(false);
    setError(null);
    setEmail('');
    setPassword('');
    onClose();
  };

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    if (!credentialResponse.credential) {
      setError('Google login failed. Token not found.');
      return;
    }
    setError(null);
    setIsLoggingIn(true);
    try {
      await loginWithGoogle(credentialResponse.credential);
      toast({
        description: 'Welcome! Successfully signed in with Google.',
        variant: 'success',
      });
      handleClose();
    } catch (err: any) {
      setError(getErrorMessage(err, 'Google login failed. Please try again.'));
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLocalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both Email and Password.');
      return;
    }
    setError(null);
    setIsLoggingIn(true);
    try {
      const response = await loginLocal(email, password);
      toast({
        description: `Sign in successful! Welcome ${response.user.name}.`,
        variant: 'success',
      });
      handleClose();
    } catch (err: any) {
      setError(getErrorMessage(err, 'Incorrect email or password.'));
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) {
      setError('Please enter your email address.');
      return;
    }
    setError(null);
    setIsLoggingIn(true);
    try {
      await forgotPasswordApi(forgotEmail.trim());
      setForgotSuccess(true);
      toast({
        title: 'Email Sent',
        description: 'A password reset link has been sent to your email.',
        variant: 'success',
      });
    } catch (err: any) {
      setError(getErrorMessage(err, 'Failed to send reset link.'));
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-card w-full max-w-[460px] rounded-2xl border border-slate-200 dark:border-border shadow-lg overflow-hidden flex flex-col transform transition-all scale-100 scale-in duration-200">
        
        {/* Header */}
        <div className="border-b border-slate-200 dark:border-border px-8 py-6 flex items-center justify-between bg-white dark:bg-card">
          <div className="flex items-center gap-3 text-black dark:text-foreground">
            <LogIn className="w-6.5 h-6.5 text-primary" />
            <h3 className="font-black text-xl md:text-2xl font-heading tracking-tight text-black dark:text-foreground">
              {view === 'signin' ? 'Sign In to Account' : 'Forgot Password'}
            </h3>
          </div>
          <button
            onClick={handleClose}
            disabled={isLoggingIn}
            className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-black dark:text-foreground transition-colors disabled:opacity-50 cursor-pointer"
          >
            <X className="w-6.5 h-6.5" />
          </button>
        </div>

        {view === 'signin' ? (
          /* Modal Body - Sign In View */
          <div className="p-8 space-y-7 bg-white dark:bg-card">
            {error && (
              <div className="p-4.5 rounded-xl bg-red-100 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-red-955 dark:text-red-450 text-[15px] font-bold leading-relaxed">
                {error}
              </div>
            )}

            {/* Google Login block */}
            <div className="space-y-4">
              <div className="flex justify-center py-2.5 relative min-h-[56px] items-center">
                <div className={isLoggingIn ? 'opacity-40 pointer-events-none' : ''}>
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={() => setError('Google OAuth failed.')}
                    theme="outline"
                    size="large"
                    width="380"
                    useOneTap
                  />
                </div>
                {isLoggingIn && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/20 dark:bg-card/25 backdrop-blur-[0.5px]">
                    <Loader2 className="w-5.5 h-5.5 animate-spin text-primary" />
                  </div>
                )}
              </div>
            </div>

            <div className="relative flex items-center justify-center my-3">
              <span className="absolute inset-x-0 h-px bg-slate-200 dark:bg-border/70"></span>
              <span className="relative px-5 bg-white dark:bg-card text-sm font-black text-black dark:text-muted-foreground uppercase tracking-wider">
                Or use Email
              </span>
            </div>

            {/* Email / Password Form */}
            <form onSubmit={handleLocalSubmit} className="space-y-5">
              <div className="space-y-5">
                {/* Email Input */}
                <div className="space-y-2">
                  <label className="text-base font-extrabold text-black dark:text-slate-300 block">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-505 dark:text-slate-400" />
                    <input
                      type="email"
                      placeholder="example@domain.com"
                      required
                      value={email}
                      disabled={isLoggingIn}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-11 pr-4 py-4 bg-white dark:bg-background border border-slate-400 dark:border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-lg md:text-xl font-bold text-black dark:text-foreground disabled:opacity-60 transition-all placeholder:text-slate-505"
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-base font-extrabold text-black dark:text-slate-300 block">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => { setView('forgot'); setError(null); }}
                      className="text-xs font-bold text-primary hover:underline bg-transparent border-0 cursor-pointer"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <div className="relative">
                    <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-505 dark:text-slate-400" />
                    <input
                      type="password"
                      placeholder="••••••••"
                      required
                      value={password}
                      disabled={isLoggingIn}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-11 pr-4 py-4 bg-white dark:bg-background border border-slate-400 dark:border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-lg md:text-xl font-bold tracking-widest text-black dark:text-foreground disabled:opacity-60 transition-all placeholder:text-slate-505"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3.5 pt-5 border-t border-slate-200 dark:border-border/60">
                <Button
                  type="button"
                  variant="ghost"
                  disabled={isLoggingIn}
                  onClick={handleClose}
                  className="text-black dark:text-muted-foreground hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-extrabold px-5 py-3 rounded-xl cursor-pointer shadow-none"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isLoggingIn}
                  className={`bg-primary hover:opacity-95 text-white text-base font-black px-7 py-3.5 rounded-xl flex items-center justify-center gap-2.5 shadow-none cursor-pointer min-h-[48px] min-w-[130px] ${
                    isLoggingIn ? 'opacity-70 pointer-events-none' : ''
                  }`}
                >
                  {isLoggingIn && <Loader2 className="w-5 h-5 animate-spin" />}
                  Sign In
                </Button>
              </div>
            </form>
          </div>
        ) : (
          /* Modal Body - Forgot Password View */
          <div className="p-8 space-y-7 bg-white dark:bg-card">
            {error && (
              <div className="p-4.5 rounded-xl bg-red-100 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-red-955 dark:text-red-450 text-[15px] font-bold leading-relaxed">
                {error}
              </div>
            )}

            {forgotSuccess ? (
              <div className="text-center space-y-4 py-4">
                <div className="w-16 h-16 rounded-2xl bg-green-50 dark:bg-green-950/20 text-green-600 dark:text-green-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="text-lg font-extrabold text-slate-850 dark:text-foreground">Check Your Mailbox</h4>
                <p className="text-sm text-slate-500 dark:text-muted-foreground leading-relaxed">
                  We have sent a password recovery link to <strong>{forgotEmail}</strong>. Please check your inbox and click the link to reset your password.
                </p>
                <div className="pt-4">
                  <Button
                    onClick={() => { setView('signin'); setForgotSuccess(false); setForgotEmail(''); }}
                    className="w-full py-3 bg-primary hover:opacity-95 text-white font-black rounded-xl shadow-none cursor-pointer"
                  >
                    Back to Sign In
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-base font-extrabold text-black dark:text-slate-300 block">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-550 dark:text-slate-400" />
                    <input
                      type="email"
                      placeholder="example@domain.com"
                      required
                      value={forgotEmail}
                      disabled={isLoggingIn}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      className="w-full pl-11 pr-4 py-4 bg-white dark:bg-background border border-slate-400 dark:border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-lg md:text-xl font-bold text-black dark:text-foreground disabled:opacity-60 transition-all placeholder:text-slate-505"
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-5 border-t border-slate-200 dark:border-border/60">
                  <button
                    type="button"
                    onClick={() => { setView('signin'); setError(null); }}
                    className="text-sm font-extrabold text-primary hover:underline bg-transparent border-0 cursor-pointer"
                  >
                    Back to Sign In
                  </button>
                  <div className="flex items-center gap-3">
                    <Button
                      type="button"
                      variant="ghost"
                      disabled={isLoggingIn}
                      onClick={handleClose}
                      className="text-black dark:text-muted-foreground hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-extrabold px-5 py-3 rounded-xl cursor-pointer shadow-none"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={isLoggingIn}
                      className={`bg-primary hover:opacity-95 text-white text-base font-black px-7 py-3.5 rounded-xl flex items-center justify-center gap-2.5 shadow-none cursor-pointer min-h-[48px] min-w-[130px] ${
                        isLoggingIn ? 'opacity-70 pointer-events-none' : ''
                      }`}
                    >
                      {isLoggingIn && <Loader2 className="w-5 h-5 animate-spin" />}
                      Send Link
                    </Button>
                  </div>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
