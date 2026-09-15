'use client';

import React, { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push('/dashboard');
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#090d16] px-4">
      <div className="max-w-md w-full bg-slate-950 border border-slate-800 rounded-xl p-8 shadow-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex w-12 h-12 rounded-xl bg-cyan-600 items-center justify-center font-bold text-white text-xl shadow-lg shadow-cyan-950 mb-3">
            OS
          </div>
          <h1 className="text-xl font-bold text-slate-100">Automation Developer OS</h1>
          <p className="text-xs text-slate-400 mt-1">Private Personal Learning System</p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded bg-red-950/80 border border-red-800/80 text-red-300 text-xs font-mono">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-cyan-500 font-mono"
              placeholder="developer@personal.os"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-cyan-500 font-mono"
              placeholder="••••••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-medium py-2.5 rounded-lg text-sm transition shadow-lg shadow-cyan-950/50"
          >
            {loading ? 'Authenticating...' : 'Sign In to OS'}
          </button>
        </form>

        <div className="mt-6 text-center border-t border-slate-900 pt-4">
          <p className="text-[11px] text-slate-500">
            Private system. Single user access configured via Supabase Auth.
          </p>
        </div>
      </div>
    </div>
  );
}
