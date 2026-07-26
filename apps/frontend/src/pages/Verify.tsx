import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { verifyAccountApi, verifyChangeEmailApi } from '../api/auth';
import { useAuth } from '../hooks/useAuth';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';

export const Verify: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  const code = searchParams.get('code') || searchParams.get('token');

  useEffect(() => {
    const performVerification = async () => {
      if (!code) {
        setStatus('error');
        setMessage('Missing or invalid verification token.');
        return;
      }

      try {
        const isEmailChange = window.location.pathname.includes('/verify-email-change');
        if (isEmailChange) {
          await verifyChangeEmailApi(code);
          logout();
          setStatus('success');
          setMessage('Your email address has been successfully changed! Please sign in again with your new email.');
        } else {
          await verifyAccountApi(code);
          setStatus('success');
          setMessage('Your account has been successfully verified! You can now sign in to start blogging or reading.');
        }
      } catch (err: any) {
        setStatus('error');
        setMessage(err.response?.data?.error || err.response?.data?.message || err.message || 'Verification failed. The link may have expired or is invalid.');
      }
    };

    performVerification();
  }, [code]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-background flex flex-col transition-colors duration-300">
      <Navbar />
      
      <main className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-md bg-white dark:bg-card border border-slate-150 dark:border-border rounded-3xl shadow-xl p-8 text-center space-y-6">
          {status === 'loading' && (
            <div className="space-y-4 py-8">
              <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950/20 text-primary flex items-center justify-center mx-auto animate-pulse">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>
              <h2 className="text-xl font-extrabold text-slate-800 dark:text-foreground">Verifying Account</h2>
              <p className="text-sm text-slate-500 dark:text-muted-foreground leading-relaxed">
                Please wait while we secure your account details and process your verification token.
              </p>
            </div>
          )}

          {status === 'success' && (
            <div className="space-y-4 py-4">
              <div className="w-16 h-16 rounded-2xl bg-green-50 dark:bg-green-950/20 text-green-600 dark:text-green-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-extrabold text-slate-850 dark:text-foreground">Verification Successful</h2>
              <p className="text-sm text-slate-500 dark:text-muted-foreground leading-relaxed">
                {message}
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
            <div className="space-y-4 py-4">
              <div className="w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-950/20 text-red-500 flex items-center justify-center mx-auto">
                <XCircle className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-extrabold text-slate-850 dark:text-foreground">Verification Failed</h2>
              <p className="text-sm text-slate-505 dark:text-muted-foreground leading-relaxed">
                {message}
              </p>
              <div className="pt-4 flex flex-col gap-2">
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
