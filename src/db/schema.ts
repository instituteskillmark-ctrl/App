import { pgTable, text, integer, timestamp, boolean, uuid, pgEnum, uniqueIndex } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const priorityEnum = pgEnum('priority_level', ['MASTER', 'IMPORTANT', 'BASICS_ENOUGH']);
export const topicStatusEnum = pgEnum('topic_status', ['NOT_STARTED', 'IN_PROGRESS', 'NEEDS_REVISION', 'COMPLETED', 'VERIFIED']);
export const taskStageEnum = pgEnum('task_stage', ['LEARN', 'PRACTICE', 'BUILD', 'TEST', 'VERIFY', 'COMPLETE']);
export const projectStatusEnum = pgEnum('project_status', ['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED']);
export const projectStageEnum = pgEnum('project_stage', ['PLANNING', 'BUILD', 'TESTING', 'DEPLOYMENT', 'DOCUMENTATION', 'COMPLETE']);
export const milestoneTypeEnum = pgEnum('milestone_type', ['KEY_OUTPUT', 'SUCCESS_CHECKLIST', 'PRO_TIP', 'FINAL_OUTCOME']);

// 1. Roadmap Months
export const roadmapMonths = pgTable('roadmap_months', {
  id: uuid('id').defaultRandom().primaryKey(),
  monthNumber: integer('month_number').notNull().unique(),
  title: text('title').notNull(),
  subtitle: text('subtitle'),
  durationWeeks: text('duration_weeks').notNull(), // e.g. "4 weeks", "4.5 weeks"
  keyOutput: text('key_output').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 2. Roadmap Weeks
export const roadmapWeeks = pgTable('roadmap_weeks', {
  id: uuid('id').defaultRandom().primaryKey(),
  monthId: uuid('month_id').notNull().references(() => roadmapMonths.id, { onDelete: 'cascade' }),
  weekNumber: integer('week_number').notNull(), // 1 to 29 (M1:1-4, M2:5-9, M3:10-14, M4:15-18, M5:19-23, M6:24-29)
  title: text('title').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 3. Roadmap Tasks / Topics
export const roadmapTasks = pgTable('roadmap_tasks', {
  id: uuid('id').defaultRandom().primaryKey(),
  monthId: uuid('month_id').notNull().references(() => roadmapMonths.id, { onDelete: 'cascade' }),
  weekId: uuid('week_id').references(() => roadmapWeeks.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  durationLabel: text('duration_label'), // e.g. "5 days", "1 week", "ongoing"
  priority: priorityEnum('priority').notNull().default('IMPORTANT'),
  orderIndex: integer('order_index').notNull().default(0),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 4. Subtasks
export const subtasks = pgTable('subtasks', {
  id: uuid('id').defaultRandom().primaryKey(),
  taskId: uuid('task_id').notNull().references(() => roadmapTasks.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  orderIndex: integer('order_index').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 5. Subtask Progress
export const subtaskProgress = pgTable('subtask_progress', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id').notNull().default('default_user'),
  subtaskId: uuid('subtask_id').notNull().references(() => subtasks.id, { onDelete: 'cascade' }),
  isCompleted: boolean('is_completed').notNull().default(false),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  userSubtaskIdx: uniqueIndex('subtask_progress_user_subtask_idx').on(table.userId, table.subtaskId),
}));

// 6. Task Progress
export const taskProgress = pgTable('task_progress', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id').notNull().default('default_user'),
  taskId: uuid('task_id').notNull().references(() => roadmapTasks.id, { onDelete: 'cascade' }),
  status: topicStatusEnum('status').notNull().default('NOT_STARTED'),
  currentStage: taskStageEnum('current_stage').notNull().default('LEARN'),
  startedAt: timestamp('started_at'),
  completedAt: timestamp('completed_at'),
  verifiedAt: timestamp('verified_at'),
  notes: text('notes'),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  userTaskIdx: uniqueIndex('task_progress_user_task_idx').on(table.userId, table.taskId),
}));

// 6. Projects
export const projects = pgTable('projects', {
  id: uuid('id').defaultRandom().primaryKey(),
  monthId: uuid('month_id').references(() => roadmapMonths.id, { onDelete: 'set null' }),
  projectNumber: integer('project_number').notNull(), // 1 to 6
  title: text('title').notNull(),
  weekRange: text('week_range').notNull(), // e.g. "Week 2–4"
  description: text('description').notNull(),
  techStack: text('tech_stack'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 7. Project Tasks
export const projectTasks = pgTable('project_tasks', {
  id: uuid('id').defaultRandom().primaryKey(),
  projectId: uuid('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  orderIndex: integer('order_index').notNull().default(0),
  isCompleted: boolean('is_completed').notNull().default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 8. Project Progress
export const projectProgress = pgTable('project_progress', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id').notNull().default('default_user'),
  projectId: uuid('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  status: projectStatusEnum('status').notNull().default('NOT_STARTED'),
  currentStage: projectStageEnum('current_stage').notNull().default('PLANNING'),
  repoUrl: text('repo_url'),
  demoUrl: text('demo_url'),
  startedAt: timestamp('started_at'),
  completedAt: timestamp('completed_at'),
  notes: text('notes'),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  userProjectIdx: uniqueIndex('project_progress_user_project_idx').on(table.userId, table.projectId),
}));

// 9. Assessments
export const assessments = pgTable('assessments', {
  id: uuid('id').defaultRandom().primaryKey(),
  taskId: uuid('task_id').references(() => roadmapTasks.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description'),
  passingScore: integer('passing_score').notNull().default(80),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 10. Assessment Questions
export const assessmentQuestions = pgTable('assessment_questions', {
  id: uuid('id').defaultRandom().primaryKey(),
  assessmentId: uuid('assessment_id').notNull().references(() => assessments.id, { onDelete: 'cascade' }),
  questionText: text('question_text').notNull(),
  optionsJson: text('options_json'), // JSON string array of options
  correctAnswerIndex: integer('correct_answer_index').notNull().default(0),
  answerExplanation: text('answer_explanation'),
  orderIndex: integer('order_index').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 11. Assessment Attempts
export const assessmentAttempts = pgTable('assessment_attempts', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id').notNull().default('default_user'),
  assessmentId: uuid('assessment_id').notNull().references(() => assessments.id, { onDelete: 'cascade' }),
  scorePercent: integer('score_percent').notNull(),
  passed: boolean('passed').notNull(),
  startedAt: timestamp('started_at').defaultNow().notNull(),
  completedAt: timestamp('completed_at'),
  notes: text('notes'),
});

// 12. Notes
export const notes = pgTable('notes', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id').notNull().default('default_user'),
  taskId: uuid('task_id').references(() => roadmapTasks.id, { onDelete: 'set null' }),
  projectId: uuid('project_id').references(() => projects.id, { onDelete: 'set null' }),
  title: text('title').notNull(),
  content: text('content').notNull(),
  tags: text('tags'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 13. Study Sessions
export const studySessions = pgTable('study_sessions', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id').notNull().default('default_user'),
  taskId: uuid('task_id').references(() => roadmapTasks.id, { onDelete: 'set null' }),
  projectId: uuid('project_id').references(() => projects.id, { onDelete: 'set null' }),
  startedAt: timestamp('started_at').defaultNow().notNull(),
  endedAt: timestamp('ended_at'),
  durationMinutes: integer('duration_minutes').notNull().default(0),
  durationSeconds: integer('duration_seconds').notNull().default(0),
  status: text('status').notNull().default('COMPLETED'), // RUNNING, PAUSED, COMPLETED
  pausedAt: timestamp('paused_at'),
  totalPausedSeconds: integer('total_paused_seconds').notNull().default(0),
  sessionType: text('session_type').default('LEARN'), // LEARN, PRACTICE, BUILD, REVIEW
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 14. Skills Matrix (Derived from Detailed Skill Breakdown)
export const skills = pgTable('skills', {
  id: uuid('id').defaultRandom().primaryKey(),
  category: text('category').notNull(), // e.g. "Automation & n8n", "APIs & Security", "Databases & Data", "JavaScript", "AI & RAG", "Testing & DevOps"
  title: text('title').notNull(),
  description: text('description'),
  orderIndex: integer('order_index').default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Junction: Skill -> Task mapping
export const skillTasks = pgTable('skill_tasks', {
  id: uuid('id').defaultRandom().primaryKey(),
  skillId: uuid('skill_id').notNull().references(() => skills.id, { onDelete: 'cascade' }),
  taskId: uuid('task_id').notNull().references(() => roadmapTasks.id, { onDelete: 'cascade' }),
});

// User Settings
export const userSettings = pgTable('user_settings', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id').notNull().unique().default('default_user'),
  dailyCommitmentHours: text('daily_commitment_hours').default('2-3 hours'),
  weeklyPlan: text('weekly_plan'),
  theme: text('theme').default('dark'),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Roadmap Milestones
export const roadmapMilestones = pgTable('roadmap_milestones', {
  id: uuid('id').defaultRandom().primaryKey(),
  monthId: uuid('month_id').references(() => roadmapMonths.id, { onDelete: 'cascade' }),
  type: milestoneTypeEnum('type').notNull(),
  title: text('title').notNull(),
  detail: text('detail'),
  orderIndex: integer('order_index').default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// RELATIONS
export const roadmapMonthsRelations = relations(roadmapMonths, ({ many }) => ({
  weeks: many(roadmapWeeks),
  tasks: many(roadmapTasks),
  projects: many(projects),
  milestones: many(roadmapMilestones),
}));

export const roadmapWeeksRelations = relations(roadmapWeeks, ({ one, many }) => ({
  month: one(roadmapMonths, { fields: [roadmapWeeks.monthId], references: [roadmapMonths.id] }),
  tasks: many(roadmapTasks),
}));

export const roadmapTasksRelations = relations(roadmapTasks, ({ one, many }) => ({
  month: one(roadmapMonths, { fields: [roadmapTasks.monthId], references: [roadmapMonths.id] }),
  week: one(roadmapWeeks, { fields: [roadmapTasks.weekId], references: [roadmapWeeks.id] }),
  subtasks: many(subtasks),
  progress: many(taskProgress),
  notes: many(notes),
  studySessions: many(studySessions),
  assessments: many(assessments),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  month: one(roadmapMonths, { fields: [projects.monthId], references: [roadmapMonths.id] }),
  tasks: many(projectTasks),
  progress: many(projectProgress),
  notes: many(notes),
}));
