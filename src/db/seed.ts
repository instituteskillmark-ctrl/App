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
  studySessions,
  notes,
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
  console.log('🌱 Starting Comprehensive Roadmap Audit & Seed against Source of Truth Images...');

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

  // ------------------------------------------------------------
  // MONTH 1: Automation Thinking + n8n Basics (4 Weeks)
  // ------------------------------------------------------------
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
    { week: 1, order: 1, priority: 'BASICS_ENOUGH' as const, duration: '1 day', title: '1.1 What is automation? (real-world examples)', desc: 'Understand what automation is, how it works, and where it can be used in daily life & business.', subtopics: ['Understand automation mindset', 'Real-world automation examples', 'Simple explanation: letting tools do repetitive work'] },
    { week: 1, order: 2, priority: 'IMPORTANT' as const, duration: '1 day', title: '1.2 Identify manual tasks in your daily life/work', desc: 'Identify manual, repetitive tasks that can be automated to save time.', subtopics: ['Audit daily workflow for repetitive tasks', 'Calculate potential time savings', 'Select high-impact automation candidates'] },
    { week: 1, order: 3, priority: 'MASTER' as const, duration: '1 day', title: '1.3 Learn the automation workflow (Trigger + Action)', desc: 'Master core automation mechanics: Trigger events and Action executions.', subtopics: ['Understand Trigger vs Action concepts', 'Map input data to output actions', 'Design basic logic flows'] },
    { week: 1, order: 4, priority: 'BASICS_ENOUGH' as const, duration: '1 day', title: '1.4 Explore popular tools (n8n, Zapier, Make, etc.)', desc: 'Compare low-code and open-source automation platforms.', subtopics: ['Compare n8n vs Zapier vs Make', 'Understand self-hosted vs cloud options', 'Evaluate cost and flexibility'] },
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

  // ------------------------------------------------------------
  // MONTH 2: APIs, Webhooks & Security (4 Weeks)
  // ------------------------------------------------------------
  const [m2] = await db.insert(roadmapMonths).values({
    monthNumber: 2,
    title: 'APIs, Webhooks & Security',
    subtitle: 'Connecting Systems Securely',
    durationWeeks: '4 weeks',
    keyOutput: 'API integration with webhook (e.g., GitHub or Stripe webhook to database)',
  }).returning();

  const m2Weeks = [
    { weekNumber: 5, title: 'Week 5 – REST API Basics & Structure' },
    { weekNumber: 6, title: 'Week 6 – HTTP Methods & Postman Testing' },
    { weekNumber: 7, title: 'Week 7 – OAuth 2.0 & Secrets Management' },
    { weekNumber: 8, title: 'Week 8 – Webhooks & Signature Verification' },
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
    { week: 5, order: 1, priority: 'MASTER' as const, duration: '1 week', title: 'REST API Basics & Endpoint Structure', desc: 'Understand endpoints, JSON payloads, headers, query params, and HTTP status codes.', subtopics: ['Understand API client-server architecture', 'Inspect request headers & JSON response body', 'Master status codes (200, 201, 400, 401, 404, 500)'] },
    { week: 6, order: 2, priority: 'MASTER' as const, duration: '1 week', title: 'HTTP Methods & Postman Testing', desc: 'Master GET, POST, PUT, DELETE requests and build Postman API test collections.', subtopics: ['Test GET and POST endpoints in Postman', 'Set up Postman environment variables', 'Write API response test assertions'] },
    { week: 7, order: 3, priority: 'MASTER' as const, duration: '1 week', title: 'OAuth 2.0 & Secrets Management', desc: 'Understand OAuth 2.0 authorization code flow, tokens, and secret vault storage.', subtopics: ['Understand client ID, client secret, & access tokens', 'Handle refresh token rotation', 'Store API keys in environment variables'] },
    { week: 8, order: 4, priority: 'MASTER' as const, duration: '1 week', title: 'Webhooks & HMAC Signature Verification', desc: 'Receive real-time webhooks (Stripe/GitHub) and verify SHA256 signatures.', subtopics: ['Configure incoming webhook listeners', 'Understand HMAC SHA256 signature verification', 'Prevent replay attacks & handle payload delivery'] },
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
      title: `${t.title} API Quiz`,
      description: `Test API & authentication concepts.`,
      passingScore: 80,
    }).returning();

    await db.insert(assessmentQuestions).values({
      assessmentId: ass.id,
      questionText: `Which HTTP verb should be used to update an existing database resource?`,
      optionsJson: JSON.stringify([`PUT / PATCH`, `GET`, `POST`, `DELETE`]),
      correctAnswerIndex: 0,
      answerExplanation: `PUT replaces a resource, while PATCH updates specific fields of a resource.`,
      orderIndex: 1,
    });
  }

  // ------------------------------------------------------------
  // MONTH 3: Logic, Databases + Error Handling (4.5 Weeks / ~27 Days)
  // ------------------------------------------------------------
  const [m3] = await db.insert(roadmapMonths).values({
    monthNumber: 3,
    title: 'Logic, Databases + Error Handling',
    subtitle: 'Build Smarter Workflows with Data, Logic and Reliability',
    durationWeeks: '4.5 weeks (~27 Days)',
    keyOutput: 'Database-driven workflow with logic, error retries & persistence',
  }).returning();

  const m3Weeks = [
    { weekNumber: 9, title: 'Week 1 (Days 1–5): Logic & Flow' },
    { weekNumber: 10, title: 'Week 2 (Days 6–10): Databases Basics' },
    { weekNumber: 11, title: 'Week 3 (Days 11–15): Integrations + Logic' },
    { weekNumber: 12, title: 'Week 4 (Days 16–20): Error Handling & Reliability' },
    { weekNumber: 13, title: 'Week 5 (Days 21–27): Project + Review' },
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
    { week: 9, order: 1, priority: 'MASTER' as const, duration: '1 week', title: 'Logic & Data Flow (IF/Switch/Filter/Loop)', desc: 'Teach your automation to think, decide and handle different situations.', subtopics: ['Master IF / Switch / Merge / Filter nodes', 'Loop Over Items (for list processing)', 'Data transformation & JSON data manipulation', 'Conditional branching logic'] },
    { week: 10, order: 2, priority: 'MASTER' as const, duration: '1.5 weeks', title: 'Databases (PostgreSQL / Supabase & SQL)', desc: 'Store, fetch and manage your data like a pro using PostgreSQL & Supabase.', subtopics: ['PostgreSQL & Supabase basics setup', 'Database nodes usage in n8n', 'Schema design (tables & relationships)', 'SQL queries (SELECT, INSERT, UPDATE, DELETE)', 'ACID Transactions (commit/rollback) & Indexing basics'] },
    { week: 11, order: 3, priority: 'MASTER' as const, duration: '1 week', title: 'Integrations + Advanced Logic', desc: 'Build multi-step workflows connecting live databases to API integrations.', subtopics: ['Multi-step database workflows', 'Handling transactional data flow', 'Performance testing & delay nodes', 'State management across workflow steps'] },
    { week: 12, order: 4, priority: 'MASTER' as const, duration: '1 week', title: 'Error Handling & Reliability', desc: 'Handle failures and keep your workflow rock stable.', subtopics: ['Error Trigger & Error Workflows', 'Exponential Retry Logic', 'Rate limiting & API delays', 'Queue processing & graceful fallback'] },
    { week: 13, order: 5, priority: 'IMPORTANT' as const, duration: '1 week', title: 'Month 3 Mini Project & Review', desc: 'Build a database-driven automation project (e.g. Lead Tracker or Simple CRM).', subtopics: ['Connect incoming form to database', 'Add status tracking & automated emails', 'Add error retries & logging', 'Deploy & test edge cases'] },
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
      title: `${t.title} Logic Assessment`,
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

  // ------------------------------------------------------------
  // MONTH 4: JavaScript Basics + Custom Code (4.5 Weeks / ~27 Days)
  // ------------------------------------------------------------
  const [m4] = await db.insert(roadmapMonths).values({
    monthNumber: 4,
    title: 'JavaScript Basics + Custom Code',
    subtitle: 'Give Yourself the Power to Build Custom Logic',
    durationWeeks: '4.5 weeks (~27 Days)',
    keyOutput: 'Custom Code node with fetch/axios API integration',
  }).returning();

  const m4Weeks = [
    { weekNumber: 14, title: 'Week 1 (Days 1–7): JavaScript Fundamentals' },
    { weekNumber: 15, title: 'Week 2 (Days 8–12): Arrays & Objects' },
    { weekNumber: 16, title: 'Week 3 (Days 13–14): JSON Handling in Code' },
    { weekNumber: 17, title: 'Week 4 (Days 15–21): Custom API Requests (fetch/axios)' },
    { weekNumber: 18, title: 'Week 5 (Days 22–27): Custom API Integration Hub Project' },
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
    { week: 14, order: 1, priority: 'MASTER' as const, duration: '1.5 weeks', title: 'JavaScript Fundamentals', desc: 'Learn core concepts: variables (let/const/var), data types, operators, functions, and scoping.', subtopics: ['Variables & data types (string, number, boolean)', 'Operators (arithmetic, comparison, logical)', 'Functions (normal, arrow, return values)', 'Block & function scope'] },
    { week: 15, order: 2, priority: 'IMPORTANT' as const, duration: '5 days', title: 'Arrays & Objects in JavaScript', desc: 'Master essential data structures: array methods (push, map, filter, find) and object key-values.', subtopics: ['Array transformations (map, filter, find, reduce)', 'Object key:value access & iteration', 'Nested objects & array structures', 'Destructuring assignment'] },
    { week: 16, order: 3, priority: 'IMPORTANT' as const, duration: '2 days', title: 'JSON Handling in Code', desc: 'Parse, modify, and stringify JSON data received from web APIs.', subtopics: ['JSON.parse() — convert string to object', 'JSON.stringify() — convert object to string', 'Accessing deeply nested API responses', 'Validating JSON payloads'] },
    { week: 17, order: 4, priority: 'MASTER' as const, duration: '1 week', title: 'Custom API Requests (fetch/axios)', desc: 'Make programmatic HTTP requests (GET, POST, PUT, DELETE) with headers, authorization, and try/catch.', subtopics: ['Native fetch API & Axios library', 'Headers & Bearer token authorization', 'Error handling with try/catch blocks', 'Connecting real APIs (e.g. JSONPlaceholder)'] },
    { week: 18, order: 5, priority: 'MASTER' as const, duration: '1 week', title: 'Custom API Integration Hub (Project)', desc: 'Connect multiple APIs and manage responses from a single unified interface.', subtopics: ['Multi-API request handler', 'Rate limiting & error handling in JS', 'Building a clean dashboard view', 'Saving API response logs to database'] },
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

  // ------------------------------------------------------------
  // MONTH 5: Hybrid Approach + AI Integration (4.5 Weeks / ~27 Days)
  // ------------------------------------------------------------
  const [m5] = await db.insert(roadmapMonths).values({
    monthNumber: 5,
    title: 'Hybrid Approach + AI Integration',
    subtitle: 'Combine Automation Tools, Code & AI to Build Intelligent Workflows',
    durationWeeks: '4.5 weeks (~27 Days)',
    keyOutput: 'AI-powered workflow with Vector DB, RAG & Guardrails',
  }).returning();

  const m5Weeks = [
    { weekNumber: 19, title: 'Week 1 (Days 1–5): Prompt Engineering' },
    { weekNumber: 20, title: 'Week 2 (Days 6–10): n8n + Code Integration' },
    { weekNumber: 21, title: 'Week 3 (Days 11–15): Vector DB + RAG Concepts' },
    { weekNumber: 22, title: 'Week 4 (Days 16–20): Function Calling & AI Validation' },
    { weekNumber: 23, title: 'Week 5 (Days 21–27): Agent Architecture, Guardrails & Cost Control' },
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
    { week: 19, order: 1, priority: 'MASTER' as const, duration: '5 days', title: 'Prompt Engineering', desc: 'Master prompt structures (role, task, context, format), system vs user prompts, and few-shot CoT prompting.', subtopics: ['Prompt structure & role prompting', 'System vs user prompt isolation', 'Few-shot & Chain-of-Thought prompting', 'Prompt optimization techniques'] },
    { week: 20, order: 2, priority: 'IMPORTANT' as const, duration: '4 days', title: 'n8n + Code Integration', desc: 'Combine n8n visual workflows with custom Code Nodes for flexible data transformation.', subtopics: ['Using Code Node in n8n', 'Passing data between nodes & code', 'Error handling in custom scripts', 'Real-world hybrid workflow example'] },
    { week: 21, order: 3, priority: 'MASTER' as const, duration: '1 week', title: 'Vector DB / Knowledge Base', desc: 'Store data in a vector database (Pinecone/Supabase pgvector) for semantic AI search.', subtopics: ['What is a vector database?', 'Pinecone / Supabase setup & embeddings', 'Creating & storing text embeddings', 'Using knowledge base in workflows'] },
    { week: 21, order: 4, priority: 'MASTER' as const, duration: '1 week', title: 'RAG Concepts (Retrieval-Augmented Generation)', desc: 'Combine your custom knowledge base with LLMs to provide accurate, context-aware answers.', subtopics: ['Understanding RAG architecture', 'Document chunking & embedding strategies', 'Retrieval process & context injection', 'Building a RAG workflow in n8n'] },
    { week: 22, order: 5, priority: 'IMPORTANT' as const, duration: '1 week', title: 'Function Calling / Tool Use', desc: 'Configure LLMs to invoke external APIs, tools, or databases to execute real-world actions.', subtopics: ['Function calling specifications (JSON schema)', 'Connecting APIs as tools to LLM', 'Tool selection & parameter extraction', 'Building multi-step AI tool actions'] },
    { week: 22, order: 6, priority: 'MASTER' as const, duration: '4 days', title: 'AI Evaluation + Validation', desc: 'Ensure AI outputs are safe, structured, and consistent before using in workflows.', subtopics: ['Testing AI responses against test cases', 'Structured JSON output validation (Zod)', 'Handling AI hallucinations & edge cases', 'Fallback responses & prompt iteration'] },
    { week: 23, order: 7, priority: 'MASTER' as const, duration: '1 week', title: 'Agent Architecture + Guardrails', desc: 'Build autonomous AI agent loops (plan -> act -> observe -> repeat) with safety guardrails.', subtopics: ['Agent loop architecture', 'Memory & context management', 'Guardrails & safety rules', 'Human-in-the-loop approval workflows'] },
    { week: 23, order: 8, priority: 'BASICS_ENOUGH' as const, duration: '3 days', title: 'Cost Control & Optimization', desc: 'Track token usage and optimize LLM API costs in production automations.', subtopics: ['Tracking usage & costs (OpenAI/Pinecone)', 'Prompt token optimization & caching', 'Setting API usage rate limits & alerts', 'Monitoring cost in dashboard'] },
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

  // ------------------------------------------------------------
  // MONTH 6: Real Projects + Testing + Portfolio + Job Prep (4.5 Weeks)
  // ------------------------------------------------------------
  const [m6] = await db.insert(roadmapMonths).values({
    monthNumber: 6,
    title: 'Real Projects + Testing + Portfolio + Job Prep',
    subtitle: 'Build Production-Ready Projects, Prove Your Skills & Get Ready to Earn',
    durationWeeks: '4.5 weeks (~27 Days)',
    keyOutput: 'Portfolio + 6 Production Projects + Client/Job Readiness',
  }).returning();

  const m6Weeks = [
    { weekNumber: 24, title: 'Week 1 (Days 1–5): Project 1 — Lead Management System' },
    { weekNumber: 25, title: 'Week 2 (Days 6–10): Project 2 — E-commerce Order Automation' },
    { weekNumber: 26, title: 'Week 3 (Days 11–15): Project 3 — AI Email Assistant with RAG' },
    { weekNumber: 27, title: 'Week 4 (Days 16–20): Project 4 — Social Media Auto Poster' },
    { weekNumber: 28, title: 'Week 5 (Days 21–27): Project 5 & 6 — Expense Tracker & Custom API Hub + Portfolio' },
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
    { week: 24, order: 1, priority: 'MASTER' as const, duration: '1 week', title: '1. Lead Management System (Project 1)', desc: 'Automate lead collection, enrichment, data validation, database storage, and email/WhatsApp follow-ups.', subtopics: ['Webhook + form integration (Typeform/Google Forms)', 'Data validation & enrichment (Clearbit/Hunter.io)', 'Save to PostgreSQL/Supabase database', 'Auto email/WhatsApp follow-ups', 'Lead tracking dashboard'] },
    { week: 25, order: 2, priority: 'MASTER' as const, duration: '1 week', title: '2. E-commerce Order Automation (Project 2)', desc: 'Sync orders, update inventory, and send notifications automatically across Shopify/Daraz.', subtopics: ['API integration (Shopify/Daraz)', 'Order data processing & transformation', 'Update inventory in database', 'Send customer & admin notifications', 'Handle errors & retry logic'] },
    { week: 26, order: 3, priority: 'MASTER' as const, duration: '1 week', title: '3. AI Email Assistant with RAG (Project 3)', desc: 'Create an AI assistant that answers questions using custom knowledge base documents.', subtopics: ['Vector database setup (Pinecone/Supabase)', 'Document loading & chunking', 'RAG retrieval workflow in n8n', 'OpenAI API integration', 'Build chat UI interface'] },
    { week: 27, order: 4, priority: 'IMPORTANT' as const, duration: '1 week', title: '4. Social Media Auto Poster (Project 4)', desc: 'Automatically generate and post dynamic content to social media platforms.', subtopics: ['Social media APIs (Twitter/X, LinkedIn)', 'Dynamic AI content generation + templates', 'Scheduling & posting queue', 'Error handling & retry logs'] },
    { week: 28, order: 5, priority: 'IMPORTANT' as const, duration: '1 week', title: '5. Expense Tracker System (Project 5)', desc: 'Track expenses, categorize receipts via AI rules, store in DB, and generate reports.', subtopics: ['Data input (Form / Email / CSV)', 'Categorization using AI rules', 'Database storage & query analytics', 'Generate charts & reports'] },
    { week: 28, order: 6, priority: 'MASTER' as const, duration: '1 week', title: '6. Custom API Integration Hub (Project 6)', desc: 'Connect multiple APIs and manage them from a single unified control hub.', subtopics: ['Multi-API integration', 'API key & OAuth security', 'Vanilla JS dashboard interface', 'Save and manage API response logs'] },
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

  // ------------------------------------------------------------
  // 6 Exact Projects (Mapped to Months 1-6)
  // ------------------------------------------------------------
  const projectList = [
    { projectNumber: 1, monthId: m1.id, title: 'Gmail Auto-Responder', weekRange: 'Month 1 (Week 4)', description: 'Save email attachments to Google Drive, notify Slack, and log results in Google Sheets.', techStack: 'n8n, Gmail API, Google Drive, Slack, Google Sheets' },
    { projectNumber: 2, monthId: m2.id, title: 'Lead Capture System', weekRange: 'Month 2 (Week 8)', description: 'Webhook + Form integration to enrich lead data and save to PostgreSQL database.', techStack: 'n8n, REST API, Webhooks, Supabase / PostgreSQL' },
    { projectNumber: 3, monthId: m3.id, title: 'CRM / Task Manager DB', weekRange: 'Month 3 (Week 13)', description: 'Database-driven CRM with custom logic, status transitions, and error retry triggers.', techStack: 'PostgreSQL, Supabase, n8n, SQL' },
    { projectNumber: 4, monthId: m4.id, title: 'Custom API Integration Hub', weekRange: 'Month 4 (Week 18)', description: 'Custom JavaScript code nodes with fetch/axios making external API requests.', techStack: 'JavaScript, fetch/axios, Node.js, n8n Code Node' },
    { projectNumber: 5, monthId: m5.id, title: 'AI Support Bot (RAG)', weekRange: 'Month 5 (Week 23)', description: 'Vector DB + OpenAI embeddings + RAG retrieval + structured output validation.', techStack: 'OpenAI, Vector DB (Pinecone/Supabase), n8n, RAG' },
    { projectNumber: 6, monthId: m6.id, title: 'E-commerce Order Automation', weekRange: 'Month 6 (Week 28)', description: 'Production suite automating order processing, inventory sync, and client notifications.', techStack: 'Next.js, n8n, Supabase, Shopify/Daraz API' },
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

  // ------------------------------------------------------------
  // Seed Skill Matrix Categories
  // ------------------------------------------------------------
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
