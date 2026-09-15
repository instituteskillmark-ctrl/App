'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Map,
  Target,
  Bot,
  FolderKanban,
  TrendingUp,
  FileText,
  Settings,
  Menu,
  X,
  Zap,
  Award,
  Clock,
} from 'lucide-react';

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Roadmap', href: '/roadmap', icon: Map },
  { label: "Today's Focus", href: '/today', icon: Target },
  { label: 'AI Assistant', href: '/assistant', icon: Bot },
  { label: 'Projects', href: '/projects', icon: FolderKanban },
  { label: 'Skill Progress', href: '/progress', icon: TrendingUp },
  { label: 'Knowledge Notes', href: '/notes', icon: FileText },
  { label: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile Top Header */}
      <div
        className="lg:hidden flex items-center justify-between px-4 py-3 sticky top-0 z-40"
        style={{ background: 'var(--surface-1)', borderBottom: '1px solid var(--border)' }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 flex items-center justify-center"
            style={{ background: 'var(--surface-0)', border: '1px solid var(--border)', borderRadius: '4px' }}
          >
            <Zap className="w-4 h-4" style={{ color: 'var(--accent)' }} />
          </div>
          <div>
            <span className="font-semibold text-sm tracking-tight" style={{ color: 'var(--text-primary)' }}>
              Automation Dev OS
            </span>
            <span className="text-[10px] block" style={{ color: 'var(--text-muted)' }}>
              Personal Learning System
            </span>
          </div>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2"
          style={{
            background: 'var(--surface-0)',
            border: '1px solid var(--border)',
            borderRadius: '4px',
            color: 'var(--text-secondary)',
          }}
          aria-label="Toggle navigation"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`${
          mobileOpen ? 'block fixed inset-y-0 left-0 z-50 w-72' : 'hidden'
        } lg:block w-60 flex flex-col h-screen sticky top-0 shrink-0 select-none`}
        style={{ background: 'var(--surface-1)', borderRight: '1px solid var(--border)' }}
      >
        {/* Brand */}
        <div
          className="px-5 py-4 flex items-center gap-3"
          style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface-0)' }}
        >
          <div
            className="w-8 h-8 flex items-center justify-center shrink-0"
            style={{ background: 'var(--surface-1)', border: '1px solid var(--border)', borderRadius: '4px' }}
          >
            <Zap className="w-4 h-4" style={{ color: 'var(--accent)' }} />
          </div>
          <div>
            <h1 className="font-semibold text-sm tracking-tight" style={{ color: 'var(--text-primary)' }}>
              Automation Dev OS
            </h1>
            <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
              AI Developer Learning System
            </p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto">
          <div className="section-label px-3 mb-2">Workspace</div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href !== '/dashboard' && pathname?.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-3 py-2 text-xs font-medium transition"
                style={{
                  borderRadius: '4px',
                  background: isActive ? 'var(--surface-0)' : 'transparent',
                  color: isActive ? 'var(--text-primary)' : 'var(--text-muted)',
                  border: isActive ? '1px solid var(--border)' : '1px solid transparent',
                }}
              >
                <Icon
                  className="w-4 h-4 shrink-0"
                  style={{ color: isActive ? 'var(--accent)' : 'var(--text-muted)' }}
                />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div
          className="p-3"
          style={{ borderTop: '1px solid var(--border)', background: 'var(--surface-0)' }}
        >
          <div
            className="p-3 space-y-2"
            style={{
              background: 'var(--surface-1)',
              border: '1px solid var(--border)',
              borderRadius: '4px',
            }}
          >
            <div className="flex items-center justify-between">
              <span
                className="text-[10px] font-medium flex items-center gap-1.5"
                style={{ color: 'var(--text-secondary)' }}
              >
                <Award className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
                Target Outcome
              </span>
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: 'var(--status-completed)' }}
              />
            </div>
            <div className="text-xs font-semibold tracking-tight" style={{ color: 'var(--text-primary)' }}>
              Junior / Freelance-Ready
            </div>
            <div
              className="flex items-center justify-between text-[10px] pt-1.5"
              style={{ borderTop: '1px solid var(--border)', color: 'var(--text-muted)' }}
            >
              <span className="flex items-center gap-1" style={{ fontFamily: 'var(--font-mono)' }}>
                <Clock className="w-3 h-3" /> 26 Weeks
              </span>
              <span style={{ fontFamily: 'var(--font-mono)' }}>2–3 hrs/day</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
        />
      )}
    </>
  );
}
