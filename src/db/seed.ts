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

// Use direct (unpooled) connection for seed operations
const connectionString = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL || '';
if (!connectionString) {
  console.error('❌ No DATABASE_URL_UNPOOLED or DATABASE_URL found in environment');
  process.exit(1);
}
const seedClient = postgres(connectionString, { max: 1, prepare: false });
const db = drizzle(seedClient);

export async function seedRoadmap() {
  console.log('🌱 Starting Comprehensive Roadmap Audit & Seed (Month 1 - Month 6 Source of Truth)...');

  // Clear existing roadmap tables to guarantee a clean re-seed
  try {
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
  // MONTH 1: Automation Thinking + n8n Basics (4 Weeks)
  // ============================================================
  const [m1] = await db.insert(roadmapMonths).values({
    monthNumber: 1,
    title: 'Automation Thinking + n8n Basics',
    subtitle: 'From Zero to Problem Solver (Build your first real workflow)',
    durationWeeks: '4 weeks',
    keyOutput: 'Simple automation workflow (working + error handling)',
  }).returning();

  const m1Weeks = [
    { weekNumber: 1, title: 'Week 1 – Automation Mindset & Use Cases' },
    { weekNumber: 2, title: 'Week 2 – n8n Interface & Nodes' },
    { weekNumber: 3, title: 'Week 3 – Integrations & Real Workflows' },
    { weekNumber: 4, title: 'Week 4 – Testing, Debugging & Final Project' },
  ];

  const w1Ids: Record<number, string> = {};
  for (const w of m1Weeks) {
    const [insertedW] = await db.insert(roadmapWeeks).values({
      monthId: m1.id,
      weekNumber: w.weekNumber,
      title: w.title,
    }).returning();
    w1Ids[w.weekNumber] = insertedW.id;
  }

  const m1Tasks = [
    // Week 1
    { week: 1, order: 1, priority: 'BASICS_ENOUGH' as const, duration: '1 day', title: '1.1 What is automation? (real-world examples)', desc: 'Understand what automation is, how it works, and where it can be used in daily life & business.', subtopics: ['Automation mindset definition', 'Real-world examples (saving email attachments, Slack notifications)', 'Simple explanation: letting tools do repetitive work'] },
    { week: 1, order: 2, priority: 'IMPORTANT' as const, duration: '1 day', title: '1.2 Identify manual tasks in your daily life/work', desc: 'Identify manual, repetitive tasks that can be automated to save time.', subtopics: ['Audit daily workflow for repetitive tasks', 'Calculate potential time savings', 'Select high-impact automation candidates'] },
    { week: 1, order: 3, priority: 'MASTER' as const, duration: '1 day', title: '1.3 Learn the automation workflow (Trigger + Action)', desc: 'Master core automation mechanics: Trigger events and Action executions.', subtopics: ['Understand Trigger vs Action concepts', 'Map input data to output actions', 'Design basic logic flows'] },
    { week: 1, order: 4, priority: 'BASICS_ENOUGH' as const, duration: '1 day', title: '1.4 Explore popular tools (n8n, Zapier, Make, etc.)', desc: 'Compare low-code and open-source automation platforms.', subtopics: ['Compare n8n vs Zapier vs Make', 'Understand self-hosted vs cloud options', 'Evaluate cost, privacy, and flexibility'] },
    { week: 1, order: 5, priority: 'IMPORTANT' as const, duration: '1 day', title: '1.5 Choose 3 real use cases (personal or business)', desc: 'Define 3 concrete automation use cases to build during your training.', subtopics: ['Define email attachment automation', 'Define notification & alert workflow', 'Define lead data logging workflow'] },
    
    // Week 2
    { week: 2, order: 6, priority: 'IMPORTANT' as const, duration: '1 day', title: '2.1 Install n8n (cloud or local)', desc: 'Get n8n running locally via Desktop/Docker or on n8n Cloud.', subtopics: ['Set up n8n Cloud account or Docker desktop', 'Verify canvas loading & settings', 'Configure environment variables'] },
    { week: 2, order: 7, priority: 'MASTER' as const, duration: '1 day', title: '2.2 Understand the UI (workflows, credentials, settings)', desc: 'Master n8n workflow canvas, node configuration drawer, credentials, and execution log.', subtopics: ['Navigate workflow list and canvas controls', 'Configure node settings and expression editor', 'Manage stored API credentials'] },
    { week: 2, order: 8, priority: 'MASTER' as const, duration: '1 day', title: '2.3 Learn core nodes (Webhook, HTTP Request, IF, Set, Filter)', desc: 'Master foundational n8n nodes for receiving data, sending requests, and filtering logic.', subtopics: ['Configure Webhook trigger node', 'Configure HTTP Request node for API calls', 'Use IF node, Set node, and Filter node'] },
    { week: 2, order: 9, priority: 'IMPORTANT' as const, duration: '1 day', title: '2.4 Connect a simple service (Gmail/Slack/Notion)', desc: 'Authenticate and connect first external SaaS service inside n8n.', subtopics: ['Set up OAuth or API key credentials', 'Connect Gmail or Slack node', 'Test connection & send test message'] },
    { week: 2, order: 10, priority: 'MASTER' as const, duration: '1 day', title: '2.5 Practice data flow between nodes', desc: 'Understand input/output data structure between sequential n8n nodes.', subtopics: ['Inspect execution JSON data structure', 'Map fields using drag-and-drop expressions', 'Verify data flow across 3+ nodes'] },

    // Week 3
    { week: 3, order: 11, priority: 'IMPORTANT' as const, duration: '1 day', title: '3.1 Gmail integration (send & read emails)', desc: 'Build automated email reading and response triggers.', subtopics: ['Configure Gmail On Email Received trigger', 'Filter incoming emails by subject/sender', 'Automate dynamic email replies'] },
    { week: 3, order: 12, priority: 'IMPORTANT' as const, duration: '1 day', title: '3.2 Slack integration (send messages)', desc: 'Send rich formatted notifications to Slack channels.', subtopics: ['Create Slack Bot credential', 'Post channel messages with formatted data', 'Send direct alerts on events'] },
    { week: 3, order: 13, priority: 'IMPORTANT' as const, duration: '1 day', title: '3.3 Google Sheets / Notion integration', desc: 'Append and update rows in Google Sheets or Notion databases.', subtopics: ['Connect Google Sheets OAuth', 'Append new rows automatically', 'Query and update existing records'] },
    { week: 3, order: 14, priority: 'MASTER' as const, duration: '2 days', title: '3.4 Build 2-3 real workflows (e.g., email -> Slack)', desc: 'Combine multiple integrations into functional end-to-end automations.', subtopics: ['Build Email to Slack alert workflow', 'Build Form submission to Notion workflow', 'Build New Sheet row to Email notification'] },
    { week: 3, order: 15, priority: 'IMPORTANT' as const, duration: '1 day', title: '3.5 Learn about credentials and secure connections', desc: 'Securely manage credentials and avoid exposing secrets.', subtopics: ['Understand API key vs OAuth 2.0 security', 'Store environment variables safely', 'Audit workflow security settings'] },

    // Week 4
    { week: 4, order: 16, priority: 'MASTER' as const, duration: '1 day', title: '4.1 Learn error handling (try/catch, continue on fail)', desc: 'Implement error handling nodes to handle unexpected execution failures gracefully.', subtopics: ['Configure Continue On Fail setting', 'Use Error Trigger node for alert routing', 'Implement fallback defaults'] },
    { week: 4, order: 17, priority: 'MASTER' as const, duration: '1 day', title: '4.2 Debugging techniques (logs, error messages)', desc: 'Analyze n8n execution history logs to troubleshoot broken workflows.', subtopics: ['Inspect node error trace & payload', 'Re-run past executions with sample data', 'Fix expression data type mismatches'] },
    { week: 4, order: 18, priority: 'IMPORTANT' as const, duration: '1 day', title: '4.3 Set up notifications (email/Slack for errors)', desc: 'Configure automatic Slack or email alerts when any workflow fails in production.', subtopics: ['Create global Error Workflow in n8n', 'Format error details (workflow name, error message)', 'Send immediate alert to Slack/email'] },
    { week: 4, order: 19, priority: 'MASTER' as const, duration: '2 days', title: '4.4 Build your first complete project (Email to Drive + Slack)', desc: 'Build Mini Project 1: Save email attachments to Drive, notify Slack, log to Sheets.', subtopics: ['Trigger on new email attachment', 'Save attachment file to Google Drive', 'Post notification to Slack & append Sheet row'] },
    { week: 4, order: 20, priority: 'IMPORTANT' as const, duration: '1 day', title: '4.5 Document your workflow (screenshots + notes)', desc: 'Create professional documentation for your automation workflow.', subtopics: ['Take clear workflow canvas screenshots', 'Write setup & credentials README', 'Document trigger criteria & node dependencies'] },
  ];

  for (const t of m1Tasks) {
    const [task] = await db.insert(roadmapTasks).values({
      monthId: m1.id,
      weekId: w1Ids[t.week],
      title: t.title,
      durationLabel: t.duration,
      priority: t.priority,
      orderIndex: t.order,
      description: t.desc,
    }).returning();

    for (let i = 0; i < t.subtopics.length; i++) {
      await db.insert(subtasks).values({
        taskId: task.id,
        title: t.subtopics[i],
        orderIndex: i + 1,
      });
    }

    if (t.priority === 'MASTER' || t.priority === 'IMPORTANT') {
      const [ass] = await db.insert(assessments).values({
        taskId: task.id,
        title: `${t.title} Verification Check`,
        description: `Verify your functional understanding of ${t.title}.`,
        passingScore: 80,
      }).returning();

      await db.insert(assessmentQuestions).values({
        assessmentId: ass.id,
        questionText: `What is the primary role of an n8n Trigger Node?`,
        optionsJson: JSON.stringify([
          `To initiate workflow execution upon an event or schedule`,
          `To format JSON text strings`,
          `To encrypt database passwords`,
          `To delete execution log files`
        ]),
        correctAnswerIndex: 0,
        answerExplanation: `Trigger nodes listen for external events (webhooks, emails, schedules) and start workflow execution.`,
        orderIndex: 1,
      });
    }
  }

  // ============================================================
  // MONTH 2: APIs, Webhooks & Security (4 Weeks) — EXACT FROM IMAGE 2
  // ============================================================
  const [m2] = await db.insert(roadmapMonths).values({
    monthNumber: 2,
    title: 'APIs, Webhooks & Security',
    subtitle: 'Connect automation with real services, handle data through APIs, webhooks & keep everything secure.',
    durationWeeks: '4 weeks',
    keyOutput: 'Mini Project — API + Webhook Integration (New Google Form Submission -> Sheets + Email Notification)',
  }).returning();

  const m2Weeks = [
    { weekNumber: 5, title: 'Week 1 – HTTP & APIs (HTTP basics, public APIs, Postman)' },
    { weekNumber: 6, title: 'Week 2 – Webhooks & OAuth (n8n Webhooks, OAuth 2.0 flow)' },
    { weekNumber: 7, title: 'Week 3 – Security & Best Practices (env vars, CORS, rate limiting)' },
    { weekNumber: 8, title: 'Week 4 – Project + Review (Build, test, deploy & document mini project)' },
  ];

  const w2Ids: Record<number, string> = {};
  for (const w of m2Weeks) {
    const [insertedW] = await db.insert(roadmapWeeks).values({
      monthId: m2.id,
      weekNumber: w.weekNumber,
      title: w.title,
    }).returning();
    w2Ids[w.weekNumber] = insertedW.id;
  }

  const m2Tasks = [
    { week: 5, order: 1, priority: 'MASTER' as const, duration: '5 Days', title: '1. HTTP Fundamentals', desc: 'API ka matlab hota hai — doosre application se baat karna. HTTP is the communication language.', subtopics: ['HTTP methods: GET, POST, PUT, DELETE', 'Headers (Content-Type, Authorization)', 'Body (JSON data)', 'Query parameters (?id=123) & Path parameters (/users/123)', 'Status codes (200, 400, 401, 500)'] },
    { week: 5, order: 2, priority: 'IMPORTANT' as const, duration: '1 Week', title: '2. APIs & Postman', desc: 'APIs se apps data share karti hain. Postman tumhe API testing aur debugging mein help karta hai.', subtopics: ['Postman install & basic interface exploration', 'GET request sending (public APIs: JSONPlaceholder, ReqRes, GitHub API)', 'POST request sending (data payload)', 'Headers & Authorization token setup', 'Response JSON format understanding & Postman Collections'] },
    { week: 6, order: 3, priority: 'MASTER' as const, duration: '5 Days', title: '3. Webhooks', desc: 'Webhooks ka matlab hai — jab koi event hota hai, to wo API ko automatically notify karta hai.', subtopics: ['How Webhooks work (External Service -> Webhook POST -> n8n Workflow)', 'Example Use Cases: New form submission, New e-commerce order, New user signup, GitHub push', 'Setting up Webhook trigger node in n8n', 'Webhook URL verification & payload parsing'] },
    { week: 6, order: 4, priority: 'MASTER' as const, duration: '5 Days', title: '4. OAuth 2.0', desc: 'OAuth 2.0 se tum secure tareeke se user ka data access kar sakte ho (without sharing passwords).', subtopics: ['Authorization flow (client -> user -> provider -> access token)', 'Access token & refresh token rotation', 'Scopes & permissions management', 'Redirect URI setup', 'Using OAuth in APIs (Google OAuth, GitHub OAuth)'] },
    { week: 7, order: 5, priority: 'IMPORTANT' as const, duration: '4 Days', title: '5. Security & Best Practices', desc: 'Security yahan bohot important hai. Galat handling se data leak ho sakta hai.', subtopics: ['Environment variables (API keys ko hide karna)', 'HTTPS secure connection enforcement', 'Webhook signature verification (HMAC SHA256)', 'Input validation & Rate limiting', 'CORS (cross-origin requests)'] },
    { week: 8, order: 6, priority: 'MASTER' as const, duration: '1 Week', title: '6. Mini Project – API + Webhook Integration', desc: 'Build real project: "New Google Form Submission -> Save to Google Sheets + Send Email Notification".', subtopics: ['Google Form setup (sample form)', 'n8n Webhook trigger node configuration', 'Google Sheets node setup (save submission data)', 'Gmail node setup (send email notification)', 'Testing end-to-end form submit & error handling'] },
  ];

  for (const t of m2Tasks) {
    const [task] = await db.insert(roadmapTasks).values({
      monthId: m2.id,
      weekId: w2Ids[t.week],
      title: t.title,
      durationLabel: t.duration,
      priority: t.priority,
      orderIndex: t.order,
      description: t.desc,
    }).returning();

    for (let i = 0; i < t.subtopics.length; i++) {
      await db.insert(subtasks).values({
        taskId: task.id,
        title: t.subtopics[i],
        orderIndex: i + 1,
      });
    }

    const [ass] = await db.insert(assessments).values({
      taskId: task.id,
      title: `${t.title} Quiz`,
      description: `Test core API & security knowledge for ${t.title}.`,
      passingScore: 80,
    }).returning();

    await db.insert(assessmentQuestions).values({
      assessmentId: ass.id,
      questionText: `Which HTTP status code indicates successful request execution?`,
      optionsJson: JSON.stringify([`200 OK`, `400 Bad Request`, `401 Unauthorized`, `500 Internal Server Error`]),
      correctAnswerIndex: 0,
      answerExplanation: `200 OK indicates that the request was processed successfully by the server.`,
      orderIndex: 1,
    });
  }

  // ============================================================
  // MONTH 3: Logic, Databases + Error Handling (4.5 Weeks / ~27 Days) — EXACT FROM IMAGE 3
  // ============================================================
  const [m3] = await db.insert(roadmapMonths).values({
    monthNumber: 3,
    title: 'Logic, Databases + Error Handling',
    subtitle: 'Build smarter workflows with data, logic and reliability.',
    durationWeeks: '4.5 weeks (~27 Days)',
    keyOutput: 'Database-driven workflow with logic, error retries & persistence',
  }).returning();

  const m3Weeks = [
    { weekNumber: 9, title: 'Week 1 – Logic & Flow (IF/Switch/Filter/Loop)' },
    { weekNumber: 10, title: 'Week 2 – Database Basics (PostgreSQL/Supabase setup & CRUD)' },
    { weekNumber: 11, title: 'Week 3 – Transactions & Indexing (Optimization & data flow)' },
    { weekNumber: 12, title: 'Week 4 – Error Handling (Retries, rate limiting, logging)' },
    { weekNumber: 13, title: 'Week 4.5 – Integration Project (End-to-end system)' },
  ];

  const w3Ids: Record<number, string> = {};
  for (const w of m3Weeks) {
    const [insertedW] = await db.insert(roadmapWeeks).values({
      monthId: m3.id,
      weekNumber: w.weekNumber,
      title: w.title,
    }).returning();
    w3Ids[w.weekNumber] = insertedW.id;
  }

  const m3Tasks = [
    { week: 9, order: 1, priority: 'MASTER' as const, duration: '1 Week', title: '1. Logic & Data Flow', desc: 'Teach your automation to think, decide and handle different situations.', subtopics: ['IF / Switch / Merge / Filter nodes', 'Loop Over Items (for lists)', 'Data transformation (Set/Function node)', 'Working with JSON data', 'Conditional logic (if/else like flow)'] },
    { week: 10, order: 2, priority: 'MASTER' as const, duration: '1.5 Weeks', title: '2. Databases (PostgreSQL / Supabase & SQL)', desc: 'Store, fetch and manage your data like a pro.', subtopics: ['PostgreSQL / Supabase basics setup', 'Database nodes in n8n', 'Schema design (tables & relationships)', 'SQL queries (SELECT, INSERT, UPDATE, DELETE)', 'Transactions (commit/rollback) & Indexing basics'] },
    { week: 11, order: 3, priority: 'MASTER' as const, duration: '1 Week', title: '3. Transactions & Query Optimization', desc: 'Execute atomic database transactions and optimize query performance.', subtopics: ['ACID Transactions (commit/rollback)', 'Indexing basics & optimization', 'Building multi-step database workflows', 'Performance testing n8n DB nodes'] },
    { week: 12, order: 4, priority: 'MASTER' as const, duration: '1 Week', title: '4. Error Handling & Reliability', desc: 'Handle failures, keep your workflow stable, and alert on errors.', subtopics: ['Error Trigger / Error Workflow setup', 'Retry Logic (exponential backoff)', 'Rate Limiting & Queues (basics)', 'Logging & Notifications (Slack/Email)', 'Graceful fallback responses'] },
    { week: 13, order: 5, priority: 'IMPORTANT' as const, duration: '5 Days', title: '5. Month 3 Mini Project & End-to-End System', desc: 'Build a database-driven system (e.g. Lead Tracker, Simple CRM, or Payment Webhook).', subtopics: ['Connect contact form -> save to database', 'Lead tracker with status update', 'Gmail -> save attachments to DB', 'Payment webhook -> update order status', 'Simple CRM (add/edit/delete contacts)'] },
  ];

  for (const t of m3Tasks) {
    const [task] = await db.insert(roadmapTasks).values({
      monthId: m3.id,
      weekId: w3Ids[t.week],
      title: t.title,
      durationLabel: t.duration,
      priority: t.priority,
      orderIndex: t.order,
      description: t.desc,
    }).returning();

    for (let i = 0; i < t.subtopics.length; i++) {
      await db.insert(subtasks).values({
        taskId: task.id,
        title: t.subtopics[i],
        orderIndex: i + 1,
      });
    }

    const [ass] = await db.insert(assessments).values({
      taskId: task.id,
      title: `${t.title} Assessment`,
      description: `Verify database & logic flow control knowledge.`,
      passingScore: 80,
    }).returning();

    await db.insert(assessmentQuestions).values({
      assessmentId: ass.id,
      questionText: `What does the ACID property 'Atomicity' guarantee in database operations?`,
      optionsJson: JSON.stringify([
        `All operations in the transaction execute completely or none at all`,
        `Queries execute in parallel`,
        `Indexes are rebuilt automatically`,
        `Data is saved in JSON format`
      ]),
      correctAnswerIndex: 0,
      answerExplanation: `Atomicity guarantees all-or-nothing transaction execution.`,
      orderIndex: 1,
    });
  }

  // ============================================================
  // MONTH 4: JavaScript Basics + Custom Code (4.5 Weeks / ~27 Days) — EXACT FROM IMAGE 4
  // ============================================================
  const [m4] = await db.insert(roadmapMonths).values({
    monthNumber: 4,
    title: 'JavaScript Basics + Custom Code',
    subtitle: 'Learn JavaScript — the language that gives you control, flexibility and power to build custom logic inside your automations.',
    durationWeeks: '4.5 weeks (~27 Days)',
    keyOutput: 'Mini Project – Custom API + JavaScript (Real-World Data Fetcher & n8n Custom Code Node)',
  }).returning();

  const m4Weeks = [
    { weekNumber: 14, title: 'Week 1 (Days 1–7): JS Basics & Functions' },
    { weekNumber: 15, title: 'Week 2 (Days 8–14): Arrays & Objects' },
    { weekNumber: 16, title: 'Week 3 (Days 15–21): Loops & JSON Handling' },
    { weekNumber: 17, title: 'Week 4 (Days 22–27): Custom API Requests (fetch/axios) & Mini Project' },
  ];

  const w4Ids: Record<number, string> = {};
  for (const w of m4Weeks) {
    const [insertedW] = await db.insert(roadmapWeeks).values({
      monthId: m4.id,
      weekNumber: w.weekNumber,
      title: w.title,
    }).returning();
    w4Ids[w.weekNumber] = insertedW.id;
  }

  const m4Tasks = [
    { week: 14, order: 1, priority: 'MASTER' as const, duration: '1.5 Weeks', title: '1. JavaScript Fundamentals', desc: 'Learn core concepts of JS to write logic, handle data, and work with APIs.', subtopics: ['Variables (let, const, var)', 'Data types (string, number, boolean, etc.)', 'Operators (arithmetic, comparison, logical)', 'Functions (normal, arrow, return)', 'Scope (block & function scope)'] },
    { week: 15, order: 2, priority: 'IMPORTANT' as const, duration: '5 Days', title: '2. Arrays & Objects', desc: 'Master the most used data structures in JavaScript to handle real-world data.', subtopics: ['Arrays (methods: push, map, filter, find, etc.)', 'Objects (key:value, access, loop)', 'Nested objects & arrays', 'Destructuring assignment'] },
    { week: 16, order: 3, priority: 'IMPORTANT' as const, duration: '3 Days', title: '3. Loops', desc: 'Repeat tasks without writing the same code again and again.', subtopics: ['for loop & while loop', 'for...of (for arrays)', 'for...in (for objects)', 'break & continue statements'] },
    { week: 16, order: 4, priority: 'IMPORTANT' as const, duration: '2 Days', title: '4. JSON Handling in Code', desc: 'APIs send data in JSON format. Learn how to read, modify and send JSON in JavaScript.', subtopics: ['JSON.parse() — convert string to object', 'JSON.stringify() — convert object to string', 'Accessing nested data', 'Working with API responses'] },
    { week: 17, order: 5, priority: 'MASTER' as const, duration: '1 Week', title: '5. Custom API Requests (fetch/axios)', desc: 'Learn how to make real API calls, send data and handle responses using fetch or axios.', subtopics: ['GET, POST, PUT, DELETE requests', 'Headers & Authorization (API keys)', 'Error handling (try/catch)', 'Working with real APIs (JSONPlaceholder)'] },
    { week: 17, order: 6, priority: 'MASTER' as const, duration: '1 Month Project', title: '6. Mini Project – Custom API + JavaScript', desc: 'Build a Real-World Data Fetcher: fetch API, display on UI, search/filter, try/catch error handling, n8n custom code.', subtopics: ['Use public API (JSONPlaceholder)', 'Display data on UI', 'Add search/filter using JS', 'Handle errors with try/catch', 'Use custom code in n8n'] },
  ];

  for (const t of m4Tasks) {
    const [task] = await db.insert(roadmapTasks).values({
      monthId: m4.id,
      weekId: w4Ids[t.week],
      title: t.title,
      durationLabel: t.duration,
      priority: t.priority,
      orderIndex: t.order,
      description: t.desc,
    }).returning();

    for (let i = 0; i < t.subtopics.length; i++) {
      await db.insert(subtasks).values({
        taskId: task.id,
        title: t.subtopics[i],
        orderIndex: i + 1,
      });
    }

    const [ass] = await db.insert(assessments).values({
      taskId: task.id,
      title: `${t.title} Verification Quiz`,
      description: `Test custom JavaScript programming knowledge.`,
      passingScore: 80,
    }).returning();

    await db.insert(assessmentQuestions).values({
      assessmentId: ass.id,
      questionText: `Which Array method returns a new array with elements transformed by a callback function?`,
      optionsJson: JSON.stringify([`Array.prototype.map()`, `Array.prototype.filter()`, `Array.prototype.forEach()`, `Array.prototype.some()`]),
      correctAnswerIndex: 0,
      answerExplanation: `map() creates a new array populated with the results of calling a provided function on every element.`,
      orderIndex: 1,
    });
  }

  // ============================================================
  // MONTH 5: Hybrid Approach + AI Integration (4.5 Weeks / ~27 Days) — EXACT FROM IMAGE 5
  // ============================================================
  const [m5] = await db.insert(roadmapMonths).values({
    monthNumber: 5,
    title: 'Hybrid Approach + AI Integration',
    subtitle: 'Combine the power of automation tools, code and AI to build smarter, intelligent workflows that solve real problems.',
    durationWeeks: '4.5 weeks (~27 Days)',
    keyOutput: 'Build a Real Workflow Project (AI Email Assistant / Customer Support Bot / Lead Qualification)',
  }).returning();

  const m5Weeks = [
    { weekNumber: 18, title: 'Week 1 (Days 1–5): Prompt Engineering' },
    { weekNumber: 19, title: 'Week 2 (Days 6–10): n8n + Code Integration' },
    { weekNumber: 20, title: 'Week 3 (Days 11–15): Vector DB + RAG Concepts' },
    { weekNumber: 21, title: 'Week 4 (Days 16–20): Function Calling & AI Validation' },
    { weekNumber: 22, title: 'Week 5 (Days 21–27): Agent Architecture, Guardrails, Cost Control & Real Project' },
  ];

  const w5Ids: Record<number, string> = {};
  for (const w of m5Weeks) {
    const [insertedW] = await db.insert(roadmapWeeks).values({
      monthId: m5.id,
      weekNumber: w.weekNumber,
      title: w.title,
    }).returning();
    w5Ids[w.weekNumber] = insertedW.id;
  }

  const m5Tasks = [
    { week: 18, order: 1, priority: 'MASTER' as const, duration: '5 Days', title: '1. Prompt Engineering', desc: 'Learn how to write effective prompts so AI gives accurate, useful and consistent results.', subtopics: ['Prompt structure (role, task, context, format)', 'System vs user prompts', 'Few-shot & chain-of-thought prompting', 'Prompt optimization techniques'] },
    { week: 19, order: 2, priority: 'IMPORTANT' as const, duration: '4 Days', title: '2. n8n + Code Integration', desc: 'Learn how to combine n8n visual workflow with custom code for more flexibility and power.', subtopics: ['Using Code node in n8n', 'Passing data between nodes and code', 'Using external APIs in code', 'Error handling in custom code', 'Real-world hybrid workflow example'] },
    { week: 20, order: 3, priority: 'MASTER' as const, duration: '1 Week', title: '3. Vector DB / Knowledge Base', desc: 'Store your data in a vector database so AI can search and retrieve relevant information.', subtopics: ['What is a vector database?', 'Pinecone / Supabase setup', 'Creating embeddings (OpenAI)', 'Storing & searching vectors', 'Using knowledge base in workflows'] },
    { week: 20, order: 4, priority: 'MASTER' as const, duration: '1 Week', title: '4. RAG Concepts (Retrieval-Augmented Generation)', desc: 'Combine your data with LLMs so it can give accurate, context-aware answers.', subtopics: ['What is RAG (Retrieval-Augmented Generation)', 'Chunking & embedding (500-1000 chars)', 'Retrieval process', 'Building a simple RAG workflow in n8n', 'Use cases & limitations'] },
    { week: 21, order: 5, priority: 'IMPORTANT' as const, duration: '1 Week', title: '5. Function Calling / Tool Use', desc: 'Let AI use external tools, APIs or functions to perform real actions.', subtopics: ['Function calling basics', 'Connecting APIs as tools', 'Tool selection & parameters', 'Building multi-step actions', 'Real-world examples (weather, email, calendar)'] },
    { week: 21, order: 6, priority: 'MASTER' as const, duration: '4 Days', title: '6. AI Evaluation + Validation', desc: 'Make sure AI gives correct, safe and reliable results before using them in real workflows.', subtopics: ['Testing AI responses', 'Structured output validation', 'Handling hallucinations', 'Fallback responses & improvement', 'Prompt testing & improvement'] },
    { week: 22, order: 7, priority: 'MASTER' as const, duration: '1 Week', title: '7. Agent Architecture + Guardrails', desc: 'Understand how AI agents work and how to make them safe, reliable and useful.', subtopics: ['Agent workflow (plan -> act -> observe -> repeat)', 'Memory & context management', 'Tool permissions', 'Guardrails & safety rules', 'Human-in-the-loop (optional)'] },
    { week: 22, order: 8, priority: 'BASICS_ENOUGH' as const, duration: '3 Days', title: '8. Cost Control', desc: 'Use AI and APIs efficiently so you don\'t get unexpected high bills.', subtopics: ['Tracking usage & costs (OpenAI, Pinecone, etc.)', 'Optimizing prompts (shorter, smarter)', 'Caching & batching requests', 'Setting usage limits', 'Monitoring with logs/alerts'] },
    { week: 22, order: 9, priority: 'MASTER' as const, duration: '1 Week Project', title: '9. Build a Real Workflow Project', desc: 'Apply everything together by building a complete real-world automation (AI Email Assistant, Support Bot, or Lead Qualification).', subtopics: ['n8n + AI + Database integration', 'Error handling & structured validation', 'Logging & monitoring', 'Clean UI / webhook integration', 'Create GitHub repo + demo'] },
  ];

  for (const t of m5Tasks) {
    const [task] = await db.insert(roadmapTasks).values({
      monthId: m5.id,
      weekId: w5Ids[t.week],
      title: t.title,
      durationLabel: t.duration,
      priority: t.priority,
      orderIndex: t.order,
      description: t.desc,
    }).returning();

    for (let i = 0; i < t.subtopics.length; i++) {
      await db.insert(subtasks).values({
        taskId: task.id,
        title: t.subtopics[i],
        orderIndex: i + 1,
      });
    }

    if (t.priority === 'MASTER' || t.priority === 'IMPORTANT') {
      const [ass] = await db.insert(assessments).values({
        taskId: task.id,
        title: `${t.title} Assessment`,
        description: `Verify understanding of ${t.title}.`,
        passingScore: 80,
      }).returning();

      await db.insert(assessmentQuestions).values({
        assessmentId: ass.id,
        questionText: `What is the primary benefit of Retrieval-Augmented Generation (RAG)?`,
        optionsJson: JSON.stringify([
          `Grounds LLM responses in real-time, private document context without full fine-tuning`,
          `Speeds up database index queries`,
          `Replaces API tokens`,
          `Removes the need for prompt templates`
        ]),
        correctAnswerIndex: 0,
        answerExplanation: `RAG injects retrieved relevant document chunks into the prompt context to ground LLM outputs.`,
        orderIndex: 1,
      });
    }
  }

  // ============================================================
  // MONTH 6: Real Projects + Testing + Portfolio + Job Prep (4.5 Weeks)
  // ============================================================
  const [m6] = await db.insert(roadmapMonths).values({
    monthNumber: 6,
    title: 'Real Projects + Testing + Portfolio + Job Prep',
    subtitle: 'Build Production-Ready Projects, Prove Your Skills & Get Ready to Earn',
    durationWeeks: '4.5 weeks (~27 Days)',
    keyOutput: 'Portfolio + 6 Production Projects + Client/Job Readiness',
  }).returning();

  const m6Weeks = [
    { weekNumber: 23, title: 'Week 1 (Days 1–5): Project 1 — Lead Management System' },
    { weekNumber: 24, title: 'Week 2 (Days 6–10): Project 2 — E-commerce Order Automation' },
    { weekNumber: 25, title: 'Week 3 (Days 11–15): Project 3 — AI Email Assistant with RAG' },
    { weekNumber: 26, title: 'Week 4 (Days 16–20): Project 4 — Social Media Auto Poster' },
    { weekNumber: 27, title: 'Week 5 (Days 21–27): Project 5 & 6 — Expense Tracker & Custom API Hub + Portfolio' },
  ];

  const w6Ids: Record<number, string> = {};
  for (const w of m6Weeks) {
    const [insertedW] = await db.insert(roadmapWeeks).values({
      monthId: m6.id,
      weekNumber: w.weekNumber,
      title: w.title,
    }).returning();
    w6Ids[w.weekNumber] = insertedW.id;
  }

  const m6Tasks = [
    { week: 23, order: 1, priority: 'MASTER' as const, duration: '1 week', title: '1. Lead Management System (Project 1)', desc: 'Automate lead collection, enrichment, data validation, database storage, and email/WhatsApp follow-ups.', subtopics: ['Webhook + form integration (Typeform/Google Forms)', 'Data validation & enrichment (Clearbit/Hunter.io)', 'Save to PostgreSQL/Supabase database', 'Auto email/WhatsApp follow-ups', 'Lead tracking dashboard'] },
    { week: 24, order: 2, priority: 'MASTER' as const, duration: '1 week', title: '2. E-commerce Order Automation (Project 2)', desc: 'Sync orders, update inventory, and send notifications automatically across Shopify/Daraz.', subtopics: ['API integration (Shopify/Daraz)', 'Order data processing & transformation', 'Update inventory in database', 'Send customer & admin notifications', 'Handle errors & retry logic'] },
    { week: 25, order: 3, priority: 'MASTER' as const, duration: '1 week', title: '3. AI Email Assistant with RAG (Project 3)', desc: 'Create an AI assistant that answers questions using custom knowledge base documents.', subtopics: ['Vector database setup (Pinecone/Supabase)', 'Document loading & chunking', 'RAG retrieval workflow in n8n', 'OpenAI API integration', 'Build chat UI interface'] },
    { week: 26, order: 4, priority: 'IMPORTANT' as const, duration: '1 week', title: '4. Social Media Auto Poster (Project 4)', desc: 'Automatically generate and post dynamic content to social media platforms.', subtopics: ['Social media APIs (Twitter/X, LinkedIn)', 'Dynamic AI content generation + templates', 'Scheduling & posting queue', 'Error handling & retry logs'] },
    { week: 27, order: 5, priority: 'IMPORTANT' as const, duration: '1 week', title: '5. Expense Tracker System (Project 5)', desc: 'Track expenses, categorize receipts via AI rules, store in DB, and generate reports.', subtopics: ['Data input (Form / Email / CSV)', 'Categorization using AI rules', 'Database storage & query analytics', 'Generate charts & reports'] },
    { week: 27, order: 6, priority: 'MASTER' as const, duration: '1 week', title: '6. Custom API Integration Hub (Project 6)', desc: 'Connect multiple APIs and manage them from a single unified control hub.', subtopics: ['Multi-API integration', 'API key & OAuth security', 'Vanilla JS dashboard interface', 'Save and manage API response logs'] },
  ];

  for (const t of m6Tasks) {
    const [task] = await db.insert(roadmapTasks).values({
      monthId: m6.id,
      weekId: w6Ids[t.week],
      title: t.title,
      durationLabel: t.duration,
      priority: t.priority,
      orderIndex: t.order,
      description: t.desc,
    }).returning();

    for (let i = 0; i < t.subtopics.length; i++) {
      await db.insert(subtasks).values({
        taskId: task.id,
        title: t.subtopics[i],
        orderIndex: i + 1,
      });
    }

    const [ass] = await db.insert(assessments).values({
      taskId: task.id,
      title: `${t.title} Verification Check`,
      description: `Verify production readiness for ${t.title}.`,
      passingScore: 80,
    }).returning();

    await db.insert(assessmentQuestions).values({
      assessmentId: ass.id,
      questionText: `What is critical before deploying a production automation workflow to clients?`,
      optionsJson: JSON.stringify([
        `Implementing error retries, secrets management, logging, and health alerts`,
        `Deleting execution history logs`,
        `Hardcoding database passwords`,
        `Disabling error triggers`
      ]),
      correctAnswerIndex: 0,
      answerExplanation: `Production readiness requires error recovery, secure credentials management, and execution logging.`,
      orderIndex: 1,
    });
  }

  // ============================================================
  // 6 Exact Projects (Mapped to Months 1-6)
  // ============================================================
  const projectList = [
    { projectNumber: 1, monthId: m1.id, title: 'Gmail Auto-Responder', weekRange: 'Month 1 (Week 4)', description: 'Save email attachments to Google Drive, notify Slack, and log results in Google Sheets.', techStack: 'n8n, Gmail API, Google Drive, Slack, Google Sheets' },
    { projectNumber: 2, monthId: m2.id, title: 'Lead Capture System', weekRange: 'Month 2 (Week 8)', description: 'Webhook + Form integration to enrich lead data and save to PostgreSQL database.', techStack: 'n8n, REST API, Webhooks, Supabase / PostgreSQL' },
    { projectNumber: 3, monthId: m3.id, title: 'CRM / Task Manager DB', weekRange: 'Month 3 (Week 13)', description: 'Database-driven CRM with custom logic, status transitions, and error retry triggers.', techStack: 'PostgreSQL, Supabase, n8n, SQL' },
    { projectNumber: 4, monthId: m4.id, title: 'Custom API Integration Hub', weekRange: 'Month 4 (Week 17)', description: 'Custom JavaScript code nodes with fetch/axios making external API requests.', techStack: 'JavaScript, fetch/axios, Node.js, n8n Code Node' },
    { projectNumber: 5, monthId: m5.id, title: 'AI Support Bot (RAG)', weekRange: 'Month 5 (Week 22)', description: 'Vector DB + OpenAI embeddings + RAG retrieval + structured output validation.', techStack: 'OpenAI, Vector DB (Pinecone/Supabase), n8n, RAG' },
    { projectNumber: 6, monthId: m6.id, title: 'E-commerce Order Automation', weekRange: 'Month 6 (Week 27)', description: 'Production suite automating order processing, inventory sync, and client notifications.', techStack: 'Next.js, n8n, Supabase, Shopify/Daraz API' },
  ];

  for (const p of projectList) {
    const [insertedProj] = await db.insert(projects).values(p).returning();
    
    // Seed initial project progress
    await db.insert(projectProgress).values({
      projectId: insertedProj.id,
      userId: 'default_user',
      status: 'IN_PROGRESS',
      currentStage: 'BUILD',
      notes: `Working on ${p.title} (${p.weekRange})`,
    });
  }

  // ============================================================
  // Seed Skill Matrix Categories
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

  // Default User Settings
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

  console.log('✨ Comprehensive Roadmap Seed Completed Successfully!');
}

if (require.main === module) {
  seedRoadmap()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('❌ Seed error:', err);
      process.exit(1);
    });
}
