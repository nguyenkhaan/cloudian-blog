import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { changePasswordApi } from '../api/auth';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { KeyRound, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';

export const ResetPassword: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { logout } = useAuth();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const token = searchParams.get('token');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setErrorMessage('Missing password reset token.');
      setStatus('error');
      return;
    }

    if (password.length < 8) {
      toast({
        description: 'Mật khẩu phải chứa ít nhất 8 ký tự.',
        variant: 'destructive',
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        description: 'Mật khẩu xác nhận không khớp.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await changePasswordApi(password, token);
      logout();
      setStatus('success');
      toast({
        description: 'Password has been reset successfully.',
        variant: 'success',
      });
    } catch (err: any) {
      setStatus('error');
      setErrorMessage(err.response?.data?.error || err.response?.data?.message || err.message || 'An error occurred during password reset.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-background flex flex-col transition-colors duration-300">
      <Navbar />
      
      <main className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-md bg-white dark:bg-card border border-slate-150 dark:border-border rounded-3xl shadow-xl p-8 space-y-6">
          
          {status === 'idle' && (
            <>
              <div className="text-center space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/20 text-primary flex items-center justify-center mx-auto">
                  <KeyRound className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-black text-slate-800 dark:text-foreground tracking-tight">Reset Password</h2>
                <p className="text-xs text-slate-400 dark:text-muted-foreground leading-relaxed max-w-xs mx-auto">
                  Please choose a strong password to secure your account.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-350 block">New Password</label>
                  <input
                    type="password"
                    required
                    placeholder="Enter new password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-white dark:bg-background border border-slate-200 dark:border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-lg font-bold tracking-widest text-black dark:text-foreground"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-350 block">Confirm Password</label>
                  <input
                    type="password"
                    required
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-white dark:bg-background border border-slate-200 dark:border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-lg font-bold tracking-widest text-black dark:text-foreground"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-primary hover:opacity-95 text-white font-black rounded-xl shadow-none cursor-pointer mt-2"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                  ) : (
                    'Reset Password'
                  )}
                </Button>
              </form>
            </>
          )}

          {status === 'success' && (
            <div className="text-center space-y-4 py-4">
              <div className="w-16 h-16 rounded-2xl bg-green-50 dark:bg-green-950/20 text-green-600 dark:text-green-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-extrabold text-slate-850 dark:text-foreground">Password Reset Success</h2>
              <p className="text-sm text-slate-500 dark:text-muted-foreground leading-relaxed">
                Your password has been changed. You can now use your new password to sign in.
              </p>
              <div className="pt-4">
                <Button
                  onClick={() => navigate('/?login=true')}
                  className="w-full py-3 bg-primary hover:opacity-95 text-white font-black rounded-xl shadow-none cursor-pointer"
                >
                  Sign In Now
                </Button>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="text-center space-y-4 py-4">
              <div className="w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-950/20 text-red-500 flex items-center justify-center mx-auto">
                <XCircle className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-extrabold text-slate-850 dark:text-foreground">Password Reset Failed</h2>
              <p className="text-sm text-slate-505 dark:text-muted-foreground leading-relaxed">
                {errorMessage}
              </p>
              <div className="pt-4">
                <Link to="/">
                  <Button className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold rounded-xl border-0 shadow-none cursor-pointer">
                    Back to Home
                  </Button>
                </Link>
              </div>
            </div>
          )}

        </div>
      </main>

      <Footer />
    </div>
  );
};
