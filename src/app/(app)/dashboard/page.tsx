import React from 'react';
import { Header } from '@/components/Header';
import { getDashboardStats } from '@/lib/services/dashboard';
import { getRoadmapOverview } from '@/lib/services/roadmap';
import { getSkillsOverview } from '@/lib/services/skills';
import { getSmartIntelligence } from '@/lib/services/intelligence';
import { CurrentTaskHero } from '@/components/CurrentTaskHero';
import { SmartRecommendations } from '@/components/SmartRecommendations';
import Link from 'next/link';
import { db } from '@/db';
import { subtasks, taskProgress, notes } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { getAssessmentForTask } from '@/lib/services/assessments';
import {
  Flame,
  Award,
  Clock,
  FolderKanban,
  TrendingUp,
  Activity,
  Target,
  ArrowUpRight,
} from 'lucide-react';

export const revalidate = 0;

export default async function DashboardPage() {
  const stats = await getDashboardStats();
  await getRoadmapOverview();
  const skillsList = await getSkillsOverview();
  const intel = await getSmartIntelligence();

  // Build task with details for CurrentTaskHero
  let taskWithDetails = null;
  if (stats.currentTask) {
    const subtaskItems = await db
      .select()
      .from(subtasks)
      .where(eq(subtasks.taskId, stats.currentTask.id));
    const [progress] = await db
      .select()
      .from(taskProgress)
      .where(eq(taskProgress.taskId, stats.currentTask.id));
    const taskNotes = await db
      .select()
      .from(notes)
      .where(eq(notes.taskId, stats.currentTask.id));
    const assessmentData = await getAssessmentForTask(stats.currentTask.id);

    taskWithDetails = {
      ...stats.currentTask,
      monthName: stats.currentMonthName,
      subtasks: subtaskItems,
      progress: progress || { status: 'NOT_STARTED' as const },
      assessment: assessmentData,
      notes: taskNotes,
    };
  }

  const topSkills = skillsList
    .slice(0, 3)
    .map((s) => ({ category: s.category, proficiencyPercent: s.proficiencyPercent }));

  const activeProject = intel?.relevantProject
    ? {
        title: intel.relevantProject.title,
        description: intel.relevantProject.description,
        techStack: intel.relevantProject.techStack,
        projectNumber: intel.relevantProject.projectNumber,
      }
    : undefined;

  return (
    <div className="flex-1 pb-16">
      <Header title="Dashboard" subtitle="AI Automation Developer Learning System" />

      <div className="p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
        {/* Metric Overview Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {[
            {
              label: 'Progress',
              value: `${stats.overallProgressPercent}%`,
              sub: `${stats.completedTasksCount}/${stats.totalTasks} topics`,
              icon: TrendingUp,
              accentColor: 'var(--status-completed)',
            },
            {
              label: 'Streak',
              value: `${stats.streak.currentStreak}`,
              unit: 'days',
              sub: stats.streak.activeToday ? 'Active today' : 'Pending today',
              icon: Flame,
              accentColor: 'var(--priority-important)',
            },
            {
              label: 'Verified Skills',
              value: `${stats.verifiedTasksCount}`,
              sub: 'Quiz passed',
              icon: Award,
              accentColor: 'var(--status-completed)',
            },
            {
              label: 'Focus Hours',
              value: `${stats.totalHoursInvested}`,
              unit: 'hrs',
              sub: 'Logged sessions',
              icon: Clock,
              accentColor: 'var(--text-muted)',
            },
            {
              label: 'Projects',
              value: `${stats.completedProjectsCount}/${stats.totalProjects}`,
              sub: 'Roadmap portfolio',
              icon: FolderKanban,
              accentColor: 'var(--accent)',
              href: '/projects',
            },
          ].map((tile) => {
            const Icon = tile.icon;
            const card = (
              <div
                key={tile.label}
                className="os-surface os-surface-hover p-4 flex flex-col justify-between gap-2"
              >
                <div className="flex items-center justify-between">
                  <span className="section-label">{tile.label}</span>
                  <Icon className="w-3.5 h-3.5" style={{ color: tile.accentColor }} />
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
                <div className="flex items-center justify-between">
                  <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                    {tile.sub}
                  </span>
                  {tile.href && (
                    <ArrowUpRight className="w-3 h-3" style={{ color: 'var(--text-muted)' }} />
                  )}
                </div>
              </div>
            );
            return tile.href ? (
              <Link key={tile.label} href={tile.href} className="block">
                {card}
              </Link>
            ) : (
              <div key={tile.label}>{card}</div>
            );
          })}
        </div>

        {/* ── CurrentTaskHero — single merged component ── */}
        {taskWithDetails ? (
          <CurrentTaskHero
            task={taskWithDetails as any}
            stats={stats}
            topSkills={topSkills}
            activeProject={activeProject}
          />
        ) : (
          <div
            className="os-surface p-8 text-center space-y-4"
          >
            <Target className="w-8 h-8 mx-auto" style={{ color: 'var(--text-muted)' }} />
            <div>
              <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                No active topic selected
              </p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                Choose a topic from your roadmap to start today's learning session.
              </p>
            </div>
            <Link
              href="/roadmap"
              className="inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold transition"
              style={{
                background: 'var(--accent)',
                color: '#fff',
                borderRadius: '4px',
              }}
            >
              Explore Roadmap
            </Link>
          </div>
        )}

        {/* ── Smart Recommendations (session planner + weaknesses) ── */}
        {intel && <SmartRecommendations intelligence={intel as any} />}

        {/* ── Skill Progress (without top 3 — already in right panel) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="os-surface p-5 space-y-4">
            <div
              className="flex items-center justify-between pb-3"
              style={{ borderBottom: '1px solid var(--border)' }}
            >
              <span className="section-label flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5" style={{ color: 'var(--accent)' }} />
                Skill Progress
              </span>
              <Link
                href="/progress"
                className="flex items-center gap-1 text-[10px] font-semibold transition"
                style={{ color: 'var(--text-secondary)' }}
              >
                View All <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="space-y-3">
              {skillsList.map((sk) => (
                <div key={sk.id} className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                      {sk.category}
                    </span>
                    <span
                      className="text-[10px] font-medium"
                      style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}
                    >
                      {sk.proficiencyPercent}%
                    </span>
                  </div>
                  <div className="progress-bar-track">
                    <div
                      className="progress-bar-fill"
                      style={{
                        width: `${sk.proficiencyPercent}%`,
                        background: 'var(--accent)',
                      }}
                    />
                  </div>
                  <div
                    className="flex justify-between text-[10px]"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    <span style={{ fontFamily: 'var(--font-mono)' }}>
                      {sk.completedTasks}/{sk.totalTasks} topics
                    </span>
                    <span style={{ fontFamily: 'var(--font-mono)' }}>
                      {sk.verifiedTasks} verified
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="os-surface p-5 space-y-4">
            <div
              className="flex items-center justify-between pb-3"
              style={{ borderBottom: '1px solid var(--border)' }}
            >
              <span className="section-label flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5" style={{ color: 'var(--accent)' }} />
                Recent Activity
              </span>
              <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                Session history
              </span>
            </div>

            {stats.recentActivity.length === 0 ? (
              <div
                className="py-10 text-center text-xs"
                style={{
                  color: 'var(--text-muted)',
                  border: '1px dashed var(--border)',
                  borderRadius: '4px',
                }}
              >
                <Clock className="w-5 h-5 mx-auto mb-2" style={{ color: 'var(--text-muted)' }} />
                <p className="font-medium" style={{ color: 'var(--text-secondary)' }}>
                  No activity yet
                </p>
                <p className="mt-0.5">Complete a topic or log a focus session.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {stats.recentActivity.map((act, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between px-3 py-2 os-surface-hover transition"
                    style={{
                      background: 'var(--surface-0)',
                      border: '1px solid var(--border)',
                      borderRadius: '4px',
                    }}
                  >
                    <div className="flex items-center gap-2.5">
                      {act.type === 'TASK' ? (
                        <Target
                          className="w-3.5 h-3.5 shrink-0"
                          style={{ color: 'var(--status-completed)' }}
                        />
                      ) : (
                        <Clock
                          className="w-3.5 h-3.5 shrink-0"
                          style={{ color: 'var(--text-muted)' }}
                        />
                      )}
                      <span className="text-xs" style={{ color: 'var(--text-primary)' }}>
                        {act.title}
                      </span>
                    </div>
                    <span
                      className="text-[10px] shrink-0 ml-2"
                      style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}
                    >
                      {act.time}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
