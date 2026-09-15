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
      value: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Configured' : 'Missing',
    },
    {
      key: 'DATABASE_URL',
      label: 'Database Connection',
      ok: hasDbUrl && dbStatus.ok,
      value: dbStatus.ok
        ? `Connected ${dbStatus.seeded ? '& Seeded' : '(empty)'}`
        : `${dbStatus.error?.slice(0, 80) ?? 'Connection failed'}`,
    },
    {
      key: 'SUPABASE_SERVICE_ROLE_KEY',
      label: 'Service Role Key',
      ok: !!(process.env.SUPABASE_SERVICE_ROLE_KEY && !process.env.SUPABASE_SERVICE_ROLE_KEY.includes('YOUR_')),
      value: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Configured' : 'Missing',
    },
    {
      key: 'AI_PROVIDER_API_KEY',
      label: 'AI Tutor API Key',
      ok: !!(process.env.AI_PROVIDER_API_KEY || process.env.OPENAI_API_KEY || process.env.GEMINI_API_KEY),
      value: (process.env.AI_PROVIDER_API_KEY || process.env.OPENAI_API_KEY || process.env.GEMINI_API_KEY)
        ? 'Configured'
        : 'Not set (showing setup guidance)',
      optional: true,
    },
  ];

  return (
    <div className="flex-1 pb-16">
      <Header
        title="Settings & System Status"
        subtitle="Database Connection & Environment Health"
      />

      <div className="p-6 lg:p-8 max-w-5xl mx-auto space-y-8">
        {/* DB Status Banner */}
        <div
          className={`rounded-xl border p-5 flex items-start space-x-4 shadow-sm ${
            dbStatus.ok
              ? 'bg-[#171c23] border-emerald-800/40'
              : 'bg-[#171c23] border-rose-800/40'
          }`}
        >
          <div className="pt-0.5 shrink-0">
            {dbStatus.ok ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            ) : (
              <XCircle className="w-5 h-5 text-rose-400" />
            )}
          </div>
          <div className="space-y-1">
            <div className={`font-semibold text-xs flex items-center gap-2 ${dbStatus.ok ? 'text-emerald-300' : 'text-rose-300'}`}>
              <Database className="w-4 h-4" />
              <span>
                {dbStatus.ok
                  ? dbStatus.seeded
                    ? 'Database Connected & Roadmap Loaded'
                    : 'Database Connected (Run db:seed to load initial roadmap)'
                  : 'Database Connection Failed'}
              </span>
            </div>
            {!dbStatus.ok && (
              <div className="text-xs text-rose-400 pt-1">
                {dbStatus.error?.slice(0, 120)}
              </div>
            )}
            {!dbStatus.ok && (
              <div className="text-xs text-[#9aa3af] pt-1">
                Update <code className="bg-[#12161c] px-1.5 py-0.5 rounded text-[#f5f7fa]">DATABASE_URL</code> in <code className="bg-[#12161c] px-1.5 py-0.5 rounded text-[#f5f7fa]">.env.local</code> with your correct database password.
              </div>
            )}
          </div>
        </div>

        {/* Environment Variables Status */}
        <div className="bg-[#12161c] border border-[#252b34] rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#252b34] pb-3">
            <h3 className="text-xs font-semibold text-[#f5f7fa] uppercase tracking-wider flex items-center gap-2">
              <Key className="w-4 h-4 text-emerald-400" />
              Environment Variables
            </h3>
            <span className="text-[11px] text-[#66707c]">Health Check</span>
          </div>

          <div className="space-y-2.5">
            {envChecks.map((check) => (
              <div
                key={check.key}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-lg bg-[#171c23] border border-[#252b34] text-xs gap-2 hover:border-[#374151] transition"
              >
                <div className="space-y-0.5">
                  <div className="text-[#f5f7fa] font-semibold">{check.key}</div>
                  <div className="text-[#9aa3af] text-[11px]">{check.label}</div>
                </div>
                <div
                  className={`text-left sm:text-right shrink-0 ${
                    check.ok
                      ? 'text-emerald-400 font-semibold'
                      : check.optional
                      ? 'text-[#9aa3af]'
                      : 'text-rose-400 font-semibold'
                  }`}
                >
                  <span className="px-2.5 py-1 rounded bg-[#12161c] border border-[#252b34] inline-block">
                    {check.value}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Learning System Parameters */}
        <div className="bg-[#12161c] border border-[#252b34] rounded-xl p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-[#252b34] pb-3">
            <h3 className="text-xs font-semibold text-[#f5f7fa] uppercase tracking-wider flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-400" />
              Learning System Parameters
            </h3>
            <span className="text-[11px] text-[#66707c]">System Overview</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            {[
              { label: 'Daily Commitment', value: '2–3 hours / day', color: 'text-[#f5f7fa]', icon: Clock },
              { label: 'Curriculum Duration', value: '26 Weeks (~6 Months)', color: 'text-[#f5f7fa]', icon: Calendar },
              { label: 'Weekly Rest Day', value: 'Sunday (Rest & Recharge)', color: 'text-emerald-400', icon: CheckCircle2 },
              { label: 'Target Outcome', value: 'Junior / Freelance-Ready', color: 'text-emerald-400', icon: Award },
              { label: 'Study Methodology', value: 'Learn → Build → Verify', color: 'text-[#f5f7fa]', icon: BookOpen },
              { label: 'System Version', value: 'Automation Developer OS v1.0', color: 'text-[#f5f7fa]', icon: ShieldCheck },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="p-4 bg-[#171c23] rounded-xl border border-[#252b34] space-y-1">
                  <span className="text-[#9aa3af] text-[11px] font-medium uppercase tracking-wider block flex items-center gap-1.5">
                    <Icon className="w-3.5 h-3.5 text-[#9aa3af]" />
                    {item.label}
                  </span>
                  <span className={`${item.color} font-semibold text-xs block pt-0.5`}>{item.value}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Development Commands */}
        <div className="bg-[#12161c] border border-[#252b34] rounded-xl p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-[#252b34] pb-3">
            <h3 className="text-xs font-semibold text-[#f5f7fa] uppercase tracking-wider flex items-center gap-2">
              <Terminal className="w-4 h-4 text-[#9aa3af]" />
              Development Commands
            </h3>
            <span className="text-[11px] text-[#66707c]">CLI Reference</span>
          </div>

          <div className="space-y-2.5 text-xs">
            {[
              { cmd: 'npm run dev', desc: 'Start Next.js development server (http://localhost:3000)' },
              { cmd: 'npm run db:migrate', desc: 'Apply Drizzle migrations to database' },
              { cmd: 'npm run db:seed', desc: 'Seed 26-week curriculum roadmap & initial dataset' },
              { cmd: 'npm run db:generate', desc: 'Generate new SQL migration files after schema edits' },
              { cmd: 'npm run build', desc: 'Compile production bundle and run type checks' },
            ].map((item) => (
              <div
                key={item.cmd}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 bg-[#171c23] rounded-lg border border-[#252b34] gap-2 hover:border-[#374151] transition"
              >
                <code className="text-[#f5f7fa] font-mono text-xs font-semibold bg-[#12161c] px-2.5 py-1 rounded border border-[#252b34] shrink-0">
                  {item.cmd}
                </code>
                <span className="text-[#9aa3af] text-[11px]">{item.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}


