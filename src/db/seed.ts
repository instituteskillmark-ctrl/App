import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import {
  roadmapMonths,
  roadmapWeeks,
  roadmapTasks,
  subtasks,
  projects,
  roadmapMilestones,
  userSettings,
  skills,
  assessments,
  assessmentQuestions,
  taskProgress,
  projectProgress,
} from './schema';

const connectionString = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL || '';
if (!connectionString) {
  console.error('❌ No DATABASE_URL_UNPOOLED or DATABASE_URL found in environment');
  process.exit(1);
}
const seedClient = postgres(connectionString, { max: 1, prepare: false });
const db = drizzle(seedClient);

interface TaskDef {
  week: number;
  order: number;
  priority: 'BASICS_ENOUGH' | 'IMPORTANT' | 'MASTER';
  duration: string;
  title: string;
  desc: string;
  subtopics: string[];
  question?: { text: string; options: string[]; correct: number; explanation: string };
}

async function seedMonthTasks(monthId: string, weekIdMap: Record<number, string>, tasksDef: TaskDef[]) {
  const tasksToInsert = tasksDef.map((t) => ({
    monthId,
    weekId: weekIdMap[t.week],
    title: t.title,
    durationLabel: t.duration,
    priority: t.priority,
    orderIndex: t.order,
    description: t.desc,
  }));

  const insertedTasks = await db.insert(roadmapTasks).values(tasksToInsert).returning();

  const subtasksToInsert: Array<{ taskId: string; title: string; orderIndex: number }> = [];
  const assessmentsToInsert: Array<{ taskId: string; title: string; description: string; passingScore: number; taskIdx: number }> = [];
  const questionsMap = new Map<number, { text: string; options: string[]; correct: number; explanation: string }>();

  for (let idx = 0; idx < tasksDef.length; idx++) {
    const t = tasksDef[idx];
    const task = insertedTasks[idx];

    for (let i = 0; i < t.subtopics.length; i++) {
      subtasksToInsert.push({
        taskId: task.id,
        title: t.subtopics[i],
        orderIndex: i + 1,
      });
    }

    if (t.priority === 'MASTER' || t.priority === 'IMPORTANT' || t.question) {
      assessmentsToInsert.push({
        taskId: task.id,
        title: `${t.title} Verification Check`,
        description: `Verify your functional understanding of ${t.title}.`,
        passingScore: 80,
        taskIdx: idx,
      });
      if (t.question) {
        questionsMap.set(idx, t.question);
      }
    }
  }

  if (subtasksToInsert.length > 0) {
    await db.insert(subtasks).values(subtasksToInsert);
  }

  if (assessmentsToInsert.length > 0) {
    const insertedAssessments = await db
      .insert(assessments)
      .values(assessmentsToInsert.map((a) => ({ taskId: a.taskId, title: a.title, description: a.description, passingScore: a.passingScore })))
      .returning();

    const questionsToInsert: Array<{ assessmentId: string; questionText: string; optionsJson: string; correctAnswerIndex: number; answerExplanation: string; orderIndex: number }> = [];
    for (let i = 0; i < assessmentsToInsert.length; i++) {
      const ass = insertedAssessments[i];
      const taskIdx = assessmentsToInsert[i].taskIdx;
      const q = questionsMap.get(taskIdx) || {
        text: `What is the key principle behind ${tasksDef[taskIdx].title}?`,
        options: [
          `Understanding functional mechanics, data flow, and error handling`,
          `Skipping documentation and testing`,
          `Hardcoding all configuration values`,
          `Relying on manual execution`,
        ],
        correct: 0,
        explanation: `Proper automation requires understanding data flow and error recovery.`,
      };

      questionsToInsert.push({
        assessmentId: ass.id,
        questionText: q.text,
        optionsJson: JSON.stringify(q.options),
        correctAnswerIndex: q.correct,
        answerExplanation: q.explanation,
        orderIndex: 1,
      });
    }

    if (questionsToInsert.length > 0) {
      await db.insert(assessmentQuestions).values(questionsToInsert);
    }
  }

  return insertedTasks;
}

