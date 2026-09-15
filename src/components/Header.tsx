import React from 'react';
import { Activity } from 'lucide-react';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  return (
    <header
      className="px-6 lg:px-8 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sticky top-0 z-20"
      style={{
        background: 'rgba(10,10,11,0.95)',
        borderBottom: '1px solid var(--border)',
        backdropFilter: 'blur(8px)',
      }}
    >
      <div>
        <h2
          className="text-lg lg:text-xl font-semibold tracking-tight"
          style={{ color: 'var(--text-primary)' }}
        >
          {title}
        </h2>
        {subtitle && (
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
            {subtitle}
          </p>
        )}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <div
          className="flex items-center gap-2 text-xs px-3 py-1.5"
          style={{
            background: 'var(--surface-1)',
            border: '1px solid var(--border)',
            borderRadius: '4px',
            color: 'var(--text-secondary)',
          }}
        >
          <Activity className="w-3.5 h-3.5" style={{ color: 'var(--status-completed)' }} />
          <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
            Phase 1 Active
          </span>
        </div>
      </div>
    </header>
  );
}
