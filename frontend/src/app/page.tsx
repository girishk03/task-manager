'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, getAuthToken } from '../lib/api';
import { LogIn, Moon, Sun, ShieldAlert, Sparkles, Layout } from 'lucide-react';
import { useTheme } from '../components/ThemeProvider';

export default function LoginPage() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [checking, setChecking] = useState(true);

  useEffect(() => {
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
      setError(err.message || 'Authentication failed. Please check your backend connection.');
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background text-foreground">
        <div className="flex flex-col items-center gap-3">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <span className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Checking session...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background dot-grid px-4 transition-colors duration-300">
      {/* Subtle top header overlay */}
      <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-center z-20">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold shadow-sm">
            T
          </div>
          <span className="text-sm font-semibold tracking-tight text-foreground">Workspace Manager</span>
        </div>
        <button
          onClick={toggleTheme}
          className="rounded-lg border border-border bg-card p-2 text-muted-foreground hover:text-foreground active:scale-95 transition-all shadow-sm cursor-pointer"
        >
          {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>
      </div>

      {/* Main card panel */}
      <div className="w-full max-w-[420px] overflow-hidden rounded-2xl bg-card border border-border shadow-xl p-8 z-10 animate-fade-in-up">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary mb-3">
            <Layout className="h-5 w-5" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            Caseload Task Manager
          </h1>
          <p className="text-xs text-muted-foreground mt-1 font-medium">
            Full-Stack Technical Assessment
          </p>
        </div>

        {error && (
          <div className="flex items-start gap-2.5 rounded-lg bg-red-500/10 p-3.5 text-xs text-red-600 dark:text-red-400 border border-red-500/20 mb-5">
            <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-semibold block mb-0.5">Connection Error</span>
              <span>{error}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleGuestLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Guest Name (Optional)
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Alex Mercer"
              className="w-full rounded-xl border border-border bg-background p-3 text-sm focus-ring"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/95 active:scale-[0.98] disabled:opacity-50 transition-all cursor-pointer shadow-md shadow-primary/10"
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
            className="text-[10px] text-muted-foreground hover:text-primary transition-colors font-semibold uppercase tracking-wider"
          >
            Built for Digital Heroes Training Task
          </a>
        </div>
      </div>
    </div>
  );
}
