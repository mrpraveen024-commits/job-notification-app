const routes = {
  "/": {
    eyebrow: "Landing",
    title: "Stop Missing The Right Jobs.",
    description: "Precision-matched job discovery delivered daily at 9AM.",
    type: "landing",
  },
  "/dashboard": {
    eyebrow: "Dashboard",
    title: "Dashboard",
    description: "This section will be built in the next step.",
    type: "empty",
    panelTitle: "No jobs yet.",
    panelText: "In the next step, you will load a realistic dataset.",
  },
  "/settings": {
    eyebrow: "Settings",
    title: "Settings",
    description: "This section will be built in the next step.",
    type: "settings",
  },
  "/saved": {
    eyebrow: "Saved",
    title: "Saved",
    description: "This section will be built in the next step.",
    type: "empty",
    panelTitle: "No saved jobs yet.",
    panelText: "Saved roles will appear here once you begin reviewing curated matches.",
  },
  "/digest": {
    eyebrow: "Digest",
    title: "Digest",
    description: "This section will be built in the next step.",
    type: "empty",
    panelTitle: "Daily digest preview pending.",
    panelText: "This section will surface a calm daily summary once the digest workflow is introduced.",
  },
  "/proof": {
    eyebrow: "Proof",
    title: "Proof",
    description: "This section will be built in the next step.",
    type: "basic",
  },
};

const routeView = document.querySelector("#routeView");
const navMenu = document.querySelector("#navMenu");
const navToggle = document.querySelector("#navToggle");
const navLinks = Array.from(document.querySelectorAll(".nav-link"));

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

  if (!routeView) {
    return;
  }

  if (!route) {
    renderNotFound();
    return;
  }

  if (route.type === "landing") {
    routeView.innerHTML = `
      <section class="route-page route-page--landing">
        <p class="route-page__eyebrow">${route.eyebrow}</p>
        <h1 class="route-page__heading">${route.title}</h1>
        <p class="route-page__subtext">${route.description}</p>
        <div>
          <button class="button button--primary" type="button" id="startTracking">
            Start Tracking
          </button>
        </div>
      </section>
    `;
  } else if (route.type === "settings") {
    routeView.innerHTML = `
      <section class="route-page route-page--settings">
        <p class="route-page__eyebrow">${route.eyebrow}</p>
        <h1 class="route-page__heading">${route.title}</h1>
        <p class="route-page__subtext">${route.description}</p>
        <form class="settings-form">
          <div class="field-group">
            <label class="field-label" for="roleKeywords">Role keywords</label>
            <input class="field-input" id="roleKeywords" type="text" placeholder="Product Designer, Frontend Engineer" />
          </div>
          <div class="field-group">
            <label class="field-label" for="preferredLocations">Preferred locations</label>
            <input class="field-input" id="preferredLocations" type="text" placeholder="Bengaluru, Remote, London" />
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
            <input class="field-input" id="experienceLevel" type="text" placeholder="Mid-level, Senior, Staff" />
          </div>
        </form>
      </section>
    `;
  } else if (route.type === "empty") {
    routeView.innerHTML = `
      <section class="route-page">
        <p class="route-page__eyebrow">${route.eyebrow}</p>
        <h1 class="route-page__heading">${route.title}</h1>
        <p class="route-page__subtext">${route.description}</p>
        <section class="empty-panel">
          <h2 class="empty-panel__heading">${route.panelTitle}</h2>
          <p class="empty-panel__text">${route.panelText}</p>
        </section>
      </section>
    `;
  } else {
    routeView.innerHTML = `
      <section class="route-page">
        <p class="route-page__eyebrow">${route.eyebrow}</p>
        <h1 class="route-page__heading">${route.title}</h1>
        <p class="route-page__subtext">${route.description}</p>
      </section>
    `;
  }

  setActiveLink(pathname);

  const startTrackingButton = document.querySelector("#startTracking");

  if (startTrackingButton) {
    startTrackingButton.addEventListener("click", () => {
      navigate("/settings");
    });
  }
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

window.addEventListener("popstate", () => {
  renderRoute(window.location.pathname);
  closeMenu();
});

renderRoute(window.location.pathname);
