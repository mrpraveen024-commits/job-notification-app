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
            element=${html`
              <${PlaceholderPage}
                title="Dashboard"
                description="Overview cards, preparation streaks, and placement readiness metrics will live here."
              />
            `}
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
