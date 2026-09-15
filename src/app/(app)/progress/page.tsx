import React from 'react';
import { Header } from '@/components/Header';
import { getDashboardStats } from '@/lib/services/dashboard';
import { getSkillsOverview } from '@/lib/services/skills';
import { getRoadmapOverview } from '@/lib/services/roadmap';
import {
  TrendingUp,
  Award,
  Flame,
  AlertTriangle,
  BarChart3,
  Calendar,
} from 'lucide-react';

export const revalidate = 0;

export default async function ProgressPage() {
  const stats = await getDashboardStats();
  const skillsList = await getSkillsOverview();
  const months = await getRoadmapOverview();

  const unverifiedCount = Math.max(0, stats.completedTasksCount - stats.verifiedTasksCount);

  return (
    <div className="flex-1 pb-16">
      <Header title="Skill Progress" subtitle="Curriculum Analytics & Progress Breakdown" />

      <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
        {/* Core Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            {
              label: 'Course Progress',
              value: `${stats.overallProgressPercent}%`,
              sub: `${stats.completedTasksCount} of ${stats.totalTasks} topics`,
              icon: TrendingUp,
              color: 'var(--accent)',
            },
            {
              label: 'Verified Skills',
              value: `${stats.verifiedTasksCount}`,
              sub: 'Passed quiz assessments',
              icon: Award,
              color: 'var(--status-completed)',
            },
            {
              label: 'Current Streak',
              value: `${stats.streak.currentStreak}`,
              unit: 'days',
              sub: 'Consecutive study days',
              icon: Flame,
              color: 'var(--priority-important)',
            },
            {
              label: 'Needs Practice',
              value: `${unverifiedCount}`,
              sub: 'Done without quiz',
              icon: AlertTriangle,
              color: 'var(--priority-master)',
            },
          ].map((tile) => {
            const Icon = tile.icon;
            return (
              <div
                key={tile.label}
                className="p-4 space-y-2"
                style={{
                  background: 'var(--surface-1)',
                  border: '1px solid var(--border)',
                  borderRadius: '4px',
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="section-label">{tile.label}</span>
                  <Icon className="w-3.5 h-3.5" style={{ color: tile.color }} />
                </div>
                <div
                  className="text-2xl font-medium leading-none"
                  style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}
                >
                  {tile.value}
                  {tile.unit && (
                    <span
                      className="text-xs ml-1"
                      style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}
                    >
                      {tile.unit}
                    </span>
                  )}
                </div>
                <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                  {tile.sub}
                </div>
              </div>
            );
          })}
        </div>

        {/* Skill Breakdown */}
        <div
          className="p-5 space-y-4"
          style={{
            background: 'var(--surface-1)',
            border: '1px solid var(--border)',
            borderRadius: '4px',
          }}
        >
          <div
            className="flex items-center justify-between pb-3"
            style={{ borderBottom: '1px solid var(--border)' }}
          >
            <span className="section-label flex items-center gap-1.5">
              <BarChart3 className="w-3.5 h-3.5" style={{ color: 'var(--accent)' }} />
              Skill Breakdown
            </span>
            <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
              From roadmap progress
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {skillsList.map((sk) => (
              <div
                key={sk.id}
                className="p-4 space-y-3"
                style={{
                  background: 'var(--surface-0)',
                  border: '1px solid var(--border)',
                  borderRadius: '4px',
                }}
              >
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {sk.category}
                  </span>
                  <span
                    className="text-[10px] font-semibold px-2 py-0.5"
                    style={{
                      background: 'var(--accent-bg)',
                      color: 'var(--accent)',
                      borderRadius: '3px',
                      fontFamily: 'var(--font-mono)',
                    }}
                  >
                    {sk.proficiencyPercent}%
                  </span>
                </div>

                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  {sk.description}
                </p>

                <div className="progress-bar-track">
                  <div
                    className="progress-bar-fill"
                    style={{ width: `${sk.proficiencyPercent}%`, background: 'var(--accent)' }}
                  />
                </div>

                <div
                  className="flex justify-between text-[10px] pt-1"
                  style={{ borderTop: '1px solid var(--border)', color: 'var(--text-muted)' }}
                >
                  <span style={{ fontFamily: 'var(--font-mono)' }}>
                    {sk.completedTasks}/{sk.totalTasks} done
                  </span>
                  <span style={{ color: 'var(--status-completed)', fontFamily: 'var(--font-mono)' }}>
                    {sk.verifiedTasks} verified
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Progress */}
        <div
          className="p-5 space-y-4"
          style={{
            background: 'var(--surface-1)',
            border: '1px solid var(--border)',
            borderRadius: '4px',
          }}
        >
          <div
            className="flex items-center justify-between pb-3"
            style={{ borderBottom: '1px solid var(--border)' }}
          >
            <span className="section-label flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" style={{ color: 'var(--accent)' }} />
              Monthly Progress
            </span>
            <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
              26-Week Timeline
            </span>
          </div>

          <div className="space-y-3">
            {months.map((m) => (
              <div
                key={m.id}
                className="space-y-2"
                style={{
                  background: 'var(--surface-0)',
                  border: '1px solid var(--border)',
                  borderRadius: '4px',
                  padding: '12px',
                }}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="px-1.5 py-0.5 text-[10px] font-semibold"
                      style={{
                        background: 'var(--surface-1)',
                        border: '1px solid var(--border)',
                        borderRadius: '3px',
                        color: 'var(--text-secondary)',
                        fontFamily: 'var(--font-mono)',
                      }}
                    >
                      M{m.monthNumber}
                    </span>
                    <span className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
                      {m.title}
                    </span>
                    <span
                      className="text-[10px]"
                      style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}
                    >
                      ({m.durationWeeks})
                    </span>
                  </div>
                  <span
                    className="text-[10px] font-semibold"
                    style={{ color: 'var(--status-completed)', fontFamily: 'var(--font-mono)' }}
                  >
                    {m.percentComplete}%
                  </span>
                </div>

                <div className="progress-bar-track">
                  <div
                    className="progress-bar-fill"
                    style={{
                      width: `${m.percentComplete}%`,
                      background:
                        m.percentComplete === 100
                          ? 'var(--status-completed)'
                          : 'var(--accent)',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
