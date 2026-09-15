import React from 'react';
import { Header } from '@/components/Header';
import { db } from '@/db';
import { roadmapMonths } from '@/db/schema';

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
      label: 'Database (Pooled) URL',
      ok: hasDbUrl && dbStatus.ok,
      value: dbStatus.ok
        ? `✓ Connected${dbStatus.seeded ? ' & Seeded' : ' (empty — run db:seed)'}`
        : `✗ ${dbStatus.error?.slice(0, 80) ?? 'Connection failed'}`,
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
        ? 'Configured ✓'
        : 'Not set — AI Assistant will show setup guidance',
      optional: true,
    },
  ];

  return (
    <div className="flex-1 pb-12">
      <Header
        title="OS Settings & Environment Status"
        subtitle="Configuration • Live System Health • Database Connection Status"
      />

      <div className="p-8 max-w-5xl mx-auto space-y-8">

        {/* Live DB Status Banner */}
        <div className={`rounded-xl border p-4 flex items-center space-x-3 ${
          dbStatus.ok
            ? 'bg-emerald-950/30 border-emerald-800/50'
            : 'bg-red-950/30 border-red-800/50'
        }`}>
          <span className="text-2xl">{dbStatus.ok ? '🟢' : '🔴'}</span>
          <div>
            <div className={`font-bold text-sm ${dbStatus.ok ? 'text-emerald-300' : 'text-red-300'}`}>
              {dbStatus.ok
                ? dbStatus.seeded
                  ? 'Database connected & roadmap data loaded'
                  : 'Database connected — run `npm run db:seed` to load roadmap data'
                : 'Database connection failed'}
            </div>
            {!dbStatus.ok && (
              <div className="text-xs text-red-400 font-mono mt-1">
                {dbStatus.error?.slice(0, 120)}
              </div>
            )}
            {!dbStatus.ok && (
              <div className="text-xs text-slate-400 mt-2">
                Fix: Update <code className="bg-slate-800 px-1 rounded">DATABASE_URL</code> in <code className="bg-slate-800 px-1 rounded">.env.local</code> with your correct Supabase database password, then restart the dev server.
              </div>
            )}
          </div>
        </div>

        {/* Environment Variables Status */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-6">
          <h3 className="text-sm font-bold text-slate-100 mb-4 flex items-center space-x-2 font-mono uppercase tracking-wider">
            <span>⚙️</span>
            <span>Environment Variables — Live Status</span>
          </h3>

          <div className="space-y-2">
            {envChecks.map((check) => (
              <div
                key={check.key}
                className="flex items-start justify-between p-3 rounded-lg bg-slate-900/80 border border-slate-800 text-xs font-mono"
              >
                <div className="space-y-0.5">
                  <div className="text-slate-300 font-semibold">{check.key}</div>
                  <div className="text-slate-500 text-[11px]">{check.label}</div>
                </div>
                <div className={`text-right ml-4 max-w-[60%] ${
                  check.ok
                    ? 'text-emerald-400'
                    : check.optional
                    ? 'text-slate-500'
                    : 'text-red-400'
                } font-semibold`}>
                  {check.value}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Learning Commitment */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-100 font-mono uppercase tracking-wider">
            Learning Commitment Parameters
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {[
              { label: 'DAILY TIME COMMITMENT', value: '2–3 hours / day', color: 'text-slate-100' },
              { label: 'TOTAL CURRICULUM DURATION', value: '26 Weeks (~6 Months)', color: 'text-slate-100' },
              { label: 'WEEKLY REST DAY', value: 'Sunday (Rest & Recharge)', color: 'text-emerald-400' },
              { label: 'TARGET LEVEL', value: 'Strong Junior / Freelance-Ready', color: 'text-cyan-400' },
              { label: 'STUDY METHOD', value: 'Learn → Build → Verify (Assessment)', color: 'text-indigo-400' },
              { label: 'APP VERSION', value: 'Automation Developer OS v1.0', color: 'text-slate-100' },
            ].map((item) => (
              <div key={item.label} className="p-4 bg-slate-900/60 rounded-lg border border-slate-800">
                <span className="text-slate-500 font-mono block mb-1">{item.label}</span>
                <span className={`${item.color} font-bold text-sm`}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Commands */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-6">
          <h3 className="text-sm font-bold text-slate-100 mb-4 font-mono uppercase tracking-wider">
            Setup Commands Reference
          </h3>
          <div className="space-y-2 font-mono text-xs">
            {[
              { cmd: 'npm run dev', desc: 'Start development server (http://localhost:3000)' },
              { cmd: 'npm run db:migrate', desc: 'Apply database schema to Supabase' },
              { cmd: 'npm run db:seed', desc: 'Seed roadmap data (run once after migrate)' },
              { cmd: 'npm run db:generate', desc: 'Generate new migration after schema change' },
              { cmd: 'npm run build', desc: 'Build production bundle (verify no errors)' },
            ].map((item) => (
              <div key={item.cmd} className="flex items-center space-x-4 p-3 bg-slate-900/60 rounded-lg border border-slate-800">
                <code className="text-cyan-300 font-bold shrink-0">{item.cmd}</code>
                <span className="text-slate-400">{item.desc}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
