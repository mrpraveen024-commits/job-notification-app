const routes = {
  "/": {
    eyebrow: "Home",
    title: "Home",
    description: "This section will be built in the next step.",
  },
  "/dashboard": {
    eyebrow: "Dashboard",
    title: "Dashboard",
    description: "This section will be built in the next step.",
  },
  "/settings": {
    eyebrow: "Settings",
    title: "Settings",
    description: "This section will be built in the next step.",
  },
  "/saved": {
    eyebrow: "Saved",
    title: "Saved",
    description: "This section will be built in the next step.",
  },
  "/digest": {
    eyebrow: "Digest",
    title: "Digest",
    description: "This section will be built in the next step.",
  },
  "/proof": {
    eyebrow: "Proof",
    title: "Proof",
    description: "This section will be built in the next step.",
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

  routeView.innerHTML = `
    <section class="route-page">
      <p class="route-page__eyebrow">${route.eyebrow}</p>
      <h1 class="route-page__heading">${route.title}</h1>
      <p class="route-page__subtext">${route.description}</p>
    </section>
  `;

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
