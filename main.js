import React, { useMemo, useState } from "https://esm.sh/react@18.3.1";
import { createRoot } from "https://esm.sh/react-dom@18.3.1/client";
import htm from "https://esm.sh/htm@3.1.1";
import {
  HashRouter,
  NavLink,
  Navigate,
  Outlet,
  Route,
  Routes,
  useNavigate,
} from "https://esm.sh/react-router-dom@6.30.1";
import {
  BookOpen,
  ChartColumn,
  Code2,
  FileText,
  LayoutDashboard,
  PlayCircle,
  UserRound,
  Video,
} from "https://esm.sh/lucide-react@0.511.0";
import {
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from "https://esm.sh/recharts@2.15.1";

const html = htm.bind(React.createElement);

const HISTORY_STORAGE_KEY = "placementReadinessHistory";
const SELECTED_ANALYSIS_STORAGE_KEY = "placementReadinessSelectedId";
const PRIMARY_COLOR = "hsl(245, 58%, 51%)";

const featureCards = [
  {
    icon: Code2,
    title: "Practice Problems",
    description: "Build confidence with company-style coding rounds and focused revision sets.",
  },
  {
    icon: Video,
    title: "Mock Interviews",
    description: "Rehearse placement conversations with guided technical and HR mock sessions.",
  },
  {
    icon: ChartColumn,
    title: "Track Progress",
    description: "Monitor consistency across preparation, assessments, and final interview readiness.",
  },
];

const dashboardNav = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/practice", label: "Practice", icon: BookOpen },
  { to: "/assessments", label: "Assessments", icon: PlayCircle },
  { to: "/resources", label: "Resources", icon: FileText },
  { to: "/profile", label: "Profile", icon: UserRound },
];

