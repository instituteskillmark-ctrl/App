import React from 'react';
import { Header } from '@/components/Header';
import { db } from '@/db';
import { roadmapMonths } from '@/db/schema';
import {
  CheckCircle2,
  XCircle,
  ShieldCheck,
  Key,
  Clock,
  Terminal,
  Database,
  Award,
  BookOpen,
  Calendar,
} from 'lucide-react';

export const revalidate = 0;

async function checkDbConnection() {
  try {
    const result = await db.select().from(roadmapMonths).limit(1);
    return { ok: true, seeded: result.length > 0 };
  } catch (err: any) {
    return { ok: false, error: err?.message || String(err) };
  }
}

export default async function SettingsPage() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const hasDbUrl = !!(process.env.DATABASE_URL);
  const isSupabaseConfigured =
    supabaseUrl && !supabaseUrl.includes('YOUR_PROJECT_ID') && !supabaseUrl.includes('placeholder');

  const dbStatus = await checkDbConnection();

  const envChecks = [
    {
      key: 'NEXT_PUBLIC_SUPABASE_URL',
      label: 'Supabase Project URL',
      ok: !!isSupabaseConfigured,
      value: isSupabaseConfigured ? supabaseUrl.replace('https://', '').split('.')[0] + '.supabase.co' : 'Not configured',
    },
    {
      key: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      label: 'Supabase Anon Key',
      ok: !!(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY && !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.includes('YOUR_')),
      value: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'eyJ…[configured]' : 'Missing',
    },
    {
      key: 'DATABASE_URL',
      label: 'Database (Pooled) Connection',
      ok: hasDbUrl && dbStatus.ok,
      value: dbStatus.ok
        ? `Connected ${dbStatus.seeded ? '& Seeded' : '(empty — run db:seed)'}`
        : `${dbStatus.error?.slice(0, 80) ?? 'Connection failed'}`,
    },
    {
      key: 'SUPABASE_SERVICE_ROLE_KEY',
      label: 'Service Role Key (Server)',
      ok: !!(process.env.SUPABASE_SERVICE_ROLE_KEY && !process.env.SUPABASE_SERVICE_ROLE_KEY.includes('YOUR_')),
      value: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'eyJ…[configured]' : 'Missing',
    },
    {
      key: 'AI_PROVIDER_API_KEY',
      label: 'AI Tutor API Key (Optional)',
      ok: !!(process.env.AI_PROVIDER_API_KEY || process.env.OPENAI_API_KEY || process.env.GEMINI_API_KEY),
      value: (process.env.AI_PROVIDER_API_KEY || process.env.OPENAI_API_KEY || process.env.GEMINI_API_KEY)
        ? 'Configured'
        : 'Not set — AI Assistant will show setup guidance',
      optional: true,
    },
  ];

  return (
    <div className="flex-1 pb-16">
      <Header
        title="OS Settings & System Health"
        subtitle="Live Database Status • Environment Key Verification • System Architecture Parameters"
      />

      <div className="p-6 lg:p-8 max-w-5xl mx-auto space-y-8">
        {/* Live DB Status Banner */}
        <div
          className={`rounded-xl border p-5 flex items-start space-x-4 shadow-lg ${
            dbStatus.ok
              ? 'bg-emerald-950/20 border-emerald-800/60'
              : 'bg-rose-950/20 border-rose-800/60'
          }`}
        >
          <div className="pt-0.5 shrink-0">
            {dbStatus.ok ? (
              <CheckCircle2 className="w-6 h-6 text-emerald-400" />
            ) : (
              <XCircle className="w-6 h-6 text-rose-400" />
            )}
          </div>
          <div className="space-y-1">
            <div className={`font-bold text-sm font-mono flex items-center gap-2 ${dbStatus.ok ? 'text-emerald-300' : 'text-rose-300'}`}>
              <Database className="w-4 h-4" />
              <span>
                {dbStatus.ok
                  ? dbStatus.seeded
                    ? 'DATABASE CONNECTED & ROADMAP DATA LOADED'
                    : 'DATABASE CONNECTED — RUN `npm run db:seed` TO LOAD DATA'
                  : 'DATABASE CONNECTION FAILED'}
              </span>
            </div>
            {!dbStatus.ok && (
              <div className="text-xs text-rose-400 font-mono pt-1">
                {dbStatus.error?.slice(0, 120)}
              </div>
            )}
            {!dbStatus.ok && (
              <div className="text-xs text-slate-400 font-mono pt-1">
                Fix: Update <code className="bg-slate-900 px-1.5 py-0.5 rounded text-cyan-300">DATABASE_URL</code> in <code className="bg-slate-900 px-1.5 py-0.5 rounded text-cyan-300">.env.local</code> with your correct Supabase database password, then restart the dev server.
              </div>
            )}
          </div>
        </div>

        {/* Environment Variables Status */}
        <div className="bg-[#0e1420] border border-slate-800/80 rounded-xl p-6 shadow-lg space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800/60 pb-3">
            <h3 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-widest flex items-center gap-2">
              <Key className="w-4 h-4 text-cyan-400" />
              ENVIRONMENT VARIABLES — LIVE HEALTH AUDIT
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">Server Audit</span>
          </div>

          <div className="space-y-2.5">
            {envChecks.map((check) => (
              <div
                key={check.key}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-lg bg-[#080d19] border border-slate-800/80 text-xs font-mono gap-2 hover:border-slate-700/80 transition"
              >
                <div className="space-y-0.5">
                  <div className="text-slate-200 font-bold">{check.key}</div>
                  <div className="text-slate-400 text-[11px]">{check.label}</div>
                </div>
                <div
                  className={`text-left sm:text-right shrink-0 ${
                    check.ok
                      ? 'text-emerald-400 font-semibold'
                      : check.optional
                      ? 'text-slate-400'
                      : 'text-rose-400 font-semibold'
                  }`}
                >
                  <span className="px-2.5 py-1 rounded bg-[#0e1420] border border-slate-800 inline-block">
                    {check.ok ? '✓ ' : check.optional ? 'ℹ ' : '✗ '}
                    {check.value}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Learning Commitment Parameters */}
        <div className="bg-[#0e1420] border border-slate-800/80 rounded-xl p-6 space-y-4 shadow-lg">
          <div className="flex items-center justify-between border-b border-slate-800/60 pb-3">
            <h3 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-widest flex items-center gap-2">
              <Award className="w-4 h-4 text-indigo-400" />
              LEARNING COMMITMENT PARAMETERS
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">System Blueprint</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs font-mono">
            {[
              { label: 'DAILY COMMITMENT', value: '2–3 hours / day', color: 'text-slate-100', icon: Clock },
              { label: 'CURRICULUM DURATION', value: '26 Weeks (~6 Months)', color: 'text-slate-100', icon: Calendar },
              { label: 'WEEKLY REST DAY', value: 'Sunday (Rest & Recharge)', color: 'text-emerald-400', icon: CheckCircle2 },
              { label: 'TARGET OUTCOME', value: 'Strong Junior / Freelance-Ready', color: 'text-cyan-400', icon: Award },
              { label: 'STUDY METHODOLOGY', value: 'Learn → Build → Verify (Assessment)', color: 'text-indigo-400', icon: BookOpen },
              { label: 'OS RELEASE VERSION', value: 'Automation Developer OS v1.0', color: 'text-slate-100', icon: ShieldCheck },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="p-4 bg-[#080d19] rounded-xl border border-slate-800/80 space-y-1">
                  <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block flex items-center gap-1">
                    <Icon className="w-3 h-3 text-cyan-400" />
                    {item.label}
                  </span>
                  <span className={`${item.color} font-bold text-xs block pt-0.5`}>{item.value}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Commands */}
        <div className="bg-[#0e1420] border border-slate-800/80 rounded-xl p-6 space-y-4 shadow-lg">
          <div className="flex items-center justify-between border-b border-slate-800/60 pb-3">
            <h3 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-widest flex items-center gap-2">
              <Terminal className="w-4 h-4 text-cyan-400" />
              SYSTEM CLI REFERENCE CHEAT SHEET
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">Development Shell Commands</span>
          </div>

          <div className="space-y-2.5 font-mono text-xs">
            {[
              { cmd: 'npm run dev', desc: 'Start Next.js development server (http://localhost:3000)' },
              { cmd: 'npm run db:migrate', desc: 'Apply Drizzle migrations to database' },
              { cmd: 'npm run db:seed', desc: 'Seed 26-week curriculum roadmap & initial dataset' },
              { cmd: 'npm run db:generate', desc: 'Generate new SQL migration files after schema edits' },
              { cmd: 'npm run build', desc: 'Compile production bundle and run type checks' },
            ].map((item) => (
              <div
                key={item.cmd}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 bg-[#080d19] rounded-lg border border-slate-800/80 gap-2 hover:border-slate-700/80 transition"
              >
                <code className="text-cyan-300 font-bold bg-[#0e1420] px-2.5 py-1 rounded border border-cyan-900/50 shrink-0">
                  {item.cmd}
                </code>
                <span className="text-slate-400 text-[11px]">{item.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

