import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

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
} from './schema';

// Use direct (unpooled) connection for seed operations
const connectionString = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL || '';
if (!connectionString) {
  console.error('❌ No DATABASE_URL_UNPOOLED or DATABASE_URL found in .env.local');
  process.exit(1);
}
const seedClient = postgres(connectionString, { max: 1, prepare: false });
const db = drizzle(seedClient);


export async function seedRoadmap() {
  console.log('🌱 Starting Comprehensive Roadmap Audit & Seed...');

  // Clear existing roadmap tables to guarantee a clean audit re-seed
  try {
    await db.delete(subtasks);
    await db.delete(roadmapTasks);
    await db.delete(roadmapWeeks);
    await db.delete(projects);
    await db.delete(roadmapMonths);
    await db.delete(roadmapMilestones);
    await db.delete(skills);
    await db.delete(assessments);
    await db.delete(userSettings);
  } catch (err) {
    console.log('Seed cleanup note:', err);
  }

  // ------------------------------------------------------------
  // 1. Month 1: Automation Thinking + n8n Basics (4 weeks)
  // ------------------------------------------------------------
  const [m1] = await db.insert(roadmapMonths).values({
    monthNumber: 1,
    title: 'Automation Thinking + n8n Basics',
    subtitle: 'From Zero to Problem Solver',
    durationWeeks: '4 weeks',
    keyOutput: 'Simple automation workflow (working + error handling)',
  }).returning();

  for (let w = 1; w <= 4; w++) {
    await db.insert(roadmapWeeks).values({
      monthId: m1.id,
      weekNumber: w,
      title: `Week ${w}: Month 1 Foundations`,
    });
  }

  const m1TasksData = [
    { title: 'Problem → Solution Thinking', durationLabel: '5 days', priority: 'MASTER' as const, orderIndex: 1, description: 'Break real-world manual processes into algorithmic steps and trigger-action mappings.' },
    { title: 'Automation Mindset & Use Cases', durationLabel: '3 days', priority: 'MASTER' as const, orderIndex: 2, description: 'Identify high-value automation opportunities across CRM, email, and internal tools.' },
    { title: 'n8n Interface & Nodes', durationLabel: '1 week', priority: 'MASTER' as const, orderIndex: 3, description: 'Master n8n workflow canvas, triggers, nodes, execution data, and expressions.' },
    { title: 'Core Integrations (Gmail, Slack, Sheets)', durationLabel: '6 days', priority: 'MASTER' as const, orderIndex: 4, description: 'Build multi-node workflows connecting Gmail, Slack channels, and Google Sheets.' },
    { title: 'Testing/Debugging & Error Handling', durationLabel: '5 days', priority: 'MASTER' as const, orderIndex: 5, description: 'Use n8n error trigger nodes, execution replay, and manual data mock tests.' },
    { title: 'HTTP Basics (fundamentals)', durationLabel: 'ongoing', priority: 'IMPORTANT' as const, orderIndex: 6, description: 'Understand requests, responses, status codes (2xx, 4xx, 5xx), headers, and payloads.' },
  ];

  for (const t of m1TasksData) {
    const [insertedTask] = await db.insert(roadmapTasks).values({
      monthId: m1.id,
      title: t.title,
      durationLabel: t.durationLabel,
      priority: t.priority,
      orderIndex: t.orderIndex,
      description: t.description,
    }).returning();

    // Create sample assessment for MASTER & IMPORTANT topics
    if (t.priority === 'MASTER' || t.priority === 'IMPORTANT') {
      const [ass] = await db.insert(assessments).values({
        taskId: insertedTask.id,
        title: `${t.title} Verification Check`,
        description: `Verify your functional mastery of ${t.title}.`,
        passingScore: 80,
      }).returning();

      await db.insert(assessmentQuestions).values({
        assessmentId: ass.id,
        questionText: `What is the primary objective of ${t.title} in production workflows?`,
        optionsJson: JSON.stringify([
          `To ensure robust, reliable execution and error recovery`,
          `To bypass security credentials`,
          `To hardcode API tokens`,
          `To execute without logs`
        ]),
        correctAnswerIndex: 0,
        answerExplanation: `${t.title} guarantees reliable execution and proper data flow handling.`,
        orderIndex: 1,
      });
    }
  }

  // ------------------------------------------------------------
  // 2. Month 2: APIs, Webhooks & Security (4 weeks)
  // ------------------------------------------------------------
  const [m2] = await db.insert(roadmapMonths).values({
    monthNumber: 2,
    title: 'APIs, Webhooks & Security',
    subtitle: 'Connecting Systems securely',
    durationWeeks: '4 weeks',
    keyOutput: 'API integration with webhook (e.g. Github or Stripe)',
  }).returning();

  for (let w = 5; w <= 8; w++) {
    await db.insert(roadmapWeeks).values({
      monthId: m2.id,
      weekNumber: w,
      title: `Week ${w}: APIs & Webhooks`,
    });
  }

  const m2TasksData = [
    { title: 'REST API Basics', durationLabel: '1 week', priority: 'MASTER' as const, orderIndex: 1, description: 'Endpoints, resources, JSON structure, request parameters, and response headers.' },
    { title: 'HTTP Methods (GET, POST, PUT, DELETE)', durationLabel: 'Included', priority: 'MASTER' as const, orderIndex: 2, description: 'CRUD mappings to HTTP verbs and idempotent vs non-idempotent methods.' },
    { title: 'Postman Testing', durationLabel: '3 days', priority: 'MASTER' as const, orderIndex: 3, description: 'Building environment variables, pre-request scripts, and test assertions in Postman.' },
    { title: 'OAuth 2.0 Flow', durationLabel: '5 days', priority: 'MASTER' as const, orderIndex: 4, description: 'Authorization code grant, client credentials, access tokens, refresh tokens.' },
    { title: 'Secrets Management', durationLabel: '3 days', priority: 'MASTER' as const, orderIndex: 5, description: 'Storing API keys securely in environment variables and vault key managers.' },
    { title: 'Webhook + Signature Verification', durationLabel: '5 days', priority: 'MASTER' as const, orderIndex: 6, description: 'Receiving real-time HTTP webhooks and validating HMAC SHA256 signatures.' },
  ];

  for (const t of m2TasksData) {
    const [insertedTask] = await db.insert(roadmapTasks).values({
      monthId: m2.id,
      title: t.title,
      durationLabel: t.durationLabel,
      priority: t.priority,
      orderIndex: t.orderIndex,
      description: t.description,
    }).returning();

    if (t.priority === 'MASTER' || t.priority === 'IMPORTANT') {
      const [ass] = await db.insert(assessments).values({
        taskId: insertedTask.id,
        title: `${t.title} Assessment`,
        description: `Test core API & security knowledge for ${t.title}.`,
        passingScore: 80,
      }).returning();

      await db.insert(assessmentQuestions).values({
        assessmentId: ass.id,
        questionText: `Which header is standard for bearer token authentication in HTTP API requests?`,
        optionsJson: JSON.stringify([
          `Authorization: Bearer <token>`,
          `Authentication: Secret <token>`,
          `X-Access-Token: <token>`,
          `Content-Type: bearer`
        ]),
        correctAnswerIndex: 0,
        answerExplanation: `Standard OAuth 2.0 uses Authorization: Bearer <token>.`,
        orderIndex: 1,
      });
    }
  }

  // ------------------------------------------------------------
  // 3. Month 3: Logic, Databases + Error Handling (4.5 weeks)
  // ------------------------------------------------------------
  const [m3] = await db.insert(roadmapMonths).values({
    monthNumber: 3,
    title: 'Logic, Databases + Error Handling',
    subtitle: 'Data flow and persistence',
    durationWeeks: '4.5 weeks',
    keyOutput: 'Database-driven automation with error handling',
  }).returning();

  for (let w = 9; w <= 12; w++) {
    await db.insert(roadmapWeeks).values({
      monthId: m3.id,
      weekNumber: w,
      title: `Week ${w}: Logic & Databases`,
    });
  }

  const m3TasksData = [
    { title: 'IF/Switch/Merge/Filter/Loop', durationLabel: '5 days', priority: 'MASTER' as const, orderIndex: 1, description: 'Branching logic, merging data streams, conditional filtering, and array looping.' },
    { title: 'Error Handling & Retry', durationLabel: '1 week', priority: 'MASTER' as const, orderIndex: 2, description: 'Exponential backoff retries, error workflows, fallback defaults, and alerts.' },
    { title: 'Rate Limiting & Queues', durationLabel: '3 days', priority: 'IMPORTANT' as const, orderIndex: 3, description: 'Respecting API rate limits using delay nodes, queue workers, and batch processing.' },
    { title: 'Schema Design + Transactions', durationLabel: '5 days', priority: 'MASTER' as const, orderIndex: 4, description: 'Relational data modeling, foreign keys, normalization, and ACID transactions.' },
    { title: 'PostgreSQL/Supabase', durationLabel: '1 week', priority: 'MASTER' as const, orderIndex: 5, description: 'Connecting workflows directly to PostgreSQL and Supabase Database & Auth.' },
    { title: 'Indexing', durationLabel: '1 day', priority: 'BASICS_ENOUGH' as const, orderIndex: 6, description: 'B-tree index basics for query optimization.' },
  ];

  for (const t of m3TasksData) {
    const [insertedTask] = await db.insert(roadmapTasks).values({
      monthId: m3.id,
      title: t.title,
      durationLabel: t.durationLabel,
      priority: t.priority,
      orderIndex: t.orderIndex,
      description: t.description,
    }).returning();

    if (t.priority === 'MASTER' || t.priority === 'IMPORTANT') {
      const [ass] = await db.insert(assessments).values({
        taskId: insertedTask.id,
        title: `${t.title} Logic Assessment`,
        description: `Verify database and flow control logic.`,
        passingScore: 80,
      }).returning();

      await db.insert(assessmentQuestions).values({
        assessmentId: ass.id,
        questionText: `What does the ACID property 'Atomicity' guarantee in database transactions?`,
        optionsJson: JSON.stringify([
          `All operations in the transaction execute completely or none at all`,
          `Queries run in parallel`,
          `Indexes are rebuilt automatically`,
          `Data is formatted as JSON`
        ]),
        correctAnswerIndex: 0,
        answerExplanation: `Atomicity ensures all-or-nothing transaction behavior.`,
        orderIndex: 1,
      });
    }
  }

  // ------------------------------------------------------------
  // 4. Month 4: JavaScript Basics + Custom Code (4 weeks)
  // ------------------------------------------------------------
  const [m4] = await db.insert(roadmapMonths).values({
    monthNumber: 4,
    title: 'JavaScript Basics + Custom Code',
    subtitle: 'Extending low-code with real code',
    durationWeeks: '4 weeks',
    keyOutput: 'Custom code node with API integration',
  }).returning();

  for (let w = 13; w <= 16; w++) {
    await db.insert(roadmapWeeks).values({
      monthId: m4.id,
      weekNumber: w,
      title: `Week ${w}: Custom Code`,
    });
  }

  const m4TasksData = [
    { title: 'JS Fundamentals', durationLabel: '1.5 weeks', priority: 'MASTER' as const, orderIndex: 1, description: 'Variables, data types, ES6 syntax, arrow functions, and scoping.' },
    { title: 'Arrays & Objects', durationLabel: '5 days', priority: 'MASTER' as const, orderIndex: 2, description: 'Map, filter, reduce, object destructuring, and complex array transformations.' },
    { title: 'Loops', durationLabel: '3 days', priority: 'MASTER' as const, orderIndex: 3, description: 'for...of, forEach, while loops, and asynchronous iteration.' },
    { title: 'JSON Handling', durationLabel: '2 days', priority: 'MASTER' as const, orderIndex: 4, description: 'JSON.parse, JSON.stringify, schema validation, and nested property extraction.' },
    { title: 'Custom API Requests (fetch/axios)', durationLabel: '1 week', priority: 'MASTER' as const, orderIndex: 5, description: 'Making HTTP API calls programmatically using native fetch and axios.' },
    { title: 'JavaScript Debugging', durationLabel: '5 days', priority: 'MASTER' as const, orderIndex: 6, description: 'Console logging, stack trace analysis, and debugging Node.js scripts.' },
  ];

  for (const t of m4TasksData) {
    const [insertedTask] = await db.insert(roadmapTasks).values({
      monthId: m4.id,
      title: t.title,
      durationLabel: t.durationLabel,
      priority: t.priority,
      orderIndex: t.orderIndex,
      description: t.description,
    }).returning();

    const [ass] = await db.insert(assessments).values({
      taskId: insertedTask.id,
      title: `${t.title} Verification`,
      description: `Test custom JavaScript capabilities for ${t.title}.`,
      passingScore: 80,
    }).returning();

    await db.insert(assessmentQuestions).values({
      assessmentId: ass.id,
      questionText: `Which Array method creates a new array by transforming every element?`,
      optionsJson: JSON.stringify([
        `Array.prototype.map()`,
        `Array.prototype.filter()`,
        `Array.prototype.forEach()`,
        `Array.prototype.some()`
      ]),
      correctAnswerIndex: 0,
      answerExplanation: `map() returns a new transformed array of equal length.`,
      orderIndex: 1,
    });
  }

  // ------------------------------------------------------------
  // 5. Month 5: Hybrid Approach + AI Integration (4.5 weeks)
  // ------------------------------------------------------------
  const [m5] = await db.insert(roadmapMonths).values({
    monthNumber: 5,
    title: 'Hybrid Approach + AI Integration',
    subtitle: 'Combining automation with LLMs & Agents',
    durationWeeks: '4.5 weeks',
    keyOutput: 'AI-powered automation with validation & guardrails',
  }).returning();

  for (let w = 17; w <= 21; w++) {
    await db.insert(roadmapWeeks).values({
      monthId: m5.id,
      weekNumber: w,
      title: `Week ${w}: AI & Hybrid Integration`,
    });
  }

  const m5TasksData = [
    { title: 'n8n + Code Integration', durationLabel: '4 days', priority: 'MASTER' as const, orderIndex: 1, description: 'Writing custom Code Nodes in n8n for data parsing and custom API calls.' },
    { title: 'Prompt Engineering', durationLabel: '5 days', priority: 'MASTER' as const, orderIndex: 2, description: 'System prompts, few-shot examples, chain-of-thought, and output constraint design.' },
    { title: 'Vector DB / Knowledge Base', durationLabel: '1 week', priority: 'IMPORTANT' as const, orderIndex: 3, description: 'Vector embeddings, chunking strategies, and storing documents in Pinecone/pgvector.' },
    { title: 'RAG Concepts', durationLabel: '1 week', priority: 'IMPORTANT' as const, orderIndex: 4, description: 'Retrieval Augmented Generation architecture, similarity search, and context injection.' },
    { title: 'Function Calling / Tool Use', durationLabel: '3 days', priority: 'MASTER' as const, orderIndex: 5, description: 'Configuring LLMs to invoke external functions, APIs, and database tools.' },
    { title: 'AI Evaluation + Structured Output Validation', durationLabel: '1 week', priority: 'IMPORTANT' as const, orderIndex: 6, description: 'Zod schema validation, JSON mode, and response consistency evaluation.' },
    { title: 'Agent Architecture + Guardrails', durationLabel: '1 week', priority: 'MASTER' as const, orderIndex: 7, description: 'Autonomous agent loops, decision trees, fallback safety, and content guardrails.' },
  ];

  for (const t of m5TasksData) {
    const [insertedTask] = await db.insert(roadmapTasks).values({
      monthId: m5.id,
      title: t.title,
      durationLabel: t.durationLabel,
      priority: t.priority,
      orderIndex: t.orderIndex,
      description: t.description,
    }).returning();

    if (t.priority === 'MASTER' || t.priority === 'IMPORTANT') {
      const [ass] = await db.insert(assessments).values({
        taskId: insertedTask.id,
        title: `${t.title} AI Assessment`,
        description: `Verify your understanding of ${t.title}.`,
        passingScore: 80,
      }).returning();

      await db.insert(assessmentQuestions).values({
        assessmentId: ass.id,
        questionText: `What is the role of Vector Embeddings in RAG systems?`,
        optionsJson: JSON.stringify([
          `To convert text into numerical vectors for semantic similarity search`,
          `To format JSON HTTP responses`,
          `To replace SQL databases`,
          `To encrypt user passwords`
        ]),
        correctAnswerIndex: 0,
        answerExplanation: `Embeddings represent semantic meaning in multi-dimensional vector space.`,
        orderIndex: 1,
      });
    }
  }

  // ------------------------------------------------------------
  // 6. Month 6: Real Projects + Portfolio + Job Prep (4.5 weeks)
  // ------------------------------------------------------------
  const [m6] = await db.insert(roadmapMonths).values({
    monthNumber: 6,
    title: 'Real Projects + Portfolio + Job Prep',
    subtitle: 'Production grade deployment & freelancing',
    durationWeeks: '4.5 weeks',
    keyOutput: 'Portfolio + 2-3 real projects + client/job readiness',
  }).returning();

  for (let w = 22; w <= 26; w++) {
    await db.insert(roadmapWeeks).values({
      monthId: m6.id,
      weekNumber: w,
      title: `Week ${w}: Portfolio & Production`,
    });
  }

  const m6TasksData = [
    { title: 'Real Project Development', durationLabel: '2 weeks', priority: 'MASTER' as const, orderIndex: 1, description: 'Building 2-3 production-grade client automation systems end-to-end.' },
    { title: 'Testing & Monitoring', durationLabel: '1 week', priority: 'MASTER' as const, orderIndex: 2, description: 'End-to-end integration testing, health checks, and error alert triggers.' },
    { title: 'Version Control (Git/GitHub)', durationLabel: '3 days', priority: 'IMPORTANT' as const, orderIndex: 3, description: 'Git workflow, branching, pull requests, and maintaining clean GitHub repositories.' },
    { title: 'Deployment (Render/Railway/VPS)', durationLabel: '3 days', priority: 'IMPORTANT' as const, orderIndex: 4, description: 'Deploying n8n, Next.js apps, and worker services to Render, Railway, or VPS.' },
    { title: 'Observability & Logging', durationLabel: '3 days', priority: 'IMPORTANT' as const, orderIndex: 5, description: 'Centralized log aggregation, execution tracing, and monitoring dashboards.' },
    { title: 'Cost Control & Optimization', durationLabel: '3 days', priority: 'IMPORTANT' as const, orderIndex: 6, description: 'Managing LLM API token consumption, database connection pooling, and VPS resources.' },
    { title: 'Business Requirement Analysis', durationLabel: '3 days', priority: 'IMPORTANT' as const, orderIndex: 7, description: 'Translating non-technical client requirements into technical automation specs.' },
    { title: 'Freelancing/Job Preparation', durationLabel: '1 week', priority: 'IMPORTANT' as const, orderIndex: 8, description: 'Building a developer portfolio, case studies, client proposal templates, and resume.' },
  ];

  for (const t of m6TasksData) {
    const [insertedTask] = await db.insert(roadmapTasks).values({
      monthId: m6.id,
      title: t.title,
      durationLabel: t.durationLabel,
      priority: t.priority,
      orderIndex: t.orderIndex,
      description: t.description,
    }).returning();

    if (t.priority === 'MASTER' || t.priority === 'IMPORTANT') {
      const [ass] = await db.insert(assessments).values({
        taskId: insertedTask.id,
        title: `${t.title} Production Check`,
        description: `Verify readiness for ${t.title}.`,
        passingScore: 80,
      }).returning();

      await db.insert(assessmentQuestions).values({
        assessmentId: ass.id,
        questionText: `What is essential before deploying an automation workflow to production?`,
        optionsJson: JSON.stringify([
          `Implementing error handling, logging, and secrets management`,
          `Deleting all test logs`,
          `Disabling authorization checks`,
          `Hardcoding database passwords`
        ]),
        correctAnswerIndex: 0,
        answerExplanation: `Error recovery, logging, and security credentials management are essential for production systems.`,
        orderIndex: 1,
      });
    }
  }

  // ------------------------------------------------------------
  // 7. Seed Projects (All 6 Roadmap Projects preserved exactly)
  // ------------------------------------------------------------
  const projectList = [
    { projectNumber: 1, monthId: m1.id, title: 'Gmail Auto-Responder', weekRange: 'Week 2–4', description: 'Email automation with conditions & n8n workflow.', techStack: 'n8n, Gmail API, Webhooks' },
    { projectNumber: 2, monthId: m2.id, title: 'Lead Capture System', weekRange: 'Week 5–8', description: 'API + DB + webhook real-time lead capture system.', techStack: 'n8n, REST API, Webhooks, Supabase' },
    { projectNumber: 3, monthId: m3.id, title: 'CRM / Task Manager DB', weekRange: 'Week 9–12', description: 'Database-driven CRM with error handling & retry logic.', techStack: 'PostgreSQL, Supabase, n8n' },
    { projectNumber: 4, monthId: m4.id, title: 'AI Data Processor', weekRange: 'Week 13–17', description: 'Custom JS code nodes with external API integration.', techStack: 'JavaScript, fetch/axios, Node.js' },
    { projectNumber: 5, monthId: m5.id, title: 'AI Support Bot (RAG)', weekRange: 'Week 18–21', description: 'Vector DB + AI + validation + function calling.', techStack: 'OpenAI, Vector DB, n8n' },
    { projectNumber: 6, monthId: m6.id, title: 'Full-Stack Automation System', weekRange: 'Week 22–26', description: 'Production suite with monitoring, VPS deployment, & client portfolio.', techStack: 'Next.js, n8n, Supabase, Docker/VPS' },
  ];

  for (const p of projectList) {
    await db.insert(projects).values(p);
  }

  // ------------------------------------------------------------
  // 8. Seed Skill Categories (Detailed Skill Breakdown section)
  // ------------------------------------------------------------
  const skillCategories = [
    { category: 'Automation & n8n', title: 'n8n Workflows & Trigger Architecture', description: 'Nodes, triggers, webhooks, error retries, and execution logging.' },
    { category: 'APIs & Security', title: 'REST APIs & Security Protocols', description: 'HTTP verbs, Postman, OAuth 2.0, secrets management, and webhook verification.' },
    { category: 'Databases & Data', title: 'Relational Schema & Data Persistence', description: 'ACID transactions, PostgreSQL, Supabase, indexing, and data mapping.' },
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

  // ------------------------------------------------------------
  // 9. Seed Milestones, Checklist & Pro Tips
  // ------------------------------------------------------------
  const checklistItems = [
    'Automation flows work end-to-end',
    'System is independent',
    'Costs are controlled',
    'Monitored and deployed',
    'All doubts are cleared',
    'Errors scale are cleared',
    'Errors are handled and logged',
    'System is documented',
    'You can explain the business value',
  ];

  for (let i = 0; i < checklistItems.length; i++) {
    await db.insert(roadmapMilestones).values({
      type: 'SUCCESS_CHECKLIST',
      title: checklistItems[i],
      orderIndex: i + 1,
    });
  }

  const proTips = [
    'Build small projects early and keep building.',
    "Don't just watch tutorials — build, hack, fix, repeat.",
    'Use AI tools to learn faster (ChatGPT, Cursor, etc.).',
    'Keep your GitHub updated (even small projects).',
    "Learn to debug — it's 50% of real development.",
    'Focus on business value, not just new tools.',
    'Take notes and maintain a personal knowledge base.',
    'Join communities (Discord, Reddit, LinkedIn).',
  ];

  for (let i = 0; i < proTips.length; i++) {
    await db.insert(roadmapMilestones).values({
      type: 'PRO_TIP',
      title: proTips[i],
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

  console.log('✨ Comprehensive Roadmap Seed & Audit Completed Successfully!');
}

if (require.main === module) {
  seedRoadmap()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('❌ Seed error:', err);
      process.exit(1);
    });
}