const categoryConfig = [
  {
    category: "Core CS",
    skills: [
      { label: "DSA", patterns: [/\bdsa\b/i, /data structures?/i, /algorithms?/i] },
      { label: "OOP", patterns: [/\boop\b/i, /object[-\s]?oriented/i] },
      { label: "DBMS", patterns: [/\bdbms\b/i, /database management/i] },
      { label: "OS", patterns: [/\bos\b/i, /operating systems?/i] },
      { label: "Networks", patterns: [/computer networks?/i, /\bnetworks?\b/i] },
    ],
  },
  {
    category: "Languages",
    skills: [
      { label: "Java", patterns: [/\bjava\b/i] },
      { label: "Python", patterns: [/\bpython\b/i] },
      { label: "JavaScript", patterns: [/\bjavascript\b/i] },
      { label: "TypeScript", patterns: [/\btypescript\b/i] },
      { label: "C", patterns: [/\bc language\b/i, /\bc programming\b/i, /(?:^|[\s,(])c(?:[\s),.]|$)/i] },
      { label: "C++", patterns: [/\bc\+\+\b/i] },
      { label: "C#", patterns: [/\bc#\b/i] },
      { label: "Go", patterns: [/\bgolang\b/i, /(?:^|[\s,(])go(?:[\s),.]|$)/i] },
    ],
  },
  {
    category: "Web",
    skills: [
      { label: "React", patterns: [/\breact\b/i] },
      { label: "Next.js", patterns: [/\bnext\.?js\b/i] },
      { label: "Node.js", patterns: [/\bnode\.?js\b/i] },
      { label: "Express", patterns: [/\bexpress\b/i] },
      { label: "REST", patterns: [/\brest\b/i, /restful/i] },
      { label: "GraphQL", patterns: [/\bgraphql\b/i] },
    ],
  },
  {
    category: "Data",
    skills: [
      { label: "SQL", patterns: [/\bsql\b/i] },
      { label: "MongoDB", patterns: [/\bmongodb\b/i] },
      { label: "PostgreSQL", patterns: [/\bpostgresql\b/i, /\bpostgres\b/i] },
      { label: "MySQL", patterns: [/\bmysql\b/i] },
      { label: "Redis", patterns: [/\bredis\b/i] },
    ],
  },
  {
    category: "Cloud/DevOps",
    skills: [
      { label: "AWS", patterns: [/\baws\b/i, /amazon web services/i] },
      { label: "Azure", patterns: [/\bazure\b/i] },
      { label: "GCP", patterns: [/\bgcp\b/i, /google cloud/i] },
      { label: "Docker", patterns: [/\bdocker\b/i] },
      { label: "Kubernetes", patterns: [/\bkubernetes\b/i, /\bk8s\b/i] },
      { label: "CI/CD", patterns: [/\bci\/cd\b/i, /continuous integration/i, /continuous delivery/i] },
      { label: "Linux", patterns: [/\blinux\b/i] },
    ],
  },
  {
    category: "Testing",
    skills: [
      { label: "Selenium", patterns: [/\bselenium\b/i] },
      { label: "Cypress", patterns: [/\bcypress\b/i] },
      { label: "Playwright", patterns: [/\bplaywright\b/i] },
      { label: "JUnit", patterns: [/\bjunit\b/i] },
      { label: "PyTest", patterns: [/\bpytest\b/i, /\bpy\.?test\b/i] },
    ],
  },
];

const skillQuestionBank = {
  DSA: "How would you optimize search in sorted data?",
  OOP: "Which OOP principles have you applied in your projects and why?",
  DBMS: "How do normalization and denormalization change database design tradeoffs?",
  OS: "What happens during context switching in an operating system?",
  Networks: "How do DNS lookup and TCP connection setup work before a web page loads?",
  Java: "How does the JVM manage memory and garbage collection?",
  Python: "What are the tradeoffs between Python lists, tuples, and dictionaries?",
  JavaScript: "How does the event loop affect asynchronous code execution in JavaScript?",
  TypeScript: "How do TypeScript interfaces improve maintainability in larger applications?",
  C: "How would you manage memory safely in a C application?",
  "C++": "When would you choose a smart pointer in C++ over a raw pointer?",
  "C#": "What are common use cases for async/await in C#?",
  Go: "Why do Go routines help with concurrency-heavy backend systems?",
  React: "Explain state management options in React and when you would choose each one.",
  "Next.js": "How do server components and client components differ in Next.js?",
  "Node.js": "What makes Node.js suitable for I/O-heavy services?",
  Express: "How would you structure middleware in an Express application?",
  REST: "How do you design versioning and error handling in REST APIs?",
  GraphQL: "When does GraphQL provide a better developer experience than REST?",
  SQL: "Explain indexing and when it helps.",
  MongoDB: "When would you choose a document database over a relational database?",
  PostgreSQL: "Which PostgreSQL features are most useful for transactional systems?",
  MySQL: "How do you diagnose slow queries in MySQL?",
  Redis: "What problems does Redis solve beyond simple caching?",
  AWS: "How would you choose between EC2, Lambda, and managed services on AWS?",
  Azure: "How does Azure fit into a modern deployment pipeline?",
  GCP: "Which GCP services are useful for scalable application hosting?",
  Docker: "How do Docker images improve consistency across environments?",
  Kubernetes: "What problems does Kubernetes solve for modern deployments?",
  "CI/CD": "How do CI/CD pipelines reduce release risk in engineering teams?",
  Linux: "Which Linux commands and concepts are most useful during backend debugging?",
  Selenium: "How do you keep Selenium tests stable across UI changes?",
  Cypress: "What kinds of frontend workflows are easiest to validate with Cypress?",
  Playwright: "Why is Playwright effective for cross-browser end-to-end testing?",
  JUnit: "What makes a JUnit test suite maintainable at scale?",
  PyTest: "How do fixtures improve test readability in PyTest?",
};

const generalQuestionBank = [
  "Walk me through one project that best represents your current engineering level.",
  "How do you break down a new problem when you do not immediately know the solution?",
  "What is one technical weakness you are actively improving and how are you approaching it?",
  "How do you debug an issue when the error is intermittent and hard to reproduce?",
  "How do you balance writing working code quickly with writing code that stays maintainable?",
  "How would you explain your resume highlights to a hiring manager in two minutes?",
  "What kinds of questions do you ask an interviewer to understand the role better?",
  "How do you prepare differently for coding rounds and project-based interviews?",
  "What signals tell you that a solution needs to be optimized further?",
  "How do you recover if you get stuck during a technical interview?",
];

const assessmentItems = [
  { title: "Aptitude Sprint", description: "Timed quantitative, verbal, and reasoning drills will appear here." },
  { title: "Coding Round Simulator", description: "Company-style online assessment practice will be available here." },
  { title: "Interview Readiness Check", description: "Structured self-assessment rubrics will be organized here." },
];

const profileItems = [
  { title: "Career Goal", description: "Define your role targets, company tiers, and placement preferences here." },
  { title: "Interview Profile", description: "Resume health, communication notes, and self-assessment markers will live here." },
  { title: "Learning Rhythm", description: "Track your preparation cadence, focus areas, and confidence levels here." },
];

const skillBreakdownData = [
  { skill: "DSA", score: 75 },
  { skill: "System Design", score: 60 },
  { skill: "Communication", score: 80 },
  { skill: "Resume", score: 85 },
  { skill: "Aptitude", score: 70 },
];

const weeklyActivity = [
  { day: "Mon", active: true },
  { day: "Tue", active: true },
  { day: "Wed", active: false },
  { day: "Thu", active: true },
  { day: "Fri", active: true },
  { day: "Sat", active: false },
  { day: "Sun", active: true },
];

const upcomingAssessments = [
  { title: "DSA Mock Test", schedule: "Tomorrow, 10:00 AM" },
  { title: "System Design Review", schedule: "Wed, 2:00 PM" },
  { title: "HR Interview Prep", schedule: "Friday, 11:00 AM" },
];

function safeReadJson(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (error) {
    return fallback;
  }
}

function safeWriteJson(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    return;
  }
}

function loadHistory() {
  const value = safeReadJson(HISTORY_STORAGE_KEY, []);
  return Array.isArray(value) ? value : [];
}

function loadSelectedId() {
  const value = safeReadJson(SELECTED_ANALYSIS_STORAGE_KEY, null);
  return typeof value === "string" ? value : null;
}

function formatDateTime(timestamp) {
  return new Date(timestamp).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function extractSkills(jdText) {
  const extracted = {};
  const detectedCategories = [];
  const detectedSkills = [];

  categoryConfig.forEach(({ category, skills }) => {
    const hits = skills
      .filter(({ patterns }) => patterns.some((pattern) => pattern.test(jdText)))
      .map(({ label }) => label);

    if (hits.length) {
      extracted[category] = hits;
      detectedCategories.push(category);
      detectedSkills.push(...hits);
    }
  });

  if (!detectedSkills.length) {
    return {
      grouped: { General: ["General fresher stack"] },
      detectedCategories: [],
      detectedSkills: ["General fresher stack"],
    };
  }

  return {
    grouped: extracted,
    detectedCategories,
    detectedSkills,
  };
}

function uniqueItems(items) {
  return Array.from(new Set(items));
}

function buildChecklist(groupedSkills, detectedSkills, detectedCategories) {
  const hasCore = detectedCategories.includes("Core CS");
  const hasWeb = detectedCategories.includes("Web");
  const hasData = detectedCategories.includes("Data");
  const hasCloud = detectedCategories.includes("Cloud/DevOps");
  const hasTesting = detectedCategories.includes("Testing");
  const hasReact = detectedSkills.includes("React");
  const hasNode = detectedSkills.includes("Node.js");
  const hasSQL = detectedSkills.includes("SQL");
  const primarySkills = detectedSkills.filter((skill) => skill !== "General fresher stack").slice(0, 3);
  const focusSummary = primarySkills.length ? primarySkills.join(", ") : "the general fresher stack";

  const rounds = [
    {
      title: "Round 1: Aptitude / Basics",
      items: [
        "Revise percentages, ratios, speed-distance, and probability shortcuts.",
        "Practice 2 timed reasoning sets with strict time limits.",
        "Review common output-based and syntax-based language questions.",
        "Prepare concise introductions for your academic and project background.",
        "Solve one mixed aptitude set in an exam-like environment.",
        `Write quick revision notes for ${focusSummary} so you can recall terms under time pressure.`,
      ],
    },
    {
      title: "Round 2: DSA + Core CS",
      items: uniqueItems(
        [
          "Revise array, string, and hash-map patterns with time complexity tradeoffs.",
          "Practice recursion, dynamic programming, and greedy strategy questions.",
          hasCore ? "Refresh OOP, DBMS, OS, and Networks concepts with short notes." : null,
          hasSQL ? "Revisit joins, normalization, indexing, and query optimization basics." : null,
          !hasCore ? "Build crisp explanations for core CS basics that typically appear in fresher interviews." : null,
          "Explain one recent coding solution aloud as if in an interview.",
          "Run one mock coding round with 2 medium-level questions.",
          `Prepare short answers connecting ${focusSummary} to problem solving and implementation choices.`,
        ].filter(Boolean),
      ).slice(0, 8),
    },
    {
      title: "Round 3: Tech interview (projects + stack)",
      items: uniqueItems(
        [
          "Prepare a project walkthrough covering problem, architecture, and tradeoffs.",
          hasReact ? "Revise component structure, state handling, hooks, and rendering flow in React." : null,
          hasWeb ? "Review API integration, authentication flow, and frontend-backend coordination." : null,
          hasNode ? "Rehearse request lifecycle, middleware, and backend debugging examples." : null,
          hasData ? "Be ready to justify schema choices, database operations, and data consistency decisions." : null,
          hasCloud ? "Summarize deployment flow, environment setup, and monitoring basics from your projects." : null,
          hasTesting ? "Discuss how you validate quality with unit, UI, or automation tests." : null,
          "Prepare 2 examples of debugging or ownership stories from your work.",
          `Map one project feature directly to ${focusSummary} so your stack discussion stays concrete.`,
          !hasWeb && !hasData && !hasCloud && !hasTesting
            ? "Prepare a clean end-to-end walkthrough of one academic or personal project with tradeoffs."
            : null,
        ].filter(Boolean),
      ).slice(0, 8),
    },
    {
      title: "Round 4: Managerial / HR",
      items: [
        "Prepare a concise answer for why you want this role and company.",
        "Draft stories for teamwork, conflict, failure, and recovery using a simple structure.",
        "Align your resume bullets with measurable outcomes and clear ownership.",
        "Practice answering strengths, weaknesses, and learning-curve questions honestly.",
        "Prepare 4 thoughtful questions to ask the interviewer at the end.",
        "Rehearse a 60-second closing summary that links your preparation to the role requirements.",
      ],
    },
  ];

  return rounds.map((round) => ({
    ...round,
    items: round.items.slice(0, 8),
  }));
}

function buildSevenDayPlan(detectedSkills, detectedCategories) {
  const hasReact = detectedSkills.includes("React");
  const hasNode = detectedSkills.includes("Node.js");
  const hasSQL = detectedSkills.includes("SQL");
  const hasCloud = detectedCategories.includes("Cloud/DevOps");
  const hasTesting = detectedCategories.includes("Testing");

  return [
    {
      day: "Day 1",
      focus: "Basics + core CS",
      details: `Revise OOP, DBMS, OS, and Networks summaries${detectedCategories.includes("Core CS") ? " with emphasis on the areas mentioned in the JD." : " for a general fresher interview baseline."}`,
    },
    {
      day: "Day 2",
      focus: "Basics + core CS",
      details: `Strengthen language fundamentals${detectedSkills.length ? ` in ${detectedSkills.slice(0, 2).join(" and ")}` : ""} and write one-page notes for revision.`,
    },
    {
      day: "Day 3",
      focus: "DSA + coding practice",
      details: "Solve array, string, search, and recursion problems under time constraints.",
    },
    {
      day: "Day 4",
      focus: "DSA + coding practice",
      details: `Practice dynamic programming, complexity analysis, and one mock coding round${hasSQL ? "; add SQL query practice." : "."}`,
    },
    {
      day: "Day 5",
      focus: "Project + resume alignment",
      details: `Update project explanations${hasReact ? " with frontend architecture and state management notes" : ""}${hasNode ? " and backend API decisions" : ""}${hasCloud ? ", deployment flow, and environment handling" : ""}.`,
    },
    {
      day: "Day 6",
      focus: "Mock interview questions",
      details: `Run one technical mock interview and one HR round${hasTesting ? ", including test strategy discussion" : ""}.`,
    },
    {
      day: "Day 7",
      focus: "Revision + weak areas",
      details: `Revisit weak topics, revise resume cues, and rehearse quick answers${hasTesting || hasCloud ? " for tooling and infrastructure questions" : ""}.`,
    },
  ];
}

function buildQuestions(detectedSkills, detectedCategories) {
  const questions = [];
  const prioritizedDefaults = [
    "Which data structures would you choose for a placement-style problem involving frequent lookups and why?",
    "How would you explain the architecture of your strongest project to a technical interviewer?",
    "What tradeoffs do you consider before choosing a database or API design for a new feature?",
    "How do you debug a failing implementation when the bug only appears for edge cases?",
  ];

  detectedSkills.forEach((skill) => {
    if (skillQuestionBank[skill]) {
      questions.push(skillQuestionBank[skill]);
    }
  });

  if (detectedCategories.includes("Core CS")) {
    questions.push("How would you explain normalization, process scheduling, and network latency to an interviewer in simple terms?");
  }

  if (detectedCategories.includes("Web")) {
    questions.push("How would you design a maintainable full-stack workflow for a fresher-level product feature?");
  }

  if (detectedCategories.includes("Data")) {
    questions.push("How do you choose between relational and non-relational storage for a new application feature?");
  }

  if (detectedCategories.includes("Cloud/DevOps")) {
    questions.push("What deployment or environment issues have you faced, and how did you resolve them?");
  }

  if (detectedCategories.includes("Testing")) {
    questions.push("How do you decide what to automate and what to test manually?");
  }

  prioritizedDefaults.forEach((question) => {
    questions.push(question);
  });

  generalQuestionBank.forEach((question) => {
    questions.push(question);
  });

  return uniqueItems(questions).slice(0, 10);
}

function calculateReadinessScore({ company, role, jdText, detectedCategories }) {
  let score = 35;
  score += Math.min(detectedCategories.length * 5, 30);

  if (company.trim()) {
    score += 10;
  }

  if (role.trim()) {
    score += 10;
  }

  if (jdText.trim().length > 800) {
    score += 10;
  }

  return Math.min(score, 100);
}

function analyzeJobDescription({ company, role, jdText }) {
  const extracted = extractSkills(jdText);
  const checklist = buildChecklist(extracted.grouped, extracted.detectedSkills, extracted.detectedCategories);
  const plan = buildSevenDayPlan(extracted.detectedSkills, extracted.detectedCategories);
  const questions = buildQuestions(extracted.detectedSkills, extracted.detectedCategories);
  const readinessScore = calculateReadinessScore({
    company,
    role,
    jdText,
    detectedCategories: extracted.detectedCategories,
  });

  return {
    extractedSkills: extracted.grouped,
    checklist,
    plan,
    questions,
    readinessScore,
  };
}

function Card({ className = "", children }) {
  return html`
    <section className=${`rounded-3xl border border-line bg-panel p-6 shadow-panel sm:p-8 ${className}`}>
      ${children}
    </section>
  `;
}

function CardHeader({ eyebrow, title, description, action }) {
  return html`
    <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        ${eyebrow
          ? html`<p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand">${eyebrow}</p>`
          : null}
        <h3 className="mt-3 font-serif text-3xl text-ink">${title}</h3>
        ${description ? html`<p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">${description}</p>` : null}
      </div>
      ${action ? html`<div className="shrink-0">${action}</div>` : null}
    </header>
  `;
}

function Tag({ children }) {
  return html`
    <span className="inline-flex items-center rounded-full border border-line bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700">
      ${children}
    </span>
  `;
}

function ProgressBar({ value }) {
  return html`
    <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-200">
      <div
        className="h-full rounded-full bg-brand transition-all duration-200 ease-in-out"
        style=${{ width: `${value}%` }}
      ></div>
    </div>
  `;
}

function ReadinessRing() {
  const score = 72;
  const radius = 82;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (score / 100) * circumference;

  return html`
    <${Card}>
      <${CardHeader}
        eyebrow="Performance"
        title="Overall Readiness"
        description="A consolidated placement index based on current practice consistency and interview preparedness."
      />
      <div className="flex items-center justify-center">
        <div className="relative flex h-64 w-64 items-center justify-center">
          <svg className="-rotate-90" width="220" height="220" viewBox="0 0 220 220" aria-hidden="true">
            <circle cx="110" cy="110" r=${radius} fill="none" stroke="#e2e8f0" strokeWidth="14" />
            <circle
              cx="110"
              cy="110"
              r=${radius}
              fill="none"
              stroke=${PRIMARY_COLOR}
              strokeWidth="14"
              strokeLinecap="round"
              strokeDasharray=${circumference}
              strokeDashoffset=${dashOffset}
              className="readiness-ring"
            />
          </svg>
          <div className="absolute text-center">
            <div className="font-serif text-5xl text-ink">${score}</div>
            <div className="mt-2 text-sm font-medium text-slate-500">Readiness Score</div>
          </div>
        </div>
      </div>
    </${Card}>
  `;
}

function SkillBreakdownCard() {
  return html`
    <${Card}>
      <${CardHeader}
        eyebrow="Coverage"
        title="Skill Breakdown"
        description="A balanced view of core placement areas based on recent preparation trends."
      />
      <div className="h-72 w-full">
        <${ResponsiveContainer} width="100%" height="100%">
          <${RadarChart} data=${skillBreakdownData} outerRadius="72%">
            <${PolarGrid} stroke="#cbd5e1" />
            <${PolarAngleAxis}
              dataKey="skill"
              tick=${{ fill: "#475569", fontSize: 12, fontFamily: "Inter, sans-serif" }}
            />
            <${Radar}
              name="Score"
              dataKey="score"
              stroke=${PRIMARY_COLOR}
              fill=${PRIMARY_COLOR}
              fillOpacity=${0.18}
            />
          </${RadarChart}>
        </${ResponsiveContainer}>
      </div>
    </${Card}>
  `;
}

function ContinuePracticeCard() {
  const completed = 3;
  const total = 10;

  return html`
    <${Card}>
      <${CardHeader}
        eyebrow="Momentum"
        title="Continue Practice"
        description="Resume the most recent topic without losing your place in the current learning run."
      />
      <div className="rounded-2xl border border-line bg-slate-50 p-5">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand">Last Topic</p>
        <h4 className="mt-3 font-serif text-3xl text-ink">Dynamic Programming</h4>
        <p className="mt-4 text-sm text-slate-600">${completed}/${total} completed</p>
        <${ProgressBar} value=${(completed / total) * 100} />
        <button
          type="button"
          className="mt-6 inline-flex min-h-11 items-center justify-center rounded-xl bg-brand px-5 text-sm font-semibold text-white transition-colors duration-200 ease-in-out hover:bg-indigo-700"
        >
          Continue
        </button>
      </div>
    </${Card}>
  `;
}

function WeeklyGoalsCard() {
  const solved = 12;
  const target = 20;

  return html`
    <${Card}>
      <${CardHeader}
        eyebrow="Consistency"
        title="Weekly Goals"
        description="A simple weekly target to keep preparation momentum visible and measurable."
      />
      <div>
        <p className="text-base font-medium text-ink">Problems Solved: ${solved}/${target} this week</p>
        <${ProgressBar} value=${(solved / target) * 100} />
      </div>
      <div className="mt-6 flex flex-wrap gap-3">
        ${weeklyActivity.map(
          ({ day, active }) => html`
            <div key=${day} className="flex flex-col items-center gap-2">
              <div
                className=${[
                  "flex h-10 w-10 items-center justify-center rounded-full border text-xs font-semibold",
                  active ? "border-brand bg-brand text-white" : "border-line bg-slate-100 text-slate-500",
                ].join(" ")}
              >
                ${day.slice(0, 1)}
              </div>
              <span className="text-xs text-slate-500">${day}</span>
            </div>
          `,
        )}
      </div>
    </${Card}>
  `;
}

function UpcomingAssessmentsCard() {
  return html`
    <${Card} className="lg:col-span-2">
      <${CardHeader}
        eyebrow="Schedule"
        title="Upcoming Assessments"
        description="Stay aware of the next evaluation checkpoints in your placement preparation plan."
      />
      <div className="space-y-4">
        ${upcomingAssessments.map(
          ({ title, schedule }) => html`
            <div
              key=${title}
              className="flex flex-col justify-between gap-3 rounded-2xl border border-line bg-slate-50 px-5 py-4 sm:flex-row sm:items-center"
            >
              <div>
                <h4 className="font-medium text-ink">${title}</h4>
                <p className="mt-1 text-sm text-slate-600">${schedule}</p>
              </div>
              <span className="text-sm font-medium text-brand">Upcoming</span>
            </div>
          `,
        )}
      </div>
    </${Card}>
  `;
}

function DashboardPage({ latestEntry, historyCount }) {
  return html`
    <section className="space-y-6">
      <div className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand">Overview</p>
        <h3 className="mt-3 font-serif text-4xl text-ink">Placement Readiness Dashboard</h3>
        <p className="mt-3 text-base leading-8 text-slate-600">
          A focused preparation summary covering readiness, skill coverage, current momentum, and your next assessments.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <${ReadinessRing} />
        <${SkillBreakdownCard} />
        <${ContinuePracticeCard} />
        <${WeeklyGoalsCard} />
        <${UpcomingAssessmentsCard} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <${Card}>
          <${CardHeader}
            eyebrow="Latest Analysis"
            title=${latestEntry ? latestEntry.role || "Recent job analysis" : "No analysis yet"}
            description=${latestEntry
              ? `${latestEntry.company || "No company"} • Readiness Score ${latestEntry.readinessScore}/100`
              : "Analyze a job description to generate extracted skills, preparation checklists, and interview questions."}
          />
          ${
            latestEntry
              ? html`
                  <div className="flex flex-wrap gap-2">
                    ${Object.entries(latestEntry.extractedSkills)
                      .flatMap(([, skills]) => skills)
                      .slice(0, 6)
                      .map((skill) => html`<${Tag} key=${skill}>${skill}</${Tag}>`)}
                  </div>
                `
              : html`<p className="text-sm leading-7 text-slate-600">Start from the Practice workspace to create your first analysis entry.</p>`
          }
        </${Card}>
        <${Card}>
          <${CardHeader}
            eyebrow="History"
            title="Saved Analyses"
            description="Every analysis is stored locally so you can revisit preparation notes after refresh."
          />
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-2xl border border-line bg-slate-50 px-5 py-4">
              <span className="text-sm text-slate-600">Saved entries</span>
              <span className="font-semibold text-ink">${historyCount}</span>
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-line bg-slate-50 px-5 py-4">
              <span className="text-sm text-slate-600">Offline ready</span>
              <span className="font-semibold text-brand">Local storage</span>
            </div>
          </div>
        </${Card}>
      </div>
    </section>
  `;
}

function LandingPage() {
  const navigate = useNavigate();

  return html`
    <div className="min-h-screen bg-surface">
      <main className="mx-auto flex min-h-screen max-w-7xl flex-col px-6 py-10 sm:px-8 lg:px-12">
        <section className="flex flex-1 flex-col justify-center py-16">
          <div className="max-w-3xl">
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-brand">
              Placement Readiness Platform
            </p>
            <h1 className="max-w-3xl font-serif text-5xl leading-tight text-ink sm:text-6xl">
              Ace Your Placement
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
              Practice, assess, and prepare for your dream job.
            </p>
            <button
              type="button"
              onClick=${() => navigate("/dashboard")}
              className="mt-10 inline-flex min-h-12 items-center justify-center rounded-xl bg-brand px-6 text-sm font-semibold text-white transition-colors duration-200 ease-in-out hover:bg-indigo-700"
            >
              Get Started
            </button>
          </div>
        </section>

        <section className="py-8">
          <div className="grid gap-6 lg:grid-cols-3">
            ${featureCards.map(
              ({ icon: Icon, title, description }) => html`
                <article
                  key=${title}
                  className="rounded-2xl border border-line bg-panel p-8 shadow-panel transition-transform duration-200 ease-in-out"
                >
                  <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-brand">
                    <${Icon} className="h-6 w-6" strokeWidth=${1.8} />
                  </div>
                  <h2 className="font-serif text-2xl text-ink">${title}</h2>
                  <p className="mt-3 text-sm leading-7 text-slate-600">${description}</p>
                </article>
              `,
            )}
          </div>
        </section>

        <footer className="border-t border-line py-8 text-sm text-slate-500">
          © 2026 Placement Readiness Platform. All rights reserved.
        </footer>
      </main>
    </div>
  `;
}

function DashboardShell() {
  return html`
    <div className="min-h-screen bg-slate-100">
      <div className="grid min-h-screen lg:grid-cols-[280px_1fr]">
        <aside className="border-r border-line bg-panel px-5 py-8">
          <div className="mb-10">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand">
              Placement Prep
            </p>
            <h1 className="mt-3 font-serif text-3xl text-ink">Preparation Workspace</h1>
          </div>

          <nav className="space-y-2">
            ${dashboardNav.map(
              ({ to, label, icon: Icon }) => html`
                <${NavLink}
                  key=${to}
                  to=${to}
                  className=${({ isActive }) =>
                    [
                      "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors duration-200 ease-in-out",
                      isActive
                        ? "bg-indigo-50 text-brand"
                        : "text-slate-600 hover:bg-slate-50 hover:text-ink",
                    ].join(" ")}
                >
                  <${Icon} className="h-5 w-5" strokeWidth=${1.8} />
                  <span>${label}</span>
                </${NavLink}>
              `,
            )}
          </nav>
        </aside>

        <div className="flex min-h-screen flex-col">
          <header className="flex items-center justify-between border-b border-line bg-panel px-6 py-5 sm:px-8">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand">
                Placement Prep
              </p>
              <h2 className="mt-2 font-serif text-3xl text-ink">Dashboard Area</h2>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-full border border-line bg-slate-100 text-sm font-semibold text-slate-600">
              U
            </div>
          </header>

          <main className="flex-1 px-6 py-8 sm:px-8">
            <${Outlet} />
          </main>
        </div>
      </div>
    </div>
  `;
}

function PracticePage({ onAnalyze }) {
  const navigate = useNavigate();
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [jdText, setJdText] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!jdText.trim()) {
      return;
    }

    const entry = onAnalyze({ company, role, jdText });
    navigate("/results");
    return entry;
  };

  return html`
    <section className="space-y-6">
      <div className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand">Analysis Workspace</p>
        <h3 className="mt-3 font-serif text-4xl text-ink">Analyze a job description offline</h3>
        <p className="mt-3 text-base leading-8 text-slate-600">
          Paste any placement or fresher JD to extract skills, build a prep checklist, create a 7-day plan, and generate likely interview questions.
        </p>
      </div>

      <${Card}>
        <form className="space-y-6" onSubmit=${handleSubmit}>
          <div className="grid gap-6 md:grid-cols-2">
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Company</span>
              <input
                className="mt-2 w-full rounded-2xl border border-line bg-slate-50 px-4 py-3 text-sm text-ink outline-none transition-colors duration-200 ease-in-out focus:border-brand"
                type="text"
                value=${company}
                onInput=${(event) => setCompany(event.target.value)}
                placeholder="Example: Infosys"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Role</span>
              <input
                className="mt-2 w-full rounded-2xl border border-line bg-slate-50 px-4 py-3 text-sm text-ink outline-none transition-colors duration-200 ease-in-out focus:border-brand"
                type="text"
                value=${role}
                onInput=${(event) => setRole(event.target.value)}
                placeholder="Example: Graduate Engineer Trainee"
              />
            </label>
          </div>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Job Description</span>
            <textarea
              className="mt-2 min-h-[260px] w-full rounded-2xl border border-line bg-slate-50 px-4 py-4 text-sm leading-7 text-ink outline-none transition-colors duration-200 ease-in-out focus:border-brand"
              value=${jdText}
              onInput=${(event) => setJdText(event.target.value)}
              placeholder="Paste the full placement or fresher JD here."
            ></textarea>
          </label>
          <div className="flex flex-wrap gap-4">
            <button
              type="submit"
              className="inline-flex min-h-12 items-center justify-center rounded-xl bg-brand px-6 text-sm font-semibold text-white transition-colors duration-200 ease-in-out hover:bg-indigo-700"
            >
              Analyze JD
            </button>
            <span className="inline-flex items-center text-sm text-slate-500">
              Everything runs offline and is saved locally after analysis.
            </span>
          </div>
        </form>
      </${Card}>
    </section>
  `;
}

function AnalysisResults({ entry }) {
  if (!entry) {
    return html`
      <${Card}>
        <${CardHeader}
          eyebrow="No analysis"
          title="No results available yet"
          description="Analyze a job description from the Practice page or open an item from history."
        />
      </${Card}>
    `;
  }

  return html`
    <section className="space-y-6">
      <${Card}>
        <${CardHeader}
          eyebrow="Results"
          title=${entry.role || "Placement analysis"}
          description=${`${entry.company || "No company"} • ${formatDateTime(entry.createdAt)}`}
          action=${html`
            <div className="rounded-full border border-line bg-indigo-50 px-4 py-2 text-sm font-semibold text-brand">
              Readiness ${entry.readinessScore}/100
            </div>
          `}
        />
        <p className="max-w-4xl text-sm leading-7 text-slate-600">${entry.jdText.slice(0, 260)}${entry.jdText.length > 260 ? "..." : ""}</p>
      </${Card}>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <${Card}>
          <${CardHeader}
            eyebrow="Skills"
            title="Key skills extracted"
            description="Grouped heuristically from the provided job description."
          />
          <div className="space-y-5">
            ${Object.entries(entry.extractedSkills).map(
              ([category, skills]) => html`
                <div key=${category}>
                  <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">${category}</h4>
                  <div className="mt-3 flex flex-wrap gap-2">
                    ${skills.map((skill) => html`<${Tag} key=${skill}>${skill}</${Tag}>`)}
                  </div>
                </div>
              `,
            )}
          </div>
        </${Card}>

        <${Card}>
          <${CardHeader}
            eyebrow="Interview"
            title="10 likely interview questions"
            description="Questions are adapted from the stack and concepts detected in the JD."
          />
          <ol className="space-y-4">
            ${entry.questions.map(
              (question, index) => html`
                <li key=${question} className="rounded-2xl border border-line bg-slate-50 px-5 py-4 text-sm leading-7 text-slate-700">
                  <span className="mr-3 font-semibold text-brand">${index + 1}.</span>${question}
                </li>
              `,
            )}
          </ol>
        </${Card}>
      </div>

      <${Card}>
        <${CardHeader}
          eyebrow="Checklist"
          title="Round-wise preparation checklist"
          description="Use this as a structured prep run-up before the actual interview sequence."
        />
        <div className="grid gap-6 lg:grid-cols-2">
          ${entry.checklist.map(
            (round) => html`
              <section key=${round.title} className="rounded-2xl border border-line bg-slate-50 p-5">
                <h4 className="font-serif text-2xl text-ink">${round.title}</h4>
                <ul className="mt-4 space-y-3">
                  ${round.items.map(
                    (item) => html`
                      <li key=${item} className="flex gap-3 text-sm leading-7 text-slate-700">
                        <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-brand"></span>
                        <span>${item}</span>
                      </li>
                    `,
                  )}
                </ul>
              </section>
            `,
          )}
        </div>
      </${Card}>

      <${Card}>
        <${CardHeader}
          eyebrow="Plan"
          title="7-day preparation plan"
          description="A focused week-long sequence tailored to the detected skills and role direction."
        />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          ${entry.plan.map(
            ({ day, focus, details }) => html`
              <section key=${day} className="rounded-2xl border border-line bg-slate-50 p-5">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand">${day}</p>
                <h4 className="mt-3 font-serif text-2xl text-ink">${focus}</h4>
                <p className="mt-3 text-sm leading-7 text-slate-600">${details}</p>
              </section>
            `,
          )}
        </div>
      </${Card}>
    </section>
  `;
}

function ResultsPage({ entry }) {
  return html`
    <section className="space-y-6">
      <div className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand">Results</p>
        <h3 className="mt-3 font-serif text-4xl text-ink">Placement analysis results</h3>
        <p className="mt-3 text-base leading-8 text-slate-600">
          Review the extracted skills, generated checklists, 7-day plan, and role-specific interview questions.
        </p>
      </div>
      <${AnalysisResults} entry=${entry} />
    </section>
  `;
}

function HistoryPage({ history, onOpen }) {
  return html`
    <section className="space-y-6">
      <div className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand">History</p>
        <h3 className="mt-3 font-serif text-4xl text-ink">Analysis history</h3>
        <p className="mt-3 text-base leading-8 text-slate-600">
          Every analysis entry is stored locally and can be reopened on the Results page after refresh.
        </p>
      </div>

      ${
        history.length
          ? html`
              <div className="space-y-4">
                ${history.map(
                  (entry) => html`
                    <button
                      key=${entry.id}
                      type="button"
                      onClick=${() => onOpen(entry.id)}
                      className="w-full rounded-3xl border border-line bg-panel p-6 text-left shadow-panel transition-colors duration-200 ease-in-out hover:border-indigo-200 hover:bg-indigo-50/40"
                    >
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand">${formatDateTime(entry.createdAt)}</p>
                          <h4 className="mt-3 font-serif text-3xl text-ink">${entry.role || "Untitled role"}</h4>
                          <p className="mt-2 text-sm leading-7 text-slate-600">${entry.company || "No company provided"}</p>
                        </div>
                        <div className="rounded-full border border-line bg-indigo-50 px-4 py-2 text-sm font-semibold text-brand">
                          Score ${entry.readinessScore}/100
                        </div>
                      </div>
                    </button>
                  `,
                )}
              </div>
            `
          : html`
              <${Card}>
                <${CardHeader}
                  eyebrow="No history"
                  title="No saved analyses yet"
                  description="Analyze a job description from the Practice workspace to build your first offline history entry."
                />
              </${Card}>
            `
      }
    </section>
  `;
}

function GenericCollectionPage({ eyebrow, title, description, items }) {
  return html`
    <section className="space-y-6">
      <div className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand">${eyebrow}</p>
        <h3 className="mt-3 font-serif text-4xl text-ink">${title}</h3>
        <p className="mt-3 text-base leading-8 text-slate-600">${description}</p>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        ${items.map(
          ({ title: itemTitle, description: itemDescription }) => html`
            <${Card} key=${itemTitle}>
              <h4 className="font-serif text-2xl text-ink">${itemTitle}</h4>
              <p className="mt-3 text-sm leading-7 text-slate-600">${itemDescription}</p>
            </${Card}>
          `,
        )}
      </div>
    </section>
  `;
}

function App() {
  const [history, setHistory] = useState(loadHistory);
  const [selectedId, setSelectedId] = useState(loadSelectedId);

  const latestEntry = history[0] || null;
  const selectedEntry = useMemo(() => {
    if (!selectedId) {
      return latestEntry;
    }

    return history.find((entry) => entry.id === selectedId) || latestEntry;
  }, [history, latestEntry, selectedId]);

  const createAnalysis = ({ company, role, jdText }) => {
    const normalizedCompany = company.trim();
    const normalizedRole = role.trim();
    const normalizedJd = jdText.trim();
    const generated = analyzeJobDescription({
      company: normalizedCompany,
      role: normalizedRole,
      jdText: normalizedJd,
    });
    const entry = {
      id: `analysis-${Date.now()}`,
      createdAt: Date.now(),
      company: normalizedCompany,
      role: normalizedRole,
      jdText: normalizedJd,
      extractedSkills: generated.extractedSkills,
      plan: generated.plan,
      checklist: generated.checklist,
      questions: generated.questions,
      readinessScore: generated.readinessScore,
    };
    const nextHistory = [entry, ...history];

    setHistory(nextHistory);
    setSelectedId(entry.id);
    safeWriteJson(HISTORY_STORAGE_KEY, nextHistory);
    safeWriteJson(SELECTED_ANALYSIS_STORAGE_KEY, entry.id);

    return entry;
  };

  const openHistoryEntry = (id) => {
    setSelectedId(id);
    safeWriteJson(SELECTED_ANALYSIS_STORAGE_KEY, id);
    window.location.hash = "#/results";
  };

  return html`
    <${HashRouter}>
      <${Routes}>
        <${Route} path="/" element=${html`<${LandingPage} />`} />
        <${Route} element=${html`<${DashboardShell} />`}>
          <${Route}
            path="/dashboard"
            element=${html`<${DashboardPage} latestEntry=${latestEntry} historyCount=${history.length} />`}
          />
          <${Route}
            path="/practice"
            element=${html`<${PracticePage} onAnalyze=${createAnalysis} />`}
          />
          <${Route}
            path="/assessments"
            element=${html`
              <${GenericCollectionPage}
                eyebrow="Assessments"
                title="Assessment Center"
                description="Use this space to organize mock rounds, readiness drills, and timed evaluation workflows."
                items=${assessmentItems}
              />
            `}
          />
          <${Route}
            path="/resources"
            element=${html`<${HistoryPage} history=${history} onOpen=${openHistoryEntry} />`}
          />
          <${Route}
            path="/profile"
            element=${html`
              <${GenericCollectionPage}
                eyebrow="Profile"
                title="Candidate Profile"
                description="Keep your long-term placement preferences and personal preparation direction visible in one place."
                items=${profileItems}
              />
            `}
          />
          <${Route} path="/results" element=${html`<${ResultsPage} entry=${selectedEntry} />`} />
        </${Route}>
        <${Route} path="*" element=${html`<${Navigate} to="/" replace />`} />
      </${Routes}>
    </${HashRouter}>
  `;
}

createRoot(document.getElementById("root")).render(html`<${App} />`);
