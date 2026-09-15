CREATE TYPE "public"."milestone_type" AS ENUM('KEY_OUTPUT', 'SUCCESS_CHECKLIST', 'PRO_TIP', 'FINAL_OUTCOME');--> statement-breakpoint
CREATE TYPE "public"."priority_level" AS ENUM('MASTER', 'IMPORTANT', 'BASICS_ENOUGH');--> statement-breakpoint
CREATE TYPE "public"."project_stage" AS ENUM('PLANNING', 'BUILD', 'TESTING', 'DEPLOYMENT', 'DOCUMENTATION', 'COMPLETE');--> statement-breakpoint
CREATE TYPE "public"."project_status" AS ENUM('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED');--> statement-breakpoint
CREATE TYPE "public"."topic_status" AS ENUM('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'VERIFIED');--> statement-breakpoint
CREATE TABLE "assessment_attempts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text DEFAULT 'default_user' NOT NULL,
	"assessment_id" uuid NOT NULL,
	"score_percent" integer NOT NULL,
	"passed" boolean NOT NULL,
	"started_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "assessment_questions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"assessment_id" uuid NOT NULL,
	"question_text" text NOT NULL,
	"options_json" text,
	"correct_answer_index" integer DEFAULT 0 NOT NULL,
	"answer_explanation" text,
	"order_index" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "assessments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"task_id" uuid,
	"title" text NOT NULL,
	"description" text,
	"passing_score" integer DEFAULT 80 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text DEFAULT 'default_user' NOT NULL,
	"task_id" uuid,
	"project_id" uuid,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"tags" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project_progress" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text DEFAULT 'default_user' NOT NULL,
	"project_id" uuid NOT NULL,
	"status" "project_status" DEFAULT 'NOT_STARTED' NOT NULL,
	"current_stage" "project_stage" DEFAULT 'PLANNING' NOT NULL,
	"repo_url" text,
	"demo_url" text,
	"started_at" timestamp,
	"completed_at" timestamp,
	"notes" text,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project_tasks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"title" text NOT NULL,
	"order_index" integer DEFAULT 0 NOT NULL,
	"is_completed" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"month_id" uuid,
	"project_number" integer NOT NULL,
	"title" text NOT NULL,
	"week_range" text NOT NULL,
	"description" text NOT NULL,
	"tech_stack" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "roadmap_milestones" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"month_id" uuid,
	"type" "milestone_type" NOT NULL,
	"title" text NOT NULL,
	"detail" text,
	"order_index" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "roadmap_months" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"month_number" integer NOT NULL,
	"title" text NOT NULL,
	"subtitle" text,
	"duration_weeks" text NOT NULL,
	"key_output" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "roadmap_months_month_number_unique" UNIQUE("month_number")
);
--> statement-breakpoint
CREATE TABLE "roadmap_tasks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"month_id" uuid NOT NULL,
	"week_id" uuid,
	"title" text NOT NULL,
	"duration_label" text,
	"priority" "priority_level" DEFAULT 'IMPORTANT' NOT NULL,
	"order_index" integer DEFAULT 0 NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "roadmap_weeks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"month_id" uuid NOT NULL,
	"week_number" integer NOT NULL,
	"title" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "skill_tasks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"skill_id" uuid NOT NULL,
	"task_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "skills" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"category" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"order_index" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "study_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text DEFAULT 'default_user' NOT NULL,
	"task_id" uuid,
	"project_id" uuid,
	"started_at" timestamp DEFAULT now() NOT NULL,
	"ended_at" timestamp,
	"duration_minutes" integer DEFAULT 0 NOT NULL,
	"session_type" text DEFAULT 'LEARN',
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subtasks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"task_id" uuid NOT NULL,
	"title" text NOT NULL,
	"order_index" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "task_progress" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text DEFAULT 'default_user' NOT NULL,
	"task_id" uuid NOT NULL,
	"status" "topic_status" DEFAULT 'NOT_STARTED' NOT NULL,
	"started_at" timestamp,
	"completed_at" timestamp,
	"verified_at" timestamp,
	"notes" text,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text DEFAULT 'default_user' NOT NULL,
	"daily_commitment_hours" text DEFAULT '2-3 hours',
	"weekly_plan" text,
	"theme" text DEFAULT 'dark',
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_settings_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
ALTER TABLE "assessment_attempts" ADD CONSTRAINT "assessment_attempts_assessment_id_assessments_id_fk" FOREIGN KEY ("assessment_id") REFERENCES "public"."assessments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessment_questions" ADD CONSTRAINT "assessment_questions_assessment_id_assessments_id_fk" FOREIGN KEY ("assessment_id") REFERENCES "public"."assessments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessments" ADD CONSTRAINT "assessments_task_id_roadmap_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."roadmap_tasks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notes" ADD CONSTRAINT "notes_task_id_roadmap_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."roadmap_tasks"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notes" ADD CONSTRAINT "notes_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_progress" ADD CONSTRAINT "project_progress_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_tasks" ADD CONSTRAINT "project_tasks_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_month_id_roadmap_months_id_fk" FOREIGN KEY ("month_id") REFERENCES "public"."roadmap_months"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "roadmap_milestones" ADD CONSTRAINT "roadmap_milestones_month_id_roadmap_months_id_fk" FOREIGN KEY ("month_id") REFERENCES "public"."roadmap_months"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "roadmap_tasks" ADD CONSTRAINT "roadmap_tasks_month_id_roadmap_months_id_fk" FOREIGN KEY ("month_id") REFERENCES "public"."roadmap_months"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "roadmap_tasks" ADD CONSTRAINT "roadmap_tasks_week_id_roadmap_weeks_id_fk" FOREIGN KEY ("week_id") REFERENCES "public"."roadmap_weeks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "roadmap_weeks" ADD CONSTRAINT "roadmap_weeks_month_id_roadmap_months_id_fk" FOREIGN KEY ("month_id") REFERENCES "public"."roadmap_months"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "skill_tasks" ADD CONSTRAINT "skill_tasks_skill_id_skills_id_fk" FOREIGN KEY ("skill_id") REFERENCES "public"."skills"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "skill_tasks" ADD CONSTRAINT "skill_tasks_task_id_roadmap_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."roadmap_tasks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "study_sessions" ADD CONSTRAINT "study_sessions_task_id_roadmap_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."roadmap_tasks"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "study_sessions" ADD CONSTRAINT "study_sessions_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subtasks" ADD CONSTRAINT "subtasks_task_id_roadmap_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."roadmap_tasks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_progress" ADD CONSTRAINT "task_progress_task_id_roadmap_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."roadmap_tasks"("id") ON DELETE cascade ON UPDATE no action;