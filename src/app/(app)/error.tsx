'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';

export default function GlobalAppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Unhandled OS Page Error:', error);
  }, [error]);

  return (
    <div className="flex-1 flex items-center justify-center p-8 bg-[#090d16]">
      <div className="bg-slate-950 border border-slate-800 rounded-xl p-8 max-w-md w-full text-center space-y-4 shadow-2xl">
        <div className="w-12 h-12 rounded-full bg-red-950 text-red-400 border border-red-800 flex items-center justify-center text-xl font-bold mx-auto">
          ⚠️
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-100">Application Exception Caught</h2>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            {error.message || 'An unexpected error occurred while rendering this workspace page.'}
          </p>
        </div>

        <div className="flex items-center justify-center space-x-3 pt-2">
          <button
            onClick={() => reset()}
            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs rounded-lg transition"
          >
            Retry Loading
          </button>
          <Link
            href="/dashboard"
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 font-mono text-xs rounded-lg border border-slate-800 transition"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
