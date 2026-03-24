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
    description: "Refine the job tracker setup in the next step. For now, these fields stay as UI placeholders.",
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
    description: "A premium daily summary will be added here once the digest workflow is introduced.",
    type: "empty",
    panelTitle: "Daily digest preview pending.",
    panelText: "This section is reserved for a concise 9AM job summary once the digest layer is built.",
  },
  "/proof": {
    eyebrow: "Proof",
    title: "Proof",
    description: "This area will collect artifacts, checkpoints, and execution evidence in the next step.",
    type: "basic",
  },
};

const storageKey = "job-notification-tracker-saved-jobs";
const allJobs = Array.isArray(window.JOB_DATA) ? window.JOB_DATA : [];
const routeView = document.querySelector("#routeView");
const modalRoot = document.querySelector("#modalRoot");
const navMenu = document.querySelector("#navMenu");
const navToggle = document.querySelector("#navToggle");
const navLinks = Array.from(document.querySelectorAll(".nav-link"));
const locationOptions = Array.from(new Set(allJobs.map((job) => job.location))).sort();
const savedJobs = new Set(loadSavedJobs());
const dashboardFilters = {
  keyword: "",
  location: "",
  mode: "",
  experience: "",
  source: "",
  sort: "Latest",
};

let activeModalJobId = null;

