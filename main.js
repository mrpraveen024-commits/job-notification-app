const routes = {
  "/": {
    eyebrow: "Landing",
    title: "Stop Missing The Right Jobs.",
    description: "Precision-matched job discovery delivered daily at 9AM.",
    type: "landing",
  },
  "/dashboard": {
    eyebrow: "Dashboard",
    title: "Daily Job Feed",
    description: "A clean view of recent roles across Indian tech teams, updated for focused review.",
    type: "dashboard",
  },
  "/settings": {
    eyebrow: "Settings",
    title: "Settings",
    description: "Define your preferences once and use them to activate deterministic matching across the dashboard.",
    type: "settings",
  },
  "/saved": {
    eyebrow: "Saved",
    title: "Saved Jobs",
    description: "Roles you choose to revisit are stored locally on this device.",
    type: "saved",
  },
  "/digest": {
    eyebrow: "Digest",
    title: "Digest",
    description: "A focused daily briefing built from your saved preferences and current match scoring.",
    type: "digest",
  },
  "/jt/07-test": {
    eyebrow: "Test",
    title: "Built-In Test Checklist",
    description: "Track manual validation before release and keep the shipping gate deterministic.",
    type: "test-checklist",
  },
  "/jt/08-ship": {
    eyebrow: "Ship",
    title: "Ship Gate",
    description: "Release stays locked until every required test is marked complete.",
    type: "ship-gate",
  },
  "/proof": {
    eyebrow: "Proof",
    title: "Proof",
    description: "This area will collect artifacts, checkpoints, and execution evidence in the next step.",
    type: "basic",
  },
};

const savedJobsStorageKey = "job-notification-tracker-saved-jobs";
const preferencesStorageKey = "jobTrackerPreferences";
const statusStorageKey = "jobTrackerStatus";
const statusUpdatesStorageKey = "jobTrackerStatusUpdates";
const testStatusStorageKey = "jobTrackerTestStatus";
const allJobs = Array.isArray(window.JOB_DATA) ? window.JOB_DATA : [];
const routeView = document.querySelector("#routeView");
const modalRoot = document.querySelector("#modalRoot");
const toastRoot = document.querySelector("#toastRoot");
const navMenu = document.querySelector("#navMenu");
const navToggle = document.querySelector("#navToggle");
const navLinks = Array.from(document.querySelectorAll(".nav-link"));
const locationOptions = Array.from(new Set(allJobs.map((job) => job.location))).sort();
const modeOptions = ["Remote", "Hybrid", "Onsite"];
const experienceOptions = ["Fresher", "0-1", "1-3", "3-5"];
const sourceOptions = ["LinkedIn", "Naukri", "Indeed"];
const defaultPreferences = {
  roleKeywords: "",
  preferredLocations: [],
  preferredMode: [],
  experienceLevel: "",
  skills: "",
  minMatchScore: 40,
};
const statusOptions = ["Not Applied", "Applied", "Rejected", "Selected"];
const checklistItems = [
  "Preferences persist after refresh",
  "Match score calculates correctly",
  "\"Show only matches\" toggle works",
  "Save job persists after refresh",
  "Apply opens in new tab",
  "Status update persists after refresh",
  "Status filter works correctly",
  "Digest generates top 10 by score",
  "Digest persists for the day",
  "No console errors on main pages",
];
const savedJobs = new Set(loadSavedJobs());
let jobStatuses = loadStatuses();
let testChecklistState = loadTestChecklistState();
const dashboardFilters = {
  keyword: "",
  location: "",
  mode: "",
  experience: "",
  source: "",
  status: "",
  sort: "Latest",
  showOnlyMatches: false,
};

let currentPreferences = loadPreferences();
let activeModalJobId = null;
let toastTimeoutId = null;

function getTodayDigestKey() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `jobTrackerDigest_${year}-${month}-${day}`;
}

