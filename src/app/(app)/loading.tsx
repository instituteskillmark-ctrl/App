import React from 'react';

export default function GlobalAppLoading() {
  return (
    <div className="flex-1 flex items-center justify-center p-8 bg-[#090d16]">
      <div className="flex items-center space-x-3 bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs font-mono text-cyan-400 shadow-xl">
        <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping"></span>
        <span>Loading Developer Workspace Data...</span>
      </div>
    </div>
  );
}
