import React from 'react';
import { Header } from '@/components/Header';
import { getRoadmapOverview } from '@/lib/services/roadmap';
import { RoadmapTabs } from '@/components/RoadmapTabs';
import { db } from '@/db';
import { roadmapMonths, roadmapWeeks, roadmapTasks, subtasks, taskProgress } from '@/db/schema';
import { asc } from 'drizzle-orm';

export const revalidate = 0;

export default async function RoadmapPage() {
  const months = await getRoadmapOverview();

  // Fetch weeks & tasks with subtasks + progress
  const allWeeks = await db.select().from(roadmapWeeks).orderBy(asc(roadmapWeeks.weekNumber));
  const allTasks = await db.select().from(roadmapTasks).orderBy(asc(roadmapTasks.orderIndex));
  const allSubtasks = await db.select().from(subtasks);
  const allProgress = await db.select().from(taskProgress);

  const subtaskMap = new Map<string, typeof allSubtasks>();
  allSubtasks.forEach((st) => {
    const existing = subtaskMap.get(st.taskId) ?? [];
    subtaskMap.set(st.taskId, [...existing, st]);
  });
  const progressMap = new Map(allProgress.map((p) => [p.taskId, p]));

  // Map monthId -> monthNumber
  const monthIdToNumber = new Map(months.map((m) => [m.id, m.monthNumber]));
  const tasksByMonth: Record<number, any[]> = {};
  const weeksByMonth: Record<number, any[]> = {};

  for (const week of allWeeks) {
    const monthNum = monthIdToNumber.get(week.monthId);
    if (monthNum === undefined) continue;
    if (!weeksByMonth[monthNum]) weeksByMonth[monthNum] = [];
    weeksByMonth[monthNum].push({
      id: week.id,
      weekNumber: week.weekNumber,
      title: week.title,
    });
  }

  for (const task of allTasks) {
    const monthNum = monthIdToNumber.get(task.monthId);
    if (monthNum === undefined) continue;
    if (!tasksByMonth[monthNum]) tasksByMonth[monthNum] = [];
    tasksByMonth[monthNum].push({
      id: task.id,
      weekId: task.weekId,
      title: task.title,
      priority: task.priority,
      durationLabel: task.durationLabel,
      subtasks: subtaskMap.get(task.id) ?? [],
      progress: progressMap.get(task.id) ?? { status: 'NOT_STARTED' },
    });
  }

  return (
    <div className="flex-1 pb-16">
      <Header
        title="Curriculum Roadmap"
        subtitle="26-Week Journey — From Zero to Junior AI Automation Developer"
      />

      <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
        {/* Commitment bar */}
        <div
          className="flex flex-wrap items-center gap-6 px-4 py-3"
          style={{
            background: 'var(--surface-1)',
            border: '1px solid var(--border)',
            borderRadius: '4px',
          }}
        >
          <div className="flex flex-wrap items-center gap-4 text-xs flex-1">
            <div>
              <span className="section-label block mb-0.5">Daily Commitment</span>
              <span
                style={{
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  fontWeight: 500,
                }}
              >
                2–3 hours
              </span>
            </div>
            <div style={{ width: '1px', height: '28px', background: 'var(--border)' }} />
            <div>
              <span className="section-label block mb-0.5">Duration</span>
              <span
                style={{
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  fontWeight: 500,
                }}
              >
                26 Weeks (~6 Months)
              </span>
            </div>
            <div style={{ width: '1px', height: '28px', background: 'var(--border)' }} />
            <div>
              <span className="section-label block mb-0.5">Rest Day</span>
              <span
                style={{
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  fontWeight: 500,
                }}
              >
                Sunday
              </span>
            </div>
          </div>

          {/* Priority legend */}
          <div className="flex items-center gap-3 text-[10px] shrink-0">
            {[
              {
                label: 'Master',
                color: 'var(--priority-master)',
                bg: 'var(--priority-master-bg)',
              },
              {
                label: 'Important',
                color: 'var(--priority-important)',
                bg: 'var(--priority-important-bg)',
              },
              {
                label: 'Basics',
                color: 'var(--priority-basics)',
                bg: 'var(--priority-basics-bg)',
              },
            ].map((p) => (
              <span
                key={p.label}
                className="px-2 py-0.5 font-semibold uppercase tracking-wider"
                style={{
                  background: p.bg,
                  color: p.color,
                  borderRadius: '3px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '9px',
                }}
              >
                {p.label}
              </span>
            ))}
          </div>
        </div>

        {/* Tab strip + collapsible week list */}
        <RoadmapTabs
          months={months as any}
          tasksByMonth={tasksByMonth}
          weeksByMonth={weeksByMonth}
        />
      </div>
    </div>
  );
}