function loadSavedJobs() {
  try {
    const raw = window.localStorage.getItem(storageKey);
    const parsed = raw ? JSON.parse(raw) : [];

    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
}

function persistSavedJobs() {
  try {
    window.localStorage.setItem(storageKey, JSON.stringify(Array.from(savedJobs)));
  } catch (error) {
    return;
  }
}

function getRoute(pathname) {
  return routes[pathname] || null;
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

function getJobById(jobId) {
  return allJobs.find((job) => job.id === jobId) || null;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderOptions(options, label) {
  return [`<option value="">${label}</option>`]
    .concat(options.map((option) => `<option value="${escapeHtml(option)}">${escapeHtml(option)}</option>`))
    .join("");
}

function renderJobCard(job) {
  const saveLabel = savedJobs.has(job.id) ? "Saved" : "Save";
  const saveClass = savedJobs.has(job.id) ? "button button--saved" : "button button--secondary";

  return `
    <article class="job-card">
      <div class="job-card__header">
        <div>
          <p class="job-card__company">${escapeHtml(job.company)}</p>
          <h2 class="job-card__title">${escapeHtml(job.title)}</h2>
        </div>
        <div class="source-badge">${escapeHtml(job.source)}</div>
      </div>
      <div class="job-card__meta">
        <div class="meta-chip">${escapeHtml(job.location)} · ${escapeHtml(job.mode)}</div>
        <div class="meta-chip">${escapeHtml(job.experience)}</div>
        <div class="meta-chip">${escapeHtml(job.salaryRange)}</div>
        <div class="saved-pill">${escapeHtml(formatPostedDate(job.postedDaysAgo))}</div>
      </div>
      <div class="job-card__meta-secondary">
        ${job.skills
          .slice(0, 3)
          .map((skill) => `<span class="skill-chip">${escapeHtml(skill)}</span>`)
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

function getFilteredJobs() {
  const keyword = dashboardFilters.keyword.trim().toLowerCase();

  const filtered = allJobs.filter((job) => {
    const matchesKeyword =
      !keyword ||
      job.title.toLowerCase().includes(keyword) ||
      job.company.toLowerCase().includes(keyword);
    const matchesLocation = !dashboardFilters.location || job.location === dashboardFilters.location;
    const matchesMode = !dashboardFilters.mode || job.mode === dashboardFilters.mode;
    const matchesExperience =
      !dashboardFilters.experience || job.experience === dashboardFilters.experience;
    const matchesSource = !dashboardFilters.source || job.source === dashboardFilters.source;

    return matchesKeyword && matchesLocation && matchesMode && matchesExperience && matchesSource;
  });

  filtered.sort((left, right) => {
    if (dashboardFilters.sort === "Oldest") {
      return right.postedDaysAgo - left.postedDaysAgo;
    }

    if (dashboardFilters.sort === "Company") {
      return left.company.localeCompare(right.company);
    }

    return left.postedDaysAgo - right.postedDaysAgo;
  });

  return filtered;
}

function renderDashboardPage(route) {
  const jobs = getFilteredJobs();

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
              ${renderOptions(["Remote", "Hybrid", "Onsite"], "All modes")}
            </select>
          </div>
          <div class="field-group">
            <label class="field-label" for="experienceFilter">Experience</label>
            <select class="field-select" id="experienceFilter" data-filter="experience">
              ${renderOptions(["Fresher", "0-1", "1-3", "3-5"], "All experience")}
            </select>
          </div>
          <div class="field-group">
            <label class="field-label" for="sourceFilter">Source</label>
            <select class="field-select" id="sourceFilter" data-filter="source">
              ${renderOptions(["LinkedIn", "Naukri", "Indeed"], "All sources")}
            </select>
          </div>
          <div class="field-group">
            <label class="field-label" for="sortFilter">Sort</label>
            <select class="field-select" id="sortFilter" data-filter="sort">
              <option value="Latest">Latest</option>
              <option value="Oldest">Oldest</option>
              <option value="Company">Company</option>
            </select>
          </div>
        </div>
      </section>
      ${
        jobs.length
          ? `<section class="job-list">${jobs.map(renderJobCard).join("")}</section>`
          : `
            <section class="empty-results">
              <p>No jobs match your search.</p>
            </section>
          `
      }
    </section>
  `;
}

function renderSavedPage(route) {
  const jobs = allJobs.filter((job) => savedJobs.has(job.id));

  return `
    <section class="route-page route-page--saved">
      <p class="route-page__eyebrow">${escapeHtml(route.eyebrow)}</p>
      <h1 class="route-page__heading">${escapeHtml(route.title)}</h1>
      <p class="route-page__subtext">${escapeHtml(route.description)}</p>
      ${
        jobs.length
          ? `<section class="job-list">${jobs.map(renderJobCard).join("")}</section>`
          : `
            <section class="empty-panel">
              <h2 class="empty-panel__heading">No saved jobs yet.</h2>
              <p class="empty-panel__text">
                Save roles from the dashboard to create a quiet shortlist you can revisit later.
              </p>
            </section>
          `
      }
    </section>
  `;
}

function renderSettingsPage(route) {
  return `
    <section class="route-page route-page--settings">
      <p class="route-page__eyebrow">${escapeHtml(route.eyebrow)}</p>
      <h1 class="route-page__heading">${escapeHtml(route.title)}</h1>
      <p class="route-page__subtext">${escapeHtml(route.description)}</p>
      <form class="settings-form">
        <div class="field-group">
          <label class="field-label" for="roleKeywords">Role keywords</label>
          <input class="field-input" id="roleKeywords" type="text" placeholder="Product Designer, Frontend Engineer" />
        </div>
        <div class="field-group">
          <label class="field-label" for="preferredLocations">Preferred locations</label>
          <input class="field-input" id="preferredLocations" type="text" placeholder="Bengaluru, Remote, Pune" />
        </div>
        <div class="field-group">
          <label class="field-label" for="mode">Mode</label>
          <select class="field-select" id="mode">
            <option>Remote</option>
            <option>Hybrid</option>
            <option>Onsite</option>
          </select>
        </div>
        <div class="field-group">
          <label class="field-label" for="experienceLevel">Experience level</label>
          <input class="field-input" id="experienceLevel" type="text" placeholder="Fresher, 0-1, 1-3" />
        </div>
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

function syncFilterControls() {
  const filterMap = {
    keyword: "#keywordSearch",
    location: "#locationFilter",
    mode: "#modeFilter",
    experience: "#experienceFilter",
    source: "#sourceFilter",
    sort: "#sortFilter",
  };

  Object.entries(filterMap).forEach(([key, selector]) => {
    const element = document.querySelector(selector);

    if (element) {
      element.value = dashboardFilters[key];
    }
  });
}

function closeModal() {
  activeModalJobId = null;

  if (modalRoot) {
    modalRoot.innerHTML = "";
  }

  document.body.classList.remove("modal-open");
}

function openModal(jobId) {
  const job = getJobById(jobId);

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
          <button class="button button--secondary" type="button" data-action="dismiss-modal">Close</button>
        </div>
        <div class="modal-panel__meta">
          <div class="meta-chip">${escapeHtml(job.location)} · ${escapeHtml(job.mode)}</div>
          <div class="meta-chip">${escapeHtml(job.experience)}</div>
          <div class="meta-chip">${escapeHtml(job.salaryRange)}</div>
          <div class="source-badge">${escapeHtml(job.source)}</div>
        </div>
        <p class="modal-panel__description">${escapeHtml(job.description)}</p>
        <div class="skill-list">
          ${job.skills.map((skill) => `<span class="skill-chip">${escapeHtml(skill)}</span>`).join("")}
        </div>
        <div class="modal-panel__actions">
          <button class="button button--secondary" type="button" data-action="toggle-save" data-job-id="${job.id}">
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
  } else if (route.type === "dashboard") {
    routeView.innerHTML = renderDashboardPage(route);
    syncFilterControls();
  } else if (route.type === "saved") {
    routeView.innerHTML = renderSavedPage(route);
  } else if (route.type === "empty") {
    routeView.innerHTML = renderEmptyPage(route);
  } else {
    routeView.innerHTML = renderBasicPage(route);
  }

  setActiveLink(pathname);
}

function navigate(pathname) {
  const currentPath = window.location.pathname;

  if (pathname === currentPath) {
    closeMenu();
    return;
  }

  window.history.pushState({}, "", pathname);
  renderRoute(pathname);
  closeMenu();
}

function toggleSaveJob(jobId) {
  const shouldReopenModal = activeModalJobId === jobId;

  if (savedJobs.has(jobId)) {
    savedJobs.delete(jobId);
  } else {
    savedJobs.add(jobId);
  }

  persistSavedJobs();
  renderRoute(window.location.pathname);

  if (shouldReopenModal) {
    openModal(jobId);
  }
}

function handleFilterInput(target) {
  const filterKey = target.dataset.filter;

  if (!filterKey || !(filterKey in dashboardFilters)) {
    return;
  }

  dashboardFilters[filterKey] = target.value;
  renderRoute("/dashboard");
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
    const actionElement = event.target.closest("[data-action]");

    if (!actionElement) {
      return;
    }

    const action = actionElement.dataset.action;
    const jobId = actionElement.dataset.jobId;

    if (action === "start-tracking") {
      navigate("/settings");
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
    handleFilterInput(event.target);
  });

  routeView.addEventListener("change", (event) => {
    handleFilterInput(event.target);
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

    if (action === "close-modal" || action === "dismiss-modal") {
      closeModal();
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
