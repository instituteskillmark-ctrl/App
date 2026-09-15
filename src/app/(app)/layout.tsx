import React from 'react';
import { Sidebar } from '@/components/Navigation';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-[#08090c] text-[#f5f7fa] selection:bg-slate-700/40 selection:text-white">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto min-h-screen">
        {children}
      </main>
    </div>
  );
}
