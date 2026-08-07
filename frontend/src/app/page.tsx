'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, getAuthToken } from '../lib/api';
import { LogIn, Moon, Sun, ShieldAlert, Sparkles } from 'lucide-react';
import { useTheme } from '../components/ThemeProvider';

export default function LoginPage() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Check if user is already authenticated
    const token = getAuthToken();
    if (token) {
      router.replace('/dashboard');
    } else {
      setChecking(false);
    }
  }, [router]);

  const handleGuestLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.loginGuest(name.trim());
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check backend connection.');
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background text-foreground">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <span className="text-sm font-medium text-muted-foreground">Checking session...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background px-4 py-12 transition-colors duration-300">
      {/* Background soft glow decoration */}
      <div className="absolute top-1/4 left-1/4 h-[300px] w-[300px] rounded-full bg-primary/10 blur-[80px]" />
      <div className="absolute bottom-1/4 right-1/4 h-[300px] w-[300px] rounded-full bg-indigo-500/10 blur-[80px]" />

      {/* Top right theme toggle */}
      <div className="absolute top-6 right-6">
        <button
          onClick={toggleTheme}
          className="rounded-xl border border-border bg-card p-2.5 text-muted-foreground hover:text-foreground active:scale-95 transition-all shadow-sm cursor-pointer"
        >
          {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>
      </div>

      {/* Login Card */}
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-card border border-border shadow-xl p-8 z-10">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-4">
            <Sparkles className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight mb-2">
            Caseload Task Manager
          </h1>
          <p className="text-sm text-muted-foreground">
            Full-Stack Technical Assessment
          </p>
        </div>

        {error && (
          <div className="flex items-start gap-2.5 rounded-xl bg-red-500/10 p-4 text-sm text-red-500 border border-red-500/20 mb-6">
            <ShieldAlert className="h-5 w-5 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-semibold block mb-0.5">Connection Error</span>
              <span>{error}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleGuestLogin} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-muted-foreground">
              Your Name (Optional)
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Alex (or leave empty for Guest)"
              className="w-full rounded-xl border border-border bg-background p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 px-4 text-sm font-semibold text-primary-foreground hover:opacity-90 active:scale-[0.98] disabled:opacity-50 transition-all cursor-pointer shadow-md"
          >
            {loading ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <LogIn className="h-4 w-4" />
                <span>Access Guest Login</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-8 border-t border-border pt-6 text-center">
          <a
            href="https://digitalheroesco.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-muted-foreground hover:text-primary transition-colors font-medium"
          >
            Built for Digital Heroes Training Task
          </a>
        </div>
      </div>
    </div>
  );
}
