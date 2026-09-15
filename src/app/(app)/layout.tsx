import React from 'react';
import { Sidebar } from '@/components/Navigation';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-[#080c14] text-slate-100 selection:bg-cyan-500/20 selection:text-cyan-300">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto min-h-screen">
        {children}
      </main>
    </div>
  );
}