function getTodayDigestDateLabel() {
  return new Date().toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function loadSavedJobs() {
  try {
    const raw = window.localStorage.getItem(savedJobsStorageKey);
    const parsed = raw ? JSON.parse(raw) : [];

    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
}

function loadStatuses() {
  try {
    const raw = window.localStorage.getItem(statusStorageKey);
    const parsed = raw ? JSON.parse(raw) : {};

    return parsed && typeof parsed === "object" ? parsed : {};
  } catch (error) {
    return {};
  }
}

function persistStatuses() {
  try {
    window.localStorage.setItem(statusStorageKey, JSON.stringify(jobStatuses));
  } catch (error) {
    return;
  }
}

function loadStatusUpdates() {
  try {
    const raw = window.localStorage.getItem(statusUpdatesStorageKey);
    const parsed = raw ? JSON.parse(raw) : [];

    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
}

function persistStatusUpdates(updates) {
  try {
    window.localStorage.setItem(statusUpdatesStorageKey, JSON.stringify(updates));
  } catch (error) {
    return;
  }
}

function loadTestChecklistState() {
  try {
    const raw = window.localStorage.getItem(testStatusStorageKey);
    const parsed = raw ? JSON.parse(raw) : {};

    if (!parsed || typeof parsed !== "object") {
      return {};
    }

    return checklistItems.reduce((accumulator, item) => {
      accumulator[item] = Boolean(parsed[item]);
      return accumulator;
    }, {});
  } catch (error) {
    return {};
  }
}

function persistTestChecklistState() {
  try {
    window.localStorage.setItem(testStatusStorageKey, JSON.stringify(testChecklistState));
  } catch (error) {
    return;
  }
}

function persistSavedJobs() {
  try {
    window.localStorage.setItem(savedJobsStorageKey, JSON.stringify(Array.from(savedJobs)));
  } catch (error) {
    return;
  }
}

function sanitizePreferences(raw) {
  const nextPreferences = {
    roleKeywords: typeof raw?.roleKeywords === "string" ? raw.roleKeywords : "",
    preferredLocations: Array.isArray(raw?.preferredLocations)
      ? raw.preferredLocations.filter((location) => locationOptions.includes(location))
      : [],
    preferredMode: Array.isArray(raw?.preferredMode)
      ? raw.preferredMode.filter((mode) => modeOptions.includes(mode))
      : [],
    experienceLevel: experienceOptions.includes(raw?.experienceLevel) ? raw.experienceLevel : "",
    skills: typeof raw?.skills === "string" ? raw.skills : "",
    minMatchScore: Number.isFinite(Number(raw?.minMatchScore))
      ? Math.max(0, Math.min(100, Number(raw.minMatchScore)))
      : defaultPreferences.minMatchScore,
  };

  return nextPreferences;
}

function loadPreferences() {
  try {
    const raw = window.localStorage.getItem(preferencesStorageKey);
    const parsed = raw ? JSON.parse(raw) : defaultPreferences;

    return sanitizePreferences(parsed);
  } catch (error) {
    return { ...defaultPreferences };
  }
}

function persistPreferences(preferences) {
  currentPreferences = sanitizePreferences(preferences);

  try {
    window.localStorage.setItem(preferencesStorageKey, JSON.stringify(currentPreferences));
  } catch (error) {
    return;
  }
}

function getRoute(pathname) {
  return routes[pathname] || null;
}

function getPassedTestCount() {
  return checklistItems.filter((item) => Boolean(testChecklistState[item])).length;
}

function areAllTestsPassed() {
  return getPassedTestCount() === checklistItems.length;
}

function setActiveLink(pathname) {
  navLinks.forEach((link) => {
    const isActive = link.dataset.route === pathname;
    link.classList.toggle("is-active", isActive);
    link.setAttribute("aria-current", isActive ? "page" : "false");
  });
}

function closeMenu() {
  if (!navMenu || !navToggle) {
    return;
  }

  navMenu.classList.remove("is-open");
  navToggle.setAttribute("aria-expanded", "false");
}

function formatPostedDate(postedDaysAgo) {
  if (postedDaysAgo === 0) {
    return "Today";
  }

  if (postedDaysAgo === 1) {
    return "1 day ago";
  }

  return `${postedDaysAgo} days ago`;
}

function formatStatusDate(timestamp) {
  return new Date(timestamp).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getJobById(jobId) {
  return allJobs.find((job) => job.id === jobId) || null;
}

function getJobStatus(jobId) {
  const status = jobStatuses[jobId];

  return statusOptions.includes(status) ? status : "Not Applied";
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function parseCommaSeparated(value) {
  return value
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
}

function hasPreferencesConfigured(preferences) {
  return Boolean(
    preferences.roleKeywords.trim() ||
      preferences.preferredLocations.length ||
      preferences.preferredMode.length ||
      preferences.experienceLevel ||
      preferences.skills.trim(),
  );
}

function extractSalaryValue(salaryRange) {
  const lpaMatches = salaryRange.match(/(\d+(?:\.\d+)?)\s*[–-]\s*(\d+(?:\.\d+)?)\s*LPA/i);

  if (lpaMatches) {
    return Number(lpaMatches[2]);
  }

  const monthlyMatches = salaryRange.match(/₹\s*(\d+)\s*k\s*[–-]\s*₹?\s*(\d+)\s*k\/month/i);

  if (monthlyMatches) {
    return (Number(monthlyMatches[2]) * 12) / 100;
  }

  const singleMatch = salaryRange.match(/(\d+(?:\.\d+)?)/);

  return singleMatch ? Number(singleMatch[1]) : 0;
}

function computeMatchScore(job, preferences) {
  const roleKeywords = parseCommaSeparated(preferences.roleKeywords);
  const preferredSkills = parseCommaSeparated(preferences.skills);
  const jobTitle = job.title.toLowerCase();
  const jobDescription = job.description.toLowerCase();
  const jobSkills = job.skills.map((skill) => skill.toLowerCase());
  let score = 0;

  if (roleKeywords.some((keyword) => jobTitle.includes(keyword))) {
    score += 25;
  }

  if (roleKeywords.some((keyword) => jobDescription.includes(keyword))) {
    score += 15;
  }

  if (preferences.preferredLocations.includes(job.location)) {
    score += 15;
  }

  if (preferences.preferredMode.includes(job.mode)) {
    score += 10;
  }

  if (preferences.experienceLevel && preferences.experienceLevel === job.experience) {
    score += 10;
  }

  if (preferredSkills.some((skill) => jobSkills.includes(skill))) {
    score += 15;
  }

  if (job.postedDaysAgo <= 2) {
    score += 5;
  }

  if (job.source === "LinkedIn") {
    score += 5;
  }

  return Math.min(100, score);
}

function getMatchTone(score) {
  if (score >= 80) {
    return "score-badge--strong";
  }

  if (score >= 60) {
    return "score-badge--warm";
  }

  if (score >= 40) {
    return "score-badge--neutral";
  }

  return "score-badge--soft";
}

function getScoredJobs() {
  return allJobs.map((job) => ({
    ...job,
    matchScore: computeMatchScore(job, currentPreferences),
    salaryValue: extractSalaryValue(job.salaryRange),
  }));
}

function getDashboardResults() {
  const keyword = dashboardFilters.keyword.trim().toLowerCase();
  const scoredJobs = getScoredJobs();

  const filteredJobs = scoredJobs.filter((job) => {
    const matchesKeyword =
      !keyword ||
      job.title.toLowerCase().includes(keyword) ||
      job.company.toLowerCase().includes(keyword);
    const matchesLocation = !dashboardFilters.location || job.location === dashboardFilters.location;
    const matchesMode = !dashboardFilters.mode || job.mode === dashboardFilters.mode;
    const matchesExperience =
      !dashboardFilters.experience || job.experience === dashboardFilters.experience;
    const matchesSource = !dashboardFilters.source || job.source === dashboardFilters.source;
    const matchesStatus = !dashboardFilters.status || getJobStatus(job.id) === dashboardFilters.status;
    const matchesThreshold =
      !dashboardFilters.showOnlyMatches || job.matchScore >= currentPreferences.minMatchScore;

    return (
      matchesKeyword &&
      matchesLocation &&
      matchesMode &&
      matchesExperience &&
      matchesSource &&
      matchesStatus &&
      matchesThreshold
    );
  });

  filteredJobs.sort((left, right) => {
    if (dashboardFilters.sort === "Match Score") {
      return right.matchScore - left.matchScore || left.postedDaysAgo - right.postedDaysAgo;
    }

    if (dashboardFilters.sort === "Salary") {
      return right.salaryValue - left.salaryValue || left.postedDaysAgo - right.postedDaysAgo;
    }

    return left.postedDaysAgo - right.postedDaysAgo;
  });

  return filteredJobs;
}

function getDigestJobs() {
  return getScoredJobs()
    .filter((job) => job.matchScore >= currentPreferences.minMatchScore)
    .sort((left, right) => {
      if (right.matchScore !== left.matchScore) {
        return right.matchScore - left.matchScore;
      }

      return left.postedDaysAgo - right.postedDaysAgo;
    })
    .slice(0, 10);
}

function loadDigestForToday() {
  try {
    const raw = window.localStorage.getItem(getTodayDigestKey());

    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    return null;
  }
}

function persistDigestForToday(jobs) {
  const payload = {
    date: getTodayDigestDateLabel(),
    generatedAt: Date.now(),
    jobs,
  };

  try {
    window.localStorage.setItem(getTodayDigestKey(), JSON.stringify(payload));
  } catch (error) {
    return payload;
  }

  return payload;
}

function getDigestContent() {
  const existingDigest = loadDigestForToday();

  if (existingDigest) {
    return existingDigest;
  }

  return null;
}

function formatDigestText(digest) {
  const header = `Top 10 Jobs For You - 9AM Digest\n${digest.date}\n`;
  const list = digest.jobs
    .map((job, index) => {
      return [
        `${index + 1}. ${job.title}`,
        `${job.company} | ${job.location} | ${job.experience}`,
        `Match Score: ${job.matchScore}%`,
        `Apply: ${job.applyUrl}`,
      ].join("\n");
    })
    .join("\n\n");

  return `${header}\n${list}\n\nThis digest was generated based on your preferences.`;
}

function renderOptions(options, label) {
  return [`<option value="">${label}</option>`]
    .concat(options.map((option) => `<option value="${escapeHtml(option)}">${escapeHtml(option)}</option>`))
    .join("");
}

function renderMultiSelectOptions(options, selectedValues) {
  return options
    .map((option) => {
      const selected = selectedValues.includes(option) ? " selected" : "";
      return `<option value="${escapeHtml(option)}"${selected}>${escapeHtml(option)}</option>`;
    })
    .join("");
}

function renderModeCheckboxes(selectedValues) {
  return modeOptions
    .map((mode) => {
      const checked = selectedValues.includes(mode) ? " checked" : "";

      return `
        <label class="checkbox-option">
          <input type="checkbox" name="preferredMode" value="${escapeHtml(mode)}"${checked} />
          <span>${escapeHtml(mode)}</span>
        </label>
      `;
    })
    .join("");
}

function renderJobCard(job) {
  const saveLabel = savedJobs.has(job.id) ? "Saved" : "Save";
  const saveClass = savedJobs.has(job.id) ? "button button--saved" : "button button--secondary";
  const status = getJobStatus(job.id);
  const statusTone = `status-pill--${status.toLowerCase().replace(/\s+/g, "-")}`;

  return `
    <article class="job-card" data-job-card="${job.id}">
      <div class="job-card__header">
        <div>
          <p class="job-card__company">${escapeHtml(job.company)}</p>
          <h2 class="job-card__title">${escapeHtml(job.title)}</h2>
        </div>
        <div class="job-card__badges">
          <div class="score-badge ${getMatchTone(job.matchScore)}">${job.matchScore}% match</div>
          <div class="source-badge">${escapeHtml(job.source)}</div>
        </div>
      </div>
      <div class="job-card__meta">
        <div class="meta-chip">${escapeHtml(job.location)} · ${escapeHtml(job.mode)}</div>
        <div class="meta-chip">${escapeHtml(job.experience)}</div>
        <div class="meta-chip">${escapeHtml(job.salaryRange)}</div>
        <div class="saved-pill">${escapeHtml(formatPostedDate(job.postedDaysAgo))}</div>
      </div>
      <div class="job-card__meta-secondary">
        <span class="status-pill ${statusTone}">${escapeHtml(status)}</span>
        ${job.skills
          .slice(0, 4)
          .map((skill) => `<span class="skill-chip">${escapeHtml(skill)}</span>`)
          .join("")}
      </div>
      <div class="status-group">
        ${statusOptions
          .map((option) => {
            const isActive = option === status ? " button--status-active" : "";

            return `
              <button
                class="button button--secondary button--compact${isActive}"
                type="button"
                data-action="set-status"
                data-job-id="${job.id}"
                data-status="${escapeHtml(option)}"
              >
                ${escapeHtml(option)}
              </button>
            `;
          })
          .join("")}
      </div>
      <div class="job-card__actions">
        <button class="button button--secondary" type="button" data-action="view-job" data-job-id="${job.id}">
          View
        </button>
        <button class="${saveClass}" type="button" data-action="toggle-save" data-job-id="${job.id}">
          ${saveLabel}
        </button>
        <button class="button button--primary" type="button" data-action="apply-job" data-job-id="${job.id}">
          Apply
        </button>
      </div>
    </article>
  `;
}

function renderDashboardPage(route) {
  return `
    <section class="route-page route-page--jobs">
      <p class="route-page__eyebrow">${escapeHtml(route.eyebrow)}</p>
      <h1 class="route-page__heading">${escapeHtml(route.title)}</h1>
      <p class="route-page__subtext">${escapeHtml(route.description)}</p>
      <section class="filter-bar">
        <div class="filter-grid">
          <div class="field-group">
            <label class="field-label" for="keywordSearch">Keyword search</label>
            <input
              class="field-input field-input--search"
              id="keywordSearch"
              type="text"
              value="${escapeHtml(dashboardFilters.keyword)}"
              placeholder="Search title or company"
              data-filter="keyword"
            />
          </div>
          <div class="field-group">
            <label class="field-label" for="locationFilter">Location</label>
            <select class="field-select" id="locationFilter" data-filter="location">
              ${renderOptions(locationOptions, "All locations")}
            </select>
          </div>
          <div class="field-group">
            <label class="field-label" for="modeFilter">Mode</label>
            <select class="field-select" id="modeFilter" data-filter="mode">
              ${renderOptions(modeOptions, "All modes")}
            </select>
          </div>
          <div class="field-group">
            <label class="field-label" for="experienceFilter">Experience</label>
            <select class="field-select" id="experienceFilter" data-filter="experience">
              ${renderOptions(experienceOptions, "All experience")}
            </select>
          </div>
          <div class="field-group">
            <label class="field-label" for="sourceFilter">Source</label>
            <select class="field-select" id="sourceFilter" data-filter="source">
              ${renderOptions(sourceOptions, "All sources")}
            </select>
          </div>
          <div class="field-group">
            <label class="field-label" for="statusFilter">Status</label>
            <select class="field-select" id="statusFilter" data-filter="status">
              ${renderOptions(statusOptions, "All statuses")}
            </select>
          </div>
          <div class="field-group">
            <label class="field-label" for="sortFilter">Sort</label>
            <select class="field-select" id="sortFilter" data-filter="sort">
              <option value="Latest">Latest</option>
              <option value="Match Score">Match Score</option>
              <option value="Salary">Salary</option>
            </select>
          </div>
        </div>
        <label class="toggle-row">
          <input
            class="toggle-row__input"
            id="showOnlyMatches"
            type="checkbox"
            data-filter="showOnlyMatches"
            ${dashboardFilters.showOnlyMatches ? "checked" : ""}
          />
          <span>Show only jobs above my threshold</span>
        </label>
      </section>
      <section id="dashboardBanner"></section>
      <section id="dashboardResults"></section>
    </section>
  `;
}

function renderSavedPage(route) {
  return `
    <section class="route-page route-page--saved">
      <p class="route-page__eyebrow">${escapeHtml(route.eyebrow)}</p>
      <h1 class="route-page__heading">${escapeHtml(route.title)}</h1>
      <p class="route-page__subtext">${escapeHtml(route.description)}</p>
      <section id="savedResults"></section>
    </section>
  `;
}

function renderDigestItem(job) {
  return `
    <article class="digest-item">
      <div class="digest-item__header">
        <div>
          <p class="job-card__company">${escapeHtml(job.company)}</p>
          <h2 class="digest-item__title">${escapeHtml(job.title)}</h2>
        </div>
        <div class="score-badge ${getMatchTone(job.matchScore)}">${job.matchScore}% match</div>
      </div>
      <div class="digest-item__meta">
        <div class="meta-chip">${escapeHtml(job.location)}</div>
        <div class="meta-chip">${escapeHtml(job.experience)}</div>
      </div>
      <div class="digest-item__actions">
        <button class="button button--primary" type="button" data-action="apply-job" data-job-id="${job.id}">
          Apply
        </button>
      </div>
    </article>
  `;
}

function renderRecentStatusUpdates() {
  const updates = loadStatusUpdates()
    .slice()
    .sort((left, right) => right.changedAt - left.changedAt)
    .slice(0, 8);

  if (!updates.length) {
    return `
      <section class="digest-updates">
        <h3 class="digest-updates__title">Recent Status Updates</h3>
        <p class="digest-note">No recent status changes yet.</p>
      </section>
    `;
  }

  return `
    <section class="digest-updates">
      <h3 class="digest-updates__title">Recent Status Updates</h3>
      <div class="digest-updates__list">
        ${updates
          .map((update) => {
            const job = getJobById(update.jobId);

            if (!job) {
              return "";
            }

            return `
              <article class="digest-update-item">
                <div>
                  <p class="job-card__company">${escapeHtml(job.company)}</p>
                  <h4 class="digest-update-item__title">${escapeHtml(job.title)}</h4>
                </div>
                <div class="digest-update-item__meta">
                  <span class="status-pill status-pill--${update.status.toLowerCase().replace(/\s+/g, "-")}">${escapeHtml(update.status)}</span>
                  <span class="meta-chip">${escapeHtml(formatStatusDate(update.changedAt))}</span>
                </div>
              </article>
            `;
          })
          .join("")}
      </div>
    </section>
  `;
}

function renderDigestPage(route) {
  return `
    <section class="route-page route-page--digest">
      <p class="route-page__eyebrow">${escapeHtml(route.eyebrow)}</p>
      <h1 class="route-page__heading">${escapeHtml(route.title)}</h1>
      <p class="route-page__subtext">${escapeHtml(route.description)}</p>
      <section id="digestRoot"></section>
    </section>
  `;
}

function renderTestChecklistPage(route) {
  const passedCount = getPassedTestCount();

  return `
    <section class="route-page route-page--test">
      <p class="route-page__eyebrow">${escapeHtml(route.eyebrow)}</p>
      <h1 class="route-page__heading">${escapeHtml(route.title)}</h1>
      <p class="route-page__subtext">${escapeHtml(route.description)}</p>
      <section class="test-summary">
        <h2 class="test-summary__title">Tests Passed: ${passedCount} / ${checklistItems.length}</h2>
        ${
          passedCount < checklistItems.length
            ? `<p class="test-summary__warning">Resolve all issues before shipping.</p>`
            : ""
        }
      </section>
      <section class="test-actions">
        <button class="button button--secondary" type="button" data-action="reset-test-status">
          Reset Test Status
        </button>
      </section>
      <section class="checklist">
        ${checklistItems
          .map((item) => {
            const checked = testChecklistState[item] ? " checked" : "";
            return `
              <label class="checklist-item" title="How to test">
                <input type="checkbox" data-action="toggle-test-item" data-test-item="${escapeHtml(item)}"${checked} />
                <span>${escapeHtml(item)}</span>
              </label>
            `;
          })
          .join("")}
      </section>
    </section>
  `;
}

function renderShipGatePage(route) {
  if (!areAllTestsPassed()) {
    return `
      <section class="route-page route-page--ship">
        <p class="route-page__eyebrow">${escapeHtml(route.eyebrow)}</p>
        <h1 class="route-page__heading">${escapeHtml(route.title)}</h1>
        <p class="route-page__subtext">Complete all tests before shipping.</p>
        <section class="empty-panel">
          <h2 class="empty-panel__heading">Complete all tests before shipping.</h2>
          <p class="empty-panel__text">
            Finish the checklist at <a class="inline-link" href="/jt/07-test" data-route="/jt/07-test">/jt/07-test</a> to unlock shipping.
          </p>
        </section>
      </section>
    `;
  }

  return `
    <section class="route-page route-page--ship">
      <p class="route-page__eyebrow">${escapeHtml(route.eyebrow)}</p>
      <h1 class="route-page__heading">${escapeHtml(route.title)}</h1>
      <p class="route-page__subtext">${escapeHtml(route.description)}</p>
      <section class="empty-panel">
        <h2 class="empty-panel__heading">Shipping unlocked.</h2>
        <p class="empty-panel__text">All checklist items are complete. The release gate is open.</p>
      </section>
    </section>
  `;
}

function renderSettingsPage(route) {
  return `
    <section class="route-page route-page--settings">
      <p class="route-page__eyebrow">${escapeHtml(route.eyebrow)}</p>
      <h1 class="route-page__heading">${escapeHtml(route.title)}</h1>
      <p class="route-page__subtext">${escapeHtml(route.description)}</p>
      <form class="settings-form" id="preferencesForm">
        <div class="field-group">
          <label class="field-label" for="roleKeywords">Role keywords</label>
          <input
            class="field-input"
            id="roleKeywords"
            name="roleKeywords"
            type="text"
            value="${escapeHtml(currentPreferences.roleKeywords)}"
            placeholder="React Developer, Backend, Analyst"
          />
        </div>
        <div class="field-group">
          <label class="field-label" for="preferredLocations">Preferred locations</label>
          <select
            class="field-select field-select--multiple"
            id="preferredLocations"
            name="preferredLocations"
            multiple
          >
            ${renderMultiSelectOptions(locationOptions, currentPreferences.preferredLocations)}
          </select>
        </div>
        <div class="field-group">
          <span class="field-label">Preferred mode</span>
          <div class="checkbox-group">
            ${renderModeCheckboxes(currentPreferences.preferredMode)}
          </div>
        </div>
        <div class="field-group">
          <label class="field-label" for="experienceLevel">Experience level</label>
          <select class="field-select" id="experienceLevel" name="experienceLevel">
            ${renderOptions(experienceOptions, "Any experience")}
          </select>
        </div>
        <div class="field-group">
          <label class="field-label" for="skills">Skills</label>
          <input
            class="field-input"
            id="skills"
            name="skills"
            type="text"
            value="${escapeHtml(currentPreferences.skills)}"
            placeholder="JavaScript, SQL, Spring Boot"
          />
        </div>
        <div class="field-group">
          <label class="field-label" for="minMatchScore">Minimum match score</label>
          <div class="slider-row">
            <input
              class="slider-input"
              id="minMatchScore"
              name="minMatchScore"
              type="range"
              min="0"
              max="100"
              step="1"
              value="${currentPreferences.minMatchScore}"
            />
            <div class="slider-value" id="minMatchScoreValue">${currentPreferences.minMatchScore}</div>
          </div>
        </div>
        <div class="settings-actions">
          <button class="button button--primary" type="submit">Save Preferences</button>
          <p class="settings-note">Preferences are stored locally in this browser.</p>
        </div>
        <p class="settings-feedback" id="preferencesFeedback" aria-live="polite"></p>
      </form>
    </section>
  `;
}

function renderEmptyPage(route) {
  return `
    <section class="route-page">
      <p class="route-page__eyebrow">${escapeHtml(route.eyebrow)}</p>
      <h1 class="route-page__heading">${escapeHtml(route.title)}</h1>
      <p class="route-page__subtext">${escapeHtml(route.description)}</p>
      <section class="empty-panel">
        <h2 class="empty-panel__heading">${escapeHtml(route.panelTitle)}</h2>
        <p class="empty-panel__text">${escapeHtml(route.panelText)}</p>
      </section>
    </section>
  `;
}

function renderBasicPage(route) {
  return `
    <section class="route-page">
      <p class="route-page__eyebrow">${escapeHtml(route.eyebrow)}</p>
      <h1 class="route-page__heading">${escapeHtml(route.title)}</h1>
      <p class="route-page__subtext">${escapeHtml(route.description)}</p>
    </section>
  `;
}

function renderLandingPage(route) {
  return `
    <section class="route-page route-page--landing">
      <p class="route-page__eyebrow">${escapeHtml(route.eyebrow)}</p>
      <h1 class="route-page__heading">${escapeHtml(route.title)}</h1>
      <p class="route-page__subtext">${escapeHtml(route.description)}</p>
      <div>
        <button class="button button--primary" type="button" data-action="start-tracking">
          Start Tracking
        </button>
      </div>
    </section>
  `;
}

function syncDashboardControls() {
  const filterMap = {
    keyword: "#keywordSearch",
    location: "#locationFilter",
    mode: "#modeFilter",
    experience: "#experienceFilter",
    source: "#sourceFilter",
    status: "#statusFilter",
    sort: "#sortFilter",
  };

  Object.entries(filterMap).forEach(([key, selector]) => {
    const element = document.querySelector(selector);

    if (element) {
      element.value = dashboardFilters[key];
    }
  });

  const showOnlyMatchesToggle = document.querySelector("#showOnlyMatches");

  if (showOnlyMatchesToggle) {
    showOnlyMatchesToggle.checked = dashboardFilters.showOnlyMatches;
  }
}

function syncSettingsControls() {
  const experienceSelect = document.querySelector("#experienceLevel");
  const thresholdValue = document.querySelector("#minMatchScoreValue");

  if (experienceSelect) {
    experienceSelect.value = currentPreferences.experienceLevel;
  }

  if (thresholdValue) {
    thresholdValue.textContent = String(currentPreferences.minMatchScore);
  }
}

function updateDashboardResults() {
  const bannerContainer = document.querySelector("#dashboardBanner");
  const resultsContainer = document.querySelector("#dashboardResults");

  if (!bannerContainer || !resultsContainer) {
    return;
  }

  const hasPreferences = hasPreferencesConfigured(currentPreferences);
  const jobs = getDashboardResults();

  bannerContainer.innerHTML = hasPreferences
    ? ""
    : `
      <section class="info-banner">
        <p>Set your preferences to activate intelligent matching.</p>
      </section>
    `;

  resultsContainer.innerHTML = jobs.length
    ? `<section class="job-list">${jobs.map(renderJobCard).join("")}</section>`
    : `
      <section class="empty-panel">
        <h2 class="empty-panel__heading">No roles match your criteria. Adjust filters or lower threshold.</h2>
        <p class="empty-panel__text">
          Review your filters, threshold, or saved preferences to widen the result set.
        </p>
      </section>
    `;
}

function updateSavedResults() {
  const savedContainer = document.querySelector("#savedResults");

  if (!savedContainer) {
    return;
  }

  const jobs = getScoredJobs().filter((job) => savedJobs.has(job.id));

  savedContainer.innerHTML = jobs.length
    ? `<section class="job-list">${jobs.map(renderJobCard).join("")}</section>`
    : `
      <section class="empty-panel">
        <h2 class="empty-panel__heading">No saved jobs yet.</h2>
        <p class="empty-panel__text">
          Save roles from the dashboard to create a quiet shortlist you can revisit later.
        </p>
      </section>
    `;
}

function updateDigestResults() {
  const digestRoot = document.querySelector("#digestRoot");

  if (!digestRoot) {
    return;
  }

  const hasPreferences = hasPreferencesConfigured(currentPreferences);

  if (!hasPreferences) {
    digestRoot.innerHTML = `
      <section class="digest-shell">
        <section class="empty-panel">
          <h2 class="empty-panel__heading">Set preferences to generate a personalized digest.</h2>
          <p class="empty-panel__text">Save your role, location, mode, experience, and skills preferences first.</p>
        </section>
        ${renderRecentStatusUpdates()}
      </section>
    `;
    return;
  }

  const digest = getDigestContent();

  if (!digest) {
    digestRoot.innerHTML = `
      <section class="digest-shell">
        <div class="digest-actions">
          <button class="button button--primary" type="button" data-action="generate-digest">
            Generate Today's 9AM Digest (Simulated)
          </button>
        </div>
        <p class="digest-note">Demo Mode: Daily 9AM trigger simulated manually.</p>
        ${renderRecentStatusUpdates()}
      </section>
    `;
    return;
  }

  digestRoot.innerHTML = `
    <section class="digest-shell">
      <div class="digest-actions">
        <button class="button button--primary" type="button" data-action="generate-digest">
          Generate Today's 9AM Digest (Simulated)
        </button>
        <button class="button button--secondary" type="button" data-action="copy-digest">
          Copy Digest to Clipboard
        </button>
        <button class="button button--secondary" type="button" data-action="email-digest">
          Create Email Draft
        </button>
      </div>
      <article class="digest-card">
        <header class="digest-card__header">
          <h2 class="digest-card__title">Top 10 Jobs For You — 9AM Digest</h2>
          <p class="digest-card__date">${escapeHtml(digest.date)}</p>
        </header>
        ${
          digest.jobs.length
            ? `<section class="digest-list">${digest.jobs.map(renderDigestItem).join("")}</section>`
            : `
              <section class="empty-panel">
                <h2 class="empty-panel__heading">No matching roles today. Check again tomorrow.</h2>
                <p class="empty-panel__text">Your preferences are active, but today’s digest has no qualifying roles.</p>
              </section>
            `
        }
        <footer class="digest-card__footer">
          <p>This digest was generated based on your preferences.</p>
        </footer>
      </article>
      ${renderRecentStatusUpdates()}
      <p class="digest-note">Demo Mode: Daily 9AM trigger simulated manually.</p>
    </section>
  `;
}

function updateSettingsFeedback(message) {
  const feedback = document.querySelector("#preferencesFeedback");

  if (feedback) {
    feedback.textContent = message;
  }
}

function showToast(message) {
  if (!toastRoot) {
    return;
  }

  if (toastTimeoutId) {
    window.clearTimeout(toastTimeoutId);
  }

  toastRoot.innerHTML = `<div class="toast">${escapeHtml(message)}</div>`;
  toastTimeoutId = window.setTimeout(() => {
    toastRoot.innerHTML = "";
    toastTimeoutId = null;
  }, 2200);
}

function closeModal() {
  activeModalJobId = null;

  if (modalRoot) {
    modalRoot.innerHTML = "";
  }

  document.body.classList.remove("modal-open");
}

function openModal(jobId) {
  const job = getScoredJobs().find((item) => item.id === jobId);

  if (!job || !modalRoot) {
    return;
  }

  activeModalJobId = jobId;
  modalRoot.innerHTML = `
    <div class="modal-backdrop">
      <section class="modal-panel" role="dialog" aria-modal="true" aria-labelledby="jobModalTitle">
        <div class="job-card__header">
          <div>
            <p class="job-card__company">${escapeHtml(job.company)}</p>
            <h2 class="modal-panel__title" id="jobModalTitle">${escapeHtml(job.title)}</h2>
          </div>
          <div class="job-card__badges">
            <div class="score-badge ${getMatchTone(job.matchScore)}">${job.matchScore}% match</div>
            <button class="button button--secondary" type="button" data-action="dismiss-modal">Close</button>
          </div>
        </div>
        <div class="modal-panel__meta">
          <div class="meta-chip">${escapeHtml(job.location)} · ${escapeHtml(job.mode)}</div>
          <div class="meta-chip">${escapeHtml(job.experience)}</div>
          <div class="meta-chip">${escapeHtml(job.salaryRange)}</div>
          <div class="source-badge">${escapeHtml(job.source)}</div>
          <div class="saved-pill">${escapeHtml(formatPostedDate(job.postedDaysAgo))}</div>
        </div>
        <p class="modal-panel__description">${escapeHtml(job.description)}</p>
        <div class="skill-list">
          ${job.skills.map((skill) => `<span class="skill-chip">${escapeHtml(skill)}</span>`).join("")}
        </div>
        <div class="modal-panel__actions">
          <button class="${savedJobs.has(job.id) ? "button button--saved" : "button button--secondary"}" type="button" data-action="toggle-save" data-job-id="${job.id}">
            ${savedJobs.has(job.id) ? "Saved" : "Save"}
          </button>
          <button class="button button--primary" type="button" data-action="apply-job" data-job-id="${job.id}">
            Apply
          </button>
        </div>
      </section>
    </div>
  `;
  document.body.classList.add("modal-open");
}

function renderNotFound() {
  if (!routeView) {
    return;
  }

  routeView.innerHTML = `
    <section class="route-page">
      <p class="route-page__eyebrow">404</p>
      <h1 class="route-page__heading">Page Not Found</h1>
      <p class="route-page__subtext">The page you are looking for does not exist.</p>
    </section>
  `;
  setActiveLink("");
}

function renderRoute(pathname) {
  const route = getRoute(pathname);

  closeModal();

  if (!routeView) {
    return;
  }

  if (!route) {
    renderNotFound();
    return;
  }

  if (route.type === "landing") {
    routeView.innerHTML = renderLandingPage(route);
  } else if (route.type === "settings") {
    routeView.innerHTML = renderSettingsPage(route);
    syncSettingsControls();
  } else if (route.type === "dashboard") {
    routeView.innerHTML = renderDashboardPage(route);
    syncDashboardControls();
    updateDashboardResults();
  } else if (route.type === "saved") {
    routeView.innerHTML = renderSavedPage(route);
    updateSavedResults();
  } else if (route.type === "digest") {
    routeView.innerHTML = renderDigestPage(route);
    updateDigestResults();
  } else if (route.type === "test-checklist") {
    routeView.innerHTML = renderTestChecklistPage(route);
  } else if (route.type === "ship-gate") {
    routeView.innerHTML = renderShipGatePage(route);
  } else if (route.type === "empty") {
    routeView.innerHTML = renderEmptyPage(route);
  } else {
    routeView.innerHTML = renderBasicPage(route);
  }

  setActiveLink(pathname);
}

function navigate(pathname) {
  const currentPath = window.location.pathname;

  if (pathname === "/jt/08-ship" && !areAllTestsPassed()) {
    window.history.pushState({}, "", pathname);
    renderRoute(pathname);
    closeMenu();
    return;
  }

  if (pathname === currentPath) {
    closeMenu();
    return;
  }

  window.history.pushState({}, "", pathname);
  renderRoute(pathname);
  closeMenu();
}

function refreshCurrentRoute() {
  const currentPath = window.location.pathname;

  if (currentPath === "/dashboard") {
    updateDashboardResults();
  } else if (currentPath === "/saved") {
    updateSavedResults();
  } else if (currentPath === "/digest") {
    updateDigestResults();
  } else if (currentPath === "/jt/07-test" || currentPath === "/jt/08-ship") {
    renderRoute(currentPath);
  } else {
    renderRoute(currentPath);
  }
}

function toggleSaveJob(jobId) {
  const shouldReopenModal = activeModalJobId === jobId;

  if (savedJobs.has(jobId)) {
    savedJobs.delete(jobId);
  } else {
    savedJobs.add(jobId);
  }

  persistSavedJobs();
  refreshCurrentRoute();

  if (shouldReopenModal) {
    openModal(jobId);
  }
}

function updateJobStatus(jobId, status) {
  const nextStatus = statusOptions.includes(status) ? status : "Not Applied";

  jobStatuses = {
    ...jobStatuses,
    [jobId]: nextStatus,
  };
  persistStatuses();

  const updates = loadStatusUpdates()
    .filter((update) => update.jobId !== jobId)
    .concat({
      jobId,
      status: nextStatus,
      changedAt: Date.now(),
    });

  persistStatusUpdates(updates);
  refreshCurrentRoute();

  if (activeModalJobId === jobId) {
    openModal(jobId);
  }

  if (nextStatus !== "Not Applied") {
    showToast(`Status updated: ${nextStatus}`);
  }
}

function handleFilterInput(target) {
  const filterKey = target.dataset.filter;

  if (!filterKey || !(filterKey in dashboardFilters)) {
    return;
  }

  dashboardFilters[filterKey] =
    filterKey === "showOnlyMatches" ? Boolean(target.checked) : target.value;

  if (window.location.pathname === "/dashboard") {
    updateDashboardResults();
  }
}

function toggleChecklistItem(item) {
  testChecklistState = {
    ...testChecklistState,
    [item]: !Boolean(testChecklistState[item]),
  };
  persistTestChecklistState();
  refreshCurrentRoute();
}

function resetChecklistState() {
  testChecklistState = {};

  try {
    window.localStorage.removeItem(testStatusStorageKey);
  } catch (error) {
    persistTestChecklistState();
  }

  refreshCurrentRoute();
}

function collectPreferences(form) {
  const formData = new window.FormData(form);
  const preferredLocations = Array.from(form.querySelector("#preferredLocations").selectedOptions).map(
    (option) => option.value,
  );
  const preferredMode = formData.getAll("preferredMode");

  return sanitizePreferences({
    roleKeywords: formData.get("roleKeywords") || "",
    preferredLocations,
    preferredMode,
    experienceLevel: formData.get("experienceLevel") || "",
    skills: formData.get("skills") || "",
    minMatchScore: formData.get("minMatchScore") || defaultPreferences.minMatchScore,
  });
}

navLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    navigate(link.dataset.route || "/");
  });
});

if (navToggle && navMenu) {
  navToggle.addEventListener("click", () => {
    const isOpen = navMenu.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });
}

if (routeView) {
  routeView.addEventListener("click", (event) => {
    const routeLink = event.target.closest("[data-route]");

    if (routeLink && !routeLink.dataset.action) {
      event.preventDefault();
      navigate(routeLink.dataset.route || "/");
      return;
    }

    const actionElement = event.target.closest("[data-action]");

    if (!actionElement) {
      return;
    }

    const action = actionElement.dataset.action;
    const jobId = actionElement.dataset.jobId;

    if (action === "start-tracking") {
      navigate("/settings");
    } else if (action === "toggle-test-item") {
      toggleChecklistItem(actionElement.dataset.testItem || "");
    } else if (action === "reset-test-status") {
      resetChecklistState();
    } else if (action === "set-status" && jobId) {
      updateJobStatus(jobId, actionElement.dataset.status || "Not Applied");
    } else if (action === "generate-digest") {
      const existingDigest = loadDigestForToday();

      if (existingDigest) {
        updateDigestResults();
        return;
      }

      const digestJobs = getDigestJobs();
      persistDigestForToday(digestJobs);
      updateDigestResults();
    } else if (action === "copy-digest") {
      const digest = loadDigestForToday();

      if (!digest) {
        return;
      }

      const text = formatDigestText(digest);

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).catch(() => {});
      }
    } else if (action === "email-digest") {
      const digest = loadDigestForToday();

      if (!digest) {
        return;
      }

      const subject = encodeURIComponent("My 9AM Job Digest");
      const body = encodeURIComponent(formatDigestText(digest));
      window.location.href = `mailto:?subject=${subject}&body=${body}`;
    } else if (action === "view-job" && jobId) {
      openModal(jobId);
    } else if (action === "toggle-save" && jobId) {
      toggleSaveJob(jobId);
    } else if (action === "apply-job" && jobId) {
      const job = getJobById(jobId);

      if (job) {
        window.open(job.applyUrl, "_blank", "noopener");
      }
    }
  });

  routeView.addEventListener("input", (event) => {
    const target = event.target;

    if (!(target instanceof HTMLElement)) {
      return;
    }

    if (target.matches("[data-filter]")) {
      handleFilterInput(target);
    }

    if (target.id === "minMatchScore") {
      const sliderValue = document.querySelector("#minMatchScoreValue");

      if (sliderValue) {
        sliderValue.textContent = target.value;
      }
    }
  });

  routeView.addEventListener("change", (event) => {
    const target = event.target;

    if (!(target instanceof HTMLElement)) {
      return;
    }

    if (target.matches("[data-filter]")) {
      handleFilterInput(target);
    }
  });

  routeView.addEventListener("submit", (event) => {
    const form = event.target;

    if (!(form instanceof HTMLFormElement) || form.id !== "preferencesForm") {
      return;
    }

    event.preventDefault();
    persistPreferences(collectPreferences(form));
    updateSettingsFeedback("Preferences saved.");
  });
}

if (modalRoot) {
  modalRoot.addEventListener("click", (event) => {
    if (event.target.classList.contains("modal-backdrop")) {
      closeModal();
      return;
    }

    const actionElement = event.target.closest("[data-action]");

    if (!actionElement) {
      return;
    }

    const action = actionElement.dataset.action;
    const jobId = actionElement.dataset.jobId;

    if (action === "dismiss-modal") {
      closeModal();
    } else if (action === "set-status" && jobId) {
      updateJobStatus(jobId, actionElement.dataset.status || "Not Applied");
    } else if (action === "toggle-save" && jobId) {
      toggleSaveJob(jobId);
    } else if (action === "apply-job" && jobId) {
      const job = getJobById(jobId);

      if (job) {
        window.open(job.applyUrl, "_blank", "noopener");
      }
    }
  });
}

window.addEventListener("popstate", () => {
  renderRoute(window.location.pathname);
  closeMenu();
});

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeModal();
  }
});

renderRoute(window.location.pathname);
