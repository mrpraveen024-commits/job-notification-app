import React from "https://esm.sh/react@18.3.1";
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

function Card({ className = "", children }) {
  return html`
    <section className=${`rounded-3xl border border-line bg-panel p-6 shadow-panel sm:p-8 ${className}`}>
      ${children}
    </section>
  `;
}

function CardHeader({ eyebrow, title, description }) {
  return html`
    <header className="mb-6">
      ${eyebrow
        ? html`<p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand">${eyebrow}</p>`
        : null}
      <h3 className="mt-3 font-serif text-3xl text-ink">${title}</h3>
      ${description ? html`<p className="mt-3 text-sm leading-7 text-slate-600">${description}</p>` : null}
    </header>
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
              stroke="hsl(245, 58%, 51%)"
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
              stroke="hsl(245, 58%, 51%)"
              fill="hsl(245, 58%, 51%)"
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
  const width = `${(completed / total) * 100}%`;

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
        <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-200">
          <div className="h-full rounded-full bg-brand transition-all duration-200 ease-in-out" style=${{ width }}></div>
        </div>
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
  const width = `${(solved / target) * 100}%`;

  return html`
    <${Card}>
      <${CardHeader}
        eyebrow="Consistency"
        title="Weekly Goals"
        description="A simple weekly target to keep preparation momentum visible and measurable."
      />
      <div>
        <p className="text-base font-medium text-ink">Problems Solved: ${solved}/${target} this week</p>
        <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-200">
          <div className="h-full rounded-full bg-brand transition-all duration-200 ease-in-out" style=${{ width }}></div>
        </div>
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

function DashboardPage() {
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

function PlaceholderPage({ title, description }) {
  return html`
    <section className="rounded-3xl border border-line bg-panel p-8 shadow-panel sm:p-10">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand">Workspace</p>
      <h3 className="mt-4 font-serif text-4xl text-ink">${title}</h3>
      <p className="mt-4 max-w-2xl text-base leading-8 text-slate-600">${description}</p>
    </section>
  `;
}

function App() {
  return html`
    <${HashRouter}>
      <${Routes}>
        <${Route} path="/" element=${html`<${LandingPage} />`} />
        <${Route} element=${html`<${DashboardShell} />`}>
          <${Route}
            path="/dashboard"
            element=${html`<${DashboardPage} />`}
          />
          <${Route}
            path="/practice"
            element=${html`
              <${PlaceholderPage}
                title="Practice"
                description="Coding question banks, topic drills, and company-specific problem sets will appear here."
              />
            `}
          />
          <${Route}
            path="/assessments"
            element=${html`
              <${PlaceholderPage}
                title="Assessments"
                description="Timed tests, mock rounds, and score reports will be available in this area."
              />
            `}
          />
          <${Route}
            path="/resources"
            element=${html`
              <${PlaceholderPage}
                title="Resources"
                description="Curated notes, interview playbooks, and revision material will be organized here."
              />
            `}
          />
          <${Route}
            path="/profile"
            element=${html`
              <${PlaceholderPage}
                title="Profile"
                description="Your preparation preferences, targets, and account information will be managed here."
              />
            `}
          />
        </${Route}>
        <${Route} path="*" element=${html`<${Navigate} to="/" replace />`} />
      </${Routes}>
    </${HashRouter}>
  `;
}

createRoot(document.getElementById("root")).render(html`<${App} />`);