export async function seedRoadmap() {
  console.log('🌱 Starting Phase 1 Roadmap Source-of-Truth Seed (6 Months — Verified Against Roadmap Images)...');

  // Clear existing roadmap tables to guarantee a clean re-seed
  try {
    await db.delete(taskProgress);
    await db.delete(projectProgress);
    await db.delete(subtasks);
    await db.delete(assessmentQuestions);
    await db.delete(assessments);
    await db.delete(roadmapTasks);
    await db.delete(roadmapWeeks);
    await db.delete(projects);
    await db.delete(roadmapMonths);
    await db.delete(roadmapMilestones);
    await db.delete(skills);
    await db.delete(userSettings);
  } catch (err) {
    console.log('Seed cleanup note:', err);
  }

  // ============================================================
  // MONTH 1: Automation Thinking + n8n Basics
  // Source: Roadmap Image 1 (4 weeks | 20 tasks | Weeks 1-4)
  // ============================================================
  console.log('  → Seeding Month 1...');
  const [m1] = await db.insert(roadmapMonths).values({
    monthNumber: 1,
    title: 'Automation Thinking + n8n Basics',
    subtitle: 'From Zero to Problem Solver — Build your first real workflow',
    durationWeeks: '4 weeks',
    keyOutput: 'Simple automation workflow (working + error handling)',
  }).returning();

  const m1WeekDefs = [
    { weekNumber: 1, title: 'Week 1: Automation Mindset & Use Cases (Days 1–7)' },
    { weekNumber: 2, title: 'Week 2: n8n Interface & Nodes (Days 8–14)' },
    { weekNumber: 3, title: 'Week 3: Integrations & Real Workflows (Days 15–21)' },
    { weekNumber: 4, title: 'Week 4: Testing, Debugging & Final Project (Days 22–28)' },
  ];

  const w1Ids: Record<number, string> = {};
  for (const w of m1WeekDefs) {
    const [insertedW] = await db.insert(roadmapWeeks).values({ monthId: m1.id, weekNumber: w.weekNumber, title: w.title }).returning();
    w1Ids[w.weekNumber] = insertedW.id;
  }

  const m1Tasks: TaskDef[] = [
    { week: 1, order: 1, priority: 'BASICS_ENOUGH', duration: '1 day', title: '1.1 What is automation? (real-world examples)', desc: 'Understand what automation is, how it works, and where it can be used in daily life & business.', subtopics: ['Automation mindset definition', 'Real-world examples (saving email attachments, Slack notifications)', 'Simple explanation: letting tools do repetitive work'] },
    { week: 1, order: 2, priority: 'IMPORTANT', duration: '1 day', title: '1.2 Identify manual tasks in your daily life/work', desc: 'Identify manual, repetitive tasks that can be automated to save time.', subtopics: ['Audit daily workflow for repetitive tasks', 'Calculate potential time savings', 'Select high-impact automation candidates'] },
    { week: 1, order: 3, priority: 'MASTER', duration: '1 day', title: '1.3 Learn the automation workflow (Trigger + Action)', desc: 'Master core automation mechanics: Trigger events and Action executions.', subtopics: ['Understand Trigger vs Action concepts', 'Map input data to output actions', 'Design basic logic flows'] },
    { week: 1, order: 4, priority: 'BASICS_ENOUGH', duration: '1 day', title: '1.4 Explore popular tools (n8n, Zapier, Make, etc.)', desc: 'Compare low-code and open-source automation platforms.', subtopics: ['Compare n8n vs Zapier vs Make', 'Understand self-hosted vs cloud options', 'Evaluate cost, privacy, and flexibility'] },
    { week: 1, order: 5, priority: 'IMPORTANT', duration: '1 day', title: '1.5 Choose 3 real use cases (personal or business)', desc: 'Define 3 concrete automation use cases to build during your training.', subtopics: ['Define email attachment automation', 'Define notification & alert workflow', 'Define lead data logging workflow'] },
    { week: 2, order: 6, priority: 'IMPORTANT', duration: '1 day', title: '2.1 Install n8n (cloud or local)', desc: 'Get n8n running locally via Desktop/Docker or on n8n Cloud.', subtopics: ['Set up n8n Cloud account or Docker desktop', 'Verify canvas loading & settings', 'Configure environment variables'] },
    { week: 2, order: 7, priority: 'MASTER', duration: '1 day', title: '2.2 Understand the UI (workflows, credentials, settings)', desc: 'Master n8n workflow canvas, node configuration drawer, credentials, and execution log.', subtopics: ['Navigate workflow list and canvas controls', 'Configure node settings and expression editor', 'Manage stored API credentials'] },
    { week: 2, order: 8, priority: 'MASTER', duration: '1 day', title: '2.3 Learn core nodes (Webhook, HTTP Request, IF, Set, Filter)', desc: 'Master foundational n8n nodes for receiving data, sending requests, and filtering logic.', subtopics: ['Configure Webhook trigger node', 'Configure HTTP Request node for API calls', 'Use IF node, Set node, and Filter node'] },
    { week: 2, order: 9, priority: 'IMPORTANT', duration: '1 day', title: '2.4 Connect a simple service (Gmail/Slack/Notion)', desc: 'Authenticate and connect first external SaaS service inside n8n.', subtopics: ['Set up OAuth or API key credentials', 'Connect Gmail or Slack node', 'Test connection & send test message'] },
    { week: 2, order: 10, priority: 'MASTER', duration: '1 day', title: '2.5 Practice data flow between nodes', desc: 'Understand input/output data structure between sequential n8n nodes.', subtopics: ['Inspect execution JSON data structure', 'Map fields using drag-and-drop expressions', 'Verify data flow across 3+ nodes'] },
    { week: 3, order: 11, priority: 'IMPORTANT', duration: '1 day', title: '3.1 Gmail integration (send & read emails)', desc: 'Build automated email reading and response triggers.', subtopics: ['Configure Gmail On Email Received trigger', 'Filter incoming emails by subject/sender', 'Automate dynamic email replies'] },
    { week: 3, order: 12, priority: 'IMPORTANT', duration: '1 day', title: '3.2 Slack integration (send messages)', desc: 'Send rich formatted notifications to Slack channels.', subtopics: ['Create Slack Bot credential', 'Post channel messages with formatted data', 'Send direct alerts on events'] },
    { week: 3, order: 13, priority: 'IMPORTANT', duration: '1 day', title: '3.3 Google Sheets / Notion integration', desc: 'Append and update rows in Google Sheets or Notion databases.', subtopics: ['Connect Google Sheets OAuth', 'Append new rows automatically', 'Query and update existing records'] },
    { week: 3, order: 14, priority: 'MASTER', duration: '2 days', title: '3.4 Build 2–3 real workflows (e.g., email → Slack)', desc: 'Combine multiple integrations into functional end-to-end automations.', subtopics: ['Build Email to Slack alert workflow', 'Build Form submission to Notion workflow', 'Build New Sheet row to Email notification'] },
    { week: 3, order: 15, priority: 'IMPORTANT', duration: '1 day', title: '3.5 Learn about credentials and secure connections', desc: 'Securely manage credentials and avoid exposing secrets.', subtopics: ['Understand API key vs OAuth 2.0 security', 'Store environment variables safely', 'Audit workflow security settings'] },
    { week: 4, order: 16, priority: 'MASTER', duration: '1 day', title: '4.1 Learn error handling (try/catch, continue on fail)', desc: 'Implement error handling nodes to handle unexpected execution failures gracefully.', subtopics: ['Configure Continue On Fail setting', 'Use Error Trigger node for alert routing', 'Implement fallback defaults'] },
    { week: 4, order: 17, priority: 'MASTER', duration: '1 day', title: '4.2 Debugging techniques (logs, error messages)', desc: 'Analyze n8n execution history logs to troubleshoot broken workflows.', subtopics: ['Inspect node error trace & payload', 'Re-run past executions with sample data', 'Fix expression data type mismatches'] },
    { week: 4, order: 18, priority: 'IMPORTANT', duration: '1 day', title: '4.3 Set up notifications (email/Slack for errors)', desc: 'Configure automatic Slack or email alerts when any workflow fails in production.', subtopics: ['Create global Error Workflow in n8n', 'Format error details (workflow name, error message)', 'Send immediate alert to Slack/email'] },
    { week: 4, order: 19, priority: 'MASTER', duration: '2 days', title: '4.4 Build your first complete project (Email to Drive + Slack)', desc: 'Build Mini Project 1: Save email attachments to Drive, notify Slack, log to Sheets.', subtopics: ['Trigger on new email attachment', 'Save attachment file to Google Drive', 'Post notification to Slack & append Sheet row'] },
    { week: 4, order: 20, priority: 'IMPORTANT', duration: '1 day', title: '4.5 Document your workflow (screenshots + notes)', desc: 'Create professional documentation for your automation workflow.', subtopics: ['Take clear workflow canvas screenshots', 'Write setup & credentials README', 'Document trigger criteria & node dependencies'] },
  ];
  await seedMonthTasks(m1.id, w1Ids, m1Tasks);
  console.log('  ✅ Month 1 seeded (4 weeks, 20 tasks).');

  // ============================================================
  // MONTH 2: Technical Foundations (APIs, HTTP, OAuth, Webhooks)
  // Source: Roadmap Image 2 (4.5 weeks ~27 days | 5 weeks | 6 tasks | Weeks 5-9)
  // ============================================================
  console.log('  → Seeding Month 2...');
  const [m2] = await db.insert(roadmapMonths).values({
    monthNumber: 2,
    title: 'Technical Foundations (APIs, HTTP, OAuth, Webhooks)',
    subtitle: 'Understand how systems talk to each other — Master HTTP, REST, Auth & Webhooks',
    durationWeeks: '4.5 weeks (~27 Days)',
    keyOutput: 'Google Form submission → n8n Webhook trigger → Save to Google Sheets + Send Email Notification',
  }).returning();

  const m2WeekDefs = [
    { weekNumber: 5, title: 'Week 1 (Days 1–5): HTTP Fundamentals' },
    { weekNumber: 6, title: 'Week 2 (Days 6–12): APIs & Postman' },
    { weekNumber: 7, title: 'Week 3 (Days 13–17): Webhooks' },
    { weekNumber: 8, title: 'Week 4 (Days 18–22): OAuth 2.0 & Security' },
    { weekNumber: 9, title: 'Week 5 (Days 23–27): Security & Mini Project (Custom API + JavaScript)' },
  ];

  const w2Ids: Record<number, string> = {};
  for (const w of m2WeekDefs) {
    const [insertedW] = await db.insert(roadmapWeeks).values({ monthId: m2.id, weekNumber: w.weekNumber, title: w.title }).returning();
    w2Ids[w.weekNumber] = insertedW.id;
  }

  const m2Tasks: TaskDef[] = [
    { week: 5, order: 1, priority: 'MASTER', duration: '5 Days', title: '1. HTTP Fundamentals', desc: 'Understand how data is requested and sent across the web using standard protocols.', subtopics: ['Client-Server model basics', 'HTTP methods: GET, POST, PUT, DELETE, PATCH', 'HTTP headers & Content-Type (application/json)', 'HTTP response status codes (2xx, 4xx, 5xx)', 'JSON format parsing and structures'] },
    { week: 6, order: 2, priority: 'MASTER', duration: '1 Week', title: '2. APIs & Postman', desc: 'Learn REST API principles and practice sending requests using Postman.', subtopics: ['What is a REST API and endpoint URIs', 'API documentation reading skills', 'Installing and setting up Postman', 'Building GET and POST requests in Postman', 'Passing Query Parameters vs Request Body', 'Authentication methods (API Keys, Bearer Tokens)', 'Testing public APIs (JSONPlaceholder, ReqRes, OpenWeather)'] },
    { week: 7, order: 3, priority: 'MASTER', duration: '5 Days', title: '3. Webhooks', desc: 'Understand event-driven architecture using Webhooks.', subtopics: ['Webhooks vs Polling (push vs pull)', 'Setting up Webhook triggers in n8n', 'Payload inspection and parsing', 'Testing webhooks with Webhook.site & Postman', 'Handling async responses and retries'] },
    { week: 8, order: 4, priority: 'MASTER', duration: '5 Days', title: '4. OAuth 2.0', desc: 'Master modern authorization flows used by SaaS platforms.', subtopics: ['OAuth 2.0 concepts: Client ID, Secret, Scopes', 'Authorization Code Flow vs Refresh Tokens', 'Configuring OAuth in n8n and Postman', 'Handling token expiration & refresh logic'] },
    { week: 9, order: 5, priority: 'IMPORTANT', duration: '4 Days', title: '5. Security & Best Practices', desc: 'Implement secure practices for handling keys and sensitive payloads.', subtopics: ['Securing API keys and secret tokens', 'Environment variables (.env)', 'Rate limits & throttling concepts', 'Basic error handling for failed API calls'] },
    { week: 9, order: 6, priority: 'MASTER', duration: '1 Month Project', title: '6. Mini Project – Custom API + JavaScript (Google Form → Sheets + Email)', desc: 'Build Month 2 Milestone Project: Webhook trigger from Google Form → n8n → Save Sheet row + Send Email.', subtopics: ['Configure Google Form webhook trigger', 'Parse incoming JSON payload in n8n', 'Save submission to Google Sheets database', 'Send automated formatted email confirmation', 'Add error handling node for delivery failures'] },
  ];
  await seedMonthTasks(m2.id, w2Ids, m2Tasks);
  console.log('  ✅ Month 2 seeded (5 weeks, 6 tasks).');

  // ============================================================
  // MONTH 3: Logic, Data & Databases
  // Source: Roadmap Image 3 (5 weeks | 5 tasks | Weeks 10-14)
  // ============================================================
  console.log('  → Seeding Month 3...');
  const [m3] = await db.insert(roadmapMonths).values({
    monthNumber: 3,
    title: 'Logic, Data & Databases',
    subtitle: 'Store, query, and transform data like a developer — Master SQL, Supabase & n8n Data Operations',
    durationWeeks: '5 weeks',
    keyOutput: 'CRM / Task Manager DB — Database-driven workflow with custom logic, status transitions, and error retries',
  }).returning();

  const m3WeekDefs = [
    { weekNumber: 10, title: 'Week 1 (Days 1–7): Logic & Flow Control (n8n Advanced)' },
    { weekNumber: 11, title: 'Week 2 (Days 8–14): Databases — PostgreSQL & Supabase Setup' },
    { weekNumber: 12, title: 'Week 3 (Days 15–21): SQL Queries & CRUD Operations' },
    { weekNumber: 13, title: 'Week 4 (Days 22–28): Error Handling & Workflow Reliability' },
    { weekNumber: 14, title: 'Week 5 (Days 29–35): Month 3 Mini Project — CRM / Task Manager DB' },
  ];

  const w3Ids: Record<number, string> = {};
  for (const w of m3WeekDefs) {
    const [insertedW] = await db.insert(roadmapWeeks).values({ monthId: m3.id, weekNumber: w.weekNumber, title: w.title }).returning();
    w3Ids[w.weekNumber] = insertedW.id;
  }

  const m3Tasks: TaskDef[] = [
    { week: 10, order: 1, priority: 'MASTER', duration: '1 Week', title: '1. Advanced Logic & Flow Control in n8n', desc: 'Master data transformation, conditional branching, and looping across arrays in n8n.', subtopics: ['Switch node vs IF node conditional routing', 'Looping over item lists (Split in Batches)', 'Data transformation with Code/Edit Fields nodes', 'Merging multiple branch execution outputs', 'Aggregate node to combine array items'] },
    { week: 11, order: 2, priority: 'MASTER', duration: '1.5 Weeks', title: '2. Databases (PostgreSQL / Supabase)', desc: 'Learn relational database design, table schemas, and Supabase integration.', subtopics: ['Relational DB concepts: Tables, Rows, Columns, Primary/Foreign Keys', 'Setting up Supabase project & database tables', 'Data types: VARCHAR, INTEGER, BOOLEAN, TIMESTAMP, JSONB', 'Connecting n8n to PostgreSQL / Supabase via Postgres Node'] },
    { week: 12, order: 3, priority: 'MASTER', duration: '1 Week', title: '3. SQL Basics & CRUD Operations', desc: 'Write SQL queries to perform create, read, update, and delete actions directly.', subtopics: ['SELECT, WHERE, ORDER BY, LIMIT queries', 'INSERT INTO to save workflow outputs', 'UPDATE and DELETE commands', 'Executing raw SQL inside n8n Postgres node', 'Data normalization and clean schema design'] },
    { week: 13, order: 4, priority: 'MASTER', duration: '1 Week', title: '4. Error Handling & Reliability', desc: 'Build robust automation pipelines that recover automatically from database and API errors.', subtopics: ['Try/Catch patterns in n8n workflow design', 'Retry on failure node settings & exponential backoff', 'Logging execution errors into PostgreSQL error log table', 'Dead Letter Queue concept for failed payloads'] },
    { week: 14, order: 5, priority: 'MASTER', duration: '1 Week', title: '5. Month 3 Mini Project — CRM / Task Manager DB', desc: 'Build a relational task/lead manager database in Supabase connected to n8n workflows.', subtopics: ['Design Supabase schema for Leads & Task tables', 'Build n8n webhook to insert new leads into DB', 'Implement automated status updates & notifications', 'Create error retry triggers and status dashboard queries'] },
  ];
  await seedMonthTasks(m3.id, w3Ids, m3Tasks);
  console.log('  ✅ Month 3 seeded (5 weeks, 5 tasks).');

  // ============================================================
  // MONTH 4: JavaScript Basics + Custom Code
  // Source: Roadmap Image 4 (4 weeks | 6 tasks | Weeks 15-18)
  // ============================================================
  console.log('  → Seeding Month 4...');
  const [m4] = await db.insert(roadmapMonths).values({
    monthNumber: 4,
    title: 'JavaScript Basics + Custom Code',
    subtitle: 'Write code inside workflows — Master JS syntax, arrays, JSON & HTTP requests',
    durationWeeks: '4 weeks',
    keyOutput: 'Custom API Integration Hub — Real-world data fetcher displaying external API data using JS',
  }).returning();

  const m4WeekDefs = [
    { weekNumber: 15, title: 'Week 1 (Days 1–7): JS Fundamentals & Data Types' },
    { weekNumber: 16, title: 'Week 2 (Days 8–14): Array Methods & Data Transformation' },
    { weekNumber: 17, title: 'Week 3 (Days 15–21): Async JS & API Calls (fetch/axios)' },
    { weekNumber: 18, title: 'Week 4 (Days 22–28): n8n Code Node & Month 4 Mini Project' },
  ];

  const w4Ids: Record<number, string> = {};
  for (const w of m4WeekDefs) {
    const [insertedW] = await db.insert(roadmapWeeks).values({ monthId: m4.id, weekNumber: w.weekNumber, title: w.title }).returning();
    w4Ids[w.weekNumber] = insertedW.id;
  }

  const m4Tasks: TaskDef[] = [
    { week: 15, order: 1, priority: 'MASTER', duration: '1 Week', title: '1. JS Fundamentals', desc: 'Master core JavaScript syntax: variables, functions, conditionals, and data types.', subtopics: ['Variables: const, let, var & scoping rules', 'Data types: String, Number, Boolean, Array, Object, null, undefined', 'Functions: arrow functions vs standard functions', 'Control flow: if/else, ternary operators, switch'] },
    { week: 16, order: 2, priority: 'MASTER', duration: '1 Week', title: '2. Working with JSON, Arrays & Objects', desc: 'Manipulate JSON objects and array structures commonly produced by APIs.', subtopics: ['Object properties, dot notation & bracket notation', 'JSON parsing and stringifying (JSON.parse / JSON.stringify)', 'Array iteration: map(), filter(), forEach(), reduce(), find()', 'Destructuring assignment for clean data extraction'] },
    { week: 17, order: 3, priority: 'MASTER', duration: '1 Week', title: '3. Async JS & Promises', desc: 'Understand async/await execution, Promises, and making HTTP requests with fetch/axios.', subtopics: ['Synchronous vs Asynchronous execution model', 'Promises: resolve, reject, then(), catch()', 'Async / Await syntax for clean asynchronous code', 'Making API requests with fetch() and axios library'] },
    { week: 18, order: 4, priority: 'MASTER', duration: '3 Days', title: '4. JavaScript in n8n (Code Node)', desc: 'Write custom JavaScript scripts inside n8n Code nodes to handle complex payload logic.', subtopics: ['Accessing input items in n8n Code node ($input.all())', 'Modifying and returning custom item arrays ($input.first().json)', 'Error handling inside JS code nodes (try/catch)', 'Utility libraries in n8n Code node (Luxon for dates, Lodash)'] },
    { week: 18, order: 5, priority: 'IMPORTANT', duration: '2 Days', title: '5. Debugging JavaScript Code', desc: 'Use console.log, breakpoints, and trial execution to fix scripting errors rapidly.', subtopics: ['Using console.log() and inspecting terminal/n8n output', 'Handling TypeError, ReferenceError, and undefined properties', 'Validating API response payloads before property dereferencing'] },
    { week: 18, order: 6, priority: 'MASTER', duration: '1 Week', title: '6. Month 4 Mini Project — Custom API Integration Hub', desc: 'Build a custom JavaScript data fetcher and processor integrating public APIs into n8n.', subtopics: ['Fetch data from 2+ public APIs using fetch/axios inside JS code node', 'Transform & combine payloads using array map/filter methods', 'Output structured JSON payload to n8n workflow canvas', 'Display parsed outputs on a simple HTML/JS browser interface'] },
  ];
  await seedMonthTasks(m4.id, w4Ids, m4Tasks);
  console.log('  ✅ Month 4 seeded (4 weeks, 6 tasks).');

  // ============================================================
  // MONTH 5: AI Automation + AI Agents
  // Source: Roadmap Image 5 (5 weeks | 9 tasks | Weeks 19-23)
  // ============================================================
  console.log('  → Seeding Month 5...');
  const [m5] = await db.insert(roadmapMonths).values({
    monthNumber: 5,
    title: 'AI Automation + AI Agents',
    subtitle: 'Build intelligent, autonomous systems — LLMs, Vector DBs, RAG & n8n AI Agents',
    durationWeeks: '5 weeks',
    keyOutput: 'Real AI Workflow Project — AI Email Assistant or AI Support Bot (RAG)',
  }).returning();

  const m5WeekDefs = [
    { weekNumber: 19, title: 'Week 1 (Days 1–7): AI Fundamentals & Prompt Engineering' },
    { weekNumber: 20, title: 'Week 2 (Days 8–14): OpenAI API & Structured Outputs' },
    { weekNumber: 21, title: 'Week 3 (Days 15–21): Vector DBs & RAG Architecture' },
    { weekNumber: 22, title: 'Week 4 (Days 22–28): n8n AI Agents & Tools' },
    { weekNumber: 23, title: 'Week 5 (Days 29–35): Month 5 Real Project — AI Support Bot (RAG)' },
  ];

  const w5Ids: Record<number, string> = {};
  for (const w of m5WeekDefs) {
    const [insertedW] = await db.insert(roadmapWeeks).values({ monthId: m5.id, weekNumber: w.weekNumber, title: w.title }).returning();
    w5Ids[w.weekNumber] = insertedW.id;
  }

  const m5Tasks: TaskDef[] = [
    { week: 19, order: 1, priority: 'MASTER', duration: '3 Days', title: '1. AI & LLM Fundamentals', desc: 'Understand Large Language Models, tokenization, context windows, and model parameters.', subtopics: ['How LLMs work (Tokens, Embeddings, Parameters)', 'Temperature, Top-P, and Max Tokens configuration', 'Comparing OpenAI GPT-4o, Anthropic Claude 3.5, and open-source models (Ollama/Llama)'] },
    { week: 19, order: 2, priority: 'MASTER', duration: '4 Days', title: '2. Prompt Engineering for Developers', desc: 'Design robust system prompts, zero-shot/few-shot prompts, and role instructions.', subtopics: ['System Prompts vs User Prompts vs Assistant Messages', 'Few-shot prompting with concrete output examples', 'Instruction formatting (Markdown, XML tags)', 'Preventing hallucination & scope drift'] },
    { week: 20, order: 3, priority: 'MASTER', duration: '4 Days', title: '3. OpenAI API Integration', desc: 'Connect OpenAI API directly inside n8n and Node.js code.', subtopics: ['OpenAI API Key setup & usage limits', 'Chat Completions endpoint API calls', 'Integrating OpenAI Node in n8n'] },
    { week: 20, order: 4, priority: 'MASTER', duration: '3 Days', title: '4. Structured JSON Outputs & Function Calling', desc: 'Enforce JSON schema output mode for reliable data parsing from AI responses.', subtopics: ['JSON mode & response_format in OpenAI API', 'Function Calling / Tool Calling definitions', 'Parsing AI JSON responses safely inside n8n'] },
    { week: 21, order: 5, priority: 'MASTER', duration: '4 Days', title: '5. Vector Databases & Embeddings', desc: 'Understand vector embeddings and set up Pinecone / Supabase Vector (pgvector).', subtopics: ['What are vector embeddings & cosine similarity', 'Generating embeddings via OpenAI text-embedding-3-small', 'Setting up Pinecone or Supabase pgvector', 'Performing similarity search queries'] },
    { week: 21, order: 6, priority: 'MASTER', duration: '3 Days', title: '6. RAG Architecture (Retrieval Augmented Generation)', desc: 'Build RAG pipelines to answer user queries accurately using dynamic custom documentation.', subtopics: ['Document loading, cleaning & chunking strategies', 'Storing vector chunks in Vector DB', 'Retrieval context injection into LLM prompts', 'Evaluating RAG output accuracy & grounding'] },
    { week: 22, order: 7, priority: 'MASTER', duration: '4 Days', title: '7. n8n AI Agents & LangChain Integration', desc: 'Build autonomous AI agents in n8n using built-in AI Agent nodes.', subtopics: ['n8n AI Agent node setup (Tools, Agent Types)', 'Attaching custom tools (HTTP Request, Code, DB Search)', 'Configuring Agent Memory (Window Buffer Memory)', 'Agent decision loops and error recovery'] },
    { week: 22, order: 8, priority: 'IMPORTANT', duration: '3 Days', title: '8. Guardrails, Cost Management & Safety', desc: 'Implement rate limits, token cost monitoring, and input validation guardrails.', subtopics: ['Token cost estimation & budget controls', 'Input sanitization & prompt injection prevention', 'Handling AI service outages gracefully with fallbacks'] },
    { week: 23, order: 9, priority: 'MASTER', duration: '1 Week', title: '9. Month 5 Real Workflow Project — AI Support Bot (RAG)', desc: 'Build an end-to-end AI Support Bot answering customer tickets using RAG & n8n AI Agents.', subtopics: ['Ingest support documentation into Pinecone/Supabase vector store', 'Build n8n AI Agent connected to Vector Search Tool & Email Node', 'Route incoming user queries to AI RAG pipeline', 'Generate structured responses and auto-reply or escalate to human agent', 'Log conversation history and performance metrics'] },
  ];
  await seedMonthTasks(m5.id, w5Ids, m5Tasks);
  console.log('  ✅ Month 5 seeded (5 weeks, 9 tasks).');

  // ============================================================
  // MONTH 6: Production, Portfolio & Client Readiness
  // Source: Roadmap Image 6 (5 weeks | 6 tasks | Weeks 24-28)
  // ============================================================
  console.log('  → Seeding Month 6...');
  const [m6] = await db.insert(roadmapMonths).values({
    monthNumber: 6,
    title: 'Production, Portfolio & Client Readiness',
    subtitle: 'Ship real-world solutions — Deploy, optimize, build portfolio, and prepare for clients',
    durationWeeks: '4.5 weeks (~27 Days)',
    keyOutput: '6 Complete Production-Ready Automation Projects + Professional Developer Portfolio',
  }).returning();

  const m6WeekDefs = [
    { weekNumber: 24, title: 'Week 1 (Days 1–5): Lead Management System (Project 1)' },
    { weekNumber: 25, title: 'Week 2 (Days 6–10): E-commerce Order Automation (Project 2)' },
    { weekNumber: 26, title: 'Week 3 (Days 11–15): AI Email Assistant with RAG (Project 3)' },
    { weekNumber: 27, title: 'Week 4 (Days 16–20): Social Media Auto Poster (Project 4)' },
    { weekNumber: 28, title: 'Week 5 (Days 21–24): Expense Tracker (Project 5)' },
    { weekNumber: 29, title: 'Week 6 (Days 25–27): Custom API Integration Hub (Project 6) + Portfolio' },
  ];

  const w6Ids: Record<number, string> = {};
  for (const w of m6WeekDefs) {
    const [insertedW] = await db.insert(roadmapWeeks).values({ monthId: m6.id, weekNumber: w.weekNumber, title: w.title }).returning();
    w6Ids[w.weekNumber] = insertedW.id;
  }

  const m6Tasks: TaskDef[] = [
    { week: 24, order: 1, priority: 'MASTER', duration: '1 Week', title: '1. Lead Management System (Project 1)', desc: 'Automate lead collection, enrichment, and follow-ups for businesses.', subtopics: ['Webhook + form integration (Typeform, Google Forms)', 'Data validation & enrichment (Clearbit / Hunter.io)', 'Save to database (Supabase/PostgreSQL)', 'Auto email/WhatsApp follow-ups', 'Basic dashboard for lead tracking'] },
    { week: 25, order: 2, priority: 'MASTER', duration: '1 Week', title: '2. E-commerce Order Automation (Project 2)', desc: 'Sync orders, update inventory and send notifications automatically.', subtopics: ['API integration (Shopify/Daraz, etc.)', 'Order data processing & transformation', 'Update inventory in database', 'Send customer & admin notifications', 'Handle errors & retry logic'] },
    { week: 26, order: 3, priority: 'MASTER', duration: '1 Week', title: '3. AI Email Assistant with RAG (Project 3)', desc: 'Create an AI assistant that answers from your own knowledge base.', subtopics: ['Vector database (Pinecone / Supabase)', 'Document loading & chunking', 'RAG (Retrieval Augmented Generation)', 'OpenAI API integration', 'Build a simple chat interface'] },
    { week: 27, order: 4, priority: 'IMPORTANT', duration: '1 Week', title: '4. Social Media Auto Poster (Project 4)', desc: 'Automatically create and post content to social media platforms.', subtopics: ['Social media APIs (Twitter/X, LinkedIn, etc.)', 'Dynamic content generation (AI + templates)', 'Scheduling & posting', 'Error handling & retries', 'Keep logs of posted content'] },
    { week: 28, order: 5, priority: 'IMPORTANT', duration: '1 Week', title: '5. Expense Tracker (Project 5)', desc: 'Track expenses, categorize them and get simple reports.', subtopics: ['Data input (form / email / CSV)', 'Categorization (using AI or rules)', 'Database storage', 'Generate charts/reports', 'User authentication (optional)'] },
    { week: 29, order: 6, priority: 'MASTER', duration: '1 Week', title: '6. Custom API Integration Hub (Project 6)', desc: 'Connect multiple APIs and manage them from a single interface.', subtopics: ['Work with multiple APIs', 'Handle authentication (API keys/OAuth)', 'Create a simple UI (vanilla JS)', 'Error handling & rate limits', 'Save and manage API responses'] },
  ];
  await seedMonthTasks(m6.id, w6Ids, m6Tasks);
  console.log('  ✅ Month 6 seeded (6 weeks, 6 tasks).');

  // ============================================================
  // PROJECTS TABLE (one per month, mapped to roadmap milestone projects)
  // ============================================================
  const projectList = [
    {
      projectNumber: 1,
      monthId: m1.id,
      title: 'Email to Drive + Slack (Month 1 Mini Project)',
      weekRange: 'Month 1 – Week 4',
      description: 'Save email attachments to Google Drive, notify Slack channel, and log results in Google Sheets.',
      techStack: 'n8n, Gmail API, Google Drive, Slack, Google Sheets',
    },
    {
      projectNumber: 2,
      monthId: m2.id,
      title: 'Custom API + Webhook Mini Project (Month 2)',
      weekRange: 'Month 2 – Week 5 (Day 24–27)',
      description: 'Google Form submission → n8n Webhook trigger → Save to Google Sheets + Send Email Notification.',
      techStack: 'n8n, REST APIs, Webhooks, Google Forms, Google Sheets, Gmail',
    },
    {
      projectNumber: 3,
      monthId: m3.id,
      title: 'CRM / Task Manager DB (Month 3 Mini Project)',
      weekRange: 'Month 3 – Week 5',
      description: 'Database-driven CRM with custom logic, status transitions, error retry triggers, and lead tracking.',
      techStack: 'PostgreSQL, Supabase, n8n, SQL',
    },
    {
      projectNumber: 4,
      monthId: m4.id,
      title: 'Custom API Integration Hub (Month 4 Mini Project)',
      weekRange: 'Month 4 – Week 4',
      description: 'Real-World Data Fetcher: fetch API data, display on UI, search/filter, use custom code in n8n.',
      techStack: 'JavaScript, fetch/axios, Node.js, n8n Code Node',
    },
    {
      projectNumber: 5,
      monthId: m5.id,
      title: 'AI Support Bot with RAG (Month 5 Real Project)',
      weekRange: 'Month 5 – Week 5',
      description: 'AI Email Assistant or Customer Support Bot: Vector DB + OpenAI embeddings + RAG + structured output validation.',
      techStack: 'OpenAI, Pinecone/Supabase (Vector DB), n8n, RAG Pipeline',
    },
    {
      projectNumber: 6,
      monthId: m6.id,
      title: 'E-commerce Order Automation (Month 6 Project 2)',
      weekRange: 'Month 6 – Week 2',
      description: 'Production automation: sync orders from Shopify/Daraz, update inventory in database, send customer & admin notifications.',
      techStack: 'Next.js, n8n, Supabase, Shopify/Daraz API',
    },
  ];

  for (const p of projectList) {
    const [insertedProj] = await db.insert(projects).values(p).returning();
    await db.insert(projectProgress).values({
      projectId: insertedProj.id,
      userId: 'default_user',
      status: 'NOT_STARTED',
      currentStage: 'PLANNING',
      notes: `${p.title} (${p.weekRange}) — not started yet`,
    });
  }
  console.log('  ✅ 6 projects seeded.');

  // ============================================================
  // SKILL MATRIX CATEGORIES & USER SETTINGS
  // ============================================================
  const skillCategories = [
    { category: 'Automation & n8n', title: 'n8n Workflows & Node Architecture', description: 'Nodes, triggers, webhooks, error retries, and execution logging.' },
    { category: 'APIs & Security', title: 'REST APIs & Security Protocols', description: 'HTTP verbs, Postman, OAuth 2.0, secrets management, and HMAC verification.' },
    { category: 'Databases & Data', title: 'Relational Schema & SQL Persistence', description: 'ACID transactions, PostgreSQL, Supabase, indexing, and CRUD queries.' },
    { category: 'JavaScript', title: 'Custom Code & Logic Scripting', description: 'ES6, Arrays & Objects, JSON parsing, fetch/axios API calls, and console debugging.' },
    { category: 'AI & RAG', title: 'LLM Agents & Knowledge Base Systems', description: 'Prompt engineering, Vector DBs, RAG, function calling, output validation, and guardrails.' },
    { category: 'Testing & DevOps', title: 'Production Operations & Deployment', description: 'Testing strategies, Git, VPS deployment, logging, observability, and cost control.' },
  ];

  for (let i = 0; i < skillCategories.length; i++) {
    await db.insert(skills).values({
      category: skillCategories[i].category,
      title: skillCategories[i].title,
      description: skillCategories[i].description,
      orderIndex: i + 1,
    });
  }

  await db.insert(userSettings).values({
    userId: 'default_user',
    dailyCommitmentHours: '2-3 hours',
    theme: 'dark',
    weeklyPlan: JSON.stringify({
      Mon: 'Learn (theory) (30-45 min)',
      Tue: 'Build / Practice (60-90 min)',
      Wed: 'Learn (docs) + notes (30-45 min)',
      Thu: 'Build / Debug (60-90 min)',
      Fri: 'Project Work (60-90 min)',
      Sat: 'Review + Improve (45-60 min)',
      Sun: 'Rest & Recharge',
    }),
  });

  console.log('\n✨ Phase 1 Roadmap Seed Completed Successfully!');
  console.log('📊 Expected final counts:');
  console.log('   Months  : 6');
  console.log('   Weeks   : 28 (M1:4 + M2:5 + M3:5 + M4:4 + M5:5 + M6:5)');
  console.log('   Tasks   : 52 (M1:20 + M2:6 + M3:5 + M4:6 + M5:9 + M6:6)');
  console.log('   Projects: 6');
}

seedRoadmap()
  .then(async () => {
    await seedClient.end();
    process.exit(0);
  })
  .catch(async (err) => {
    console.error('❌ Seed error:', err);
    await seedClient.end();
    process.exit(1);
  });
