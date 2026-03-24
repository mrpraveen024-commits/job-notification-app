const companies = [
  "Infosys",
  "TCS",
  "Wipro",
  "Accenture",
  "Capgemini",
  "Cognizant",
  "IBM",
  "Oracle",
  "Amazon",
  "Flipkart",
  "Zoho",
  "Freshworks",
  "Juspay",
  "ByteBloom Labs",
  "OrbitPe",
];

const locations = [
  "Bengaluru",
  "Hyderabad",
  "Pune",
  "Chennai",
  "Gurugram",
  "Noida",
  "Mumbai",
  "Delhi NCR",
  "Kochi",
  "Coimbatore",
  "Ahmedabad",
  "Remote - India",
];

const sources = ["LinkedIn", "Naukri", "Indeed"];

const roleTemplates = [
  {
    title: "SDE Intern",
    experience: "Fresher",
    salaryRange: "₹15k–₹40k/month Internship",
    skills: ["Java", "DSA", "Git"],
    team: "platform engineering",
    focus: "developer tooling and onboarding flows",
    outcome: "small backend services and internal dashboards",
  },
  {
    title: "Graduate Engineer Trainee",
    experience: "Fresher",
    salaryRange: "3–5 LPA",
    skills: ["Java", "SQL", "Linux"],
    team: "enterprise applications",
    focus: "business-critical delivery pipelines",
    outcome: "bug fixes, test coverage, and release support",
  },
  {
    title: "Junior Backend Developer",
    experience: "0-1",
    salaryRange: "3–5 LPA",
    skills: ["Node.js", "REST APIs", "PostgreSQL"],
    team: "backend services",
    focus: "APIs used by web and mobile teams",
    outcome: "reliable endpoints and operational improvements",
  },
  {
    title: "Frontend Intern",
    experience: "Fresher",
    salaryRange: "₹15k–₹40k/month Internship",
    skills: ["React", "JavaScript", "CSS"],
    team: "web experience",
    focus: "high-clarity customer journeys",
    outcome: "UI components and QA-ready handoffs",
  },
  {
    title: "QA Intern",
    experience: "Fresher",
    salaryRange: "₹15k–₹40k/month Internship",
    skills: ["Manual Testing", "Test Cases", "Jira"],
    team: "quality engineering",
    focus: "release confidence for weekly deployments",
    outcome: "test plans, regression passes, and defect reports",
  },
  {
    title: "Data Analyst Intern",
    experience: "Fresher",
    salaryRange: "₹15k–₹40k/month Internship",
    skills: ["Excel", "SQL", "Power BI"],
    team: "business intelligence",
    focus: "reporting and funnel analysis",
    outcome: "clean datasets and recurring dashboards",
  },
  {
    title: "Java Developer (0-1)",
    experience: "0-1",
    salaryRange: "3–5 LPA",
    skills: ["Java", "Spring Boot", "MySQL"],
    team: "core platform",
    focus: "internal services and integration points",
    outcome: "maintainable APIs and production fixes",
  },
  {
    title: "Python Developer (Fresher)",
    experience: "Fresher",
    salaryRange: "3–5 LPA",
    skills: ["Python", "FastAPI", "PostgreSQL"],
    team: "automation engineering",
    focus: "operational workflows and data utilities",
    outcome: "scripts, APIs, and automation jobs",
  },
  {
    title: "React Developer (1-3)",
    experience: "1-3",
    salaryRange: "6–10 LPA",
    skills: ["React", "TypeScript", "CSS"],
    team: "product UI",
    focus: "customer-facing workflows used daily",
    outcome: "responsive screens and reusable components",
  },
  {
    title: "Associate Software Engineer",
    experience: "1-3",
    salaryRange: "6–10 LPA",
    skills: ["Java", "JavaScript", "SQL"],
    team: "shared engineering",
    focus: "cross-functional delivery across services",
    outcome: "feature execution with code review discipline",
  },
  {
    title: "QA Automation Engineer",
    experience: "1-3",
    salaryRange: "6–10 LPA",
    skills: ["Selenium", "Java", "API Testing"],
    team: "automation quality",
    focus: "stable releases across multiple squads",
    outcome: "automation suites and release checks",
  },
  {
    title: "Data Engineer Analyst",
    experience: "1-3",
    salaryRange: "6–10 LPA",
    skills: ["Python", "SQL", "ETL"],
    team: "data platform",
    focus: "pipelines feeding product and operations teams",
    outcome: "validated jobs and monitoring improvements",
  },
  {
    title: "Backend Developer (3-5)",
    experience: "3-5",
    salaryRange: "10–18 LPA",
    skills: ["Java", "Microservices", "Kafka"],
    team: "transactions platform",
    focus: "high-volume backend flows",
    outcome: "service hardening and incident-free releases",
  },
];

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function makeApplyUrl(source, slug, id) {
  if (source === "LinkedIn") {
    return `https://www.linkedin.com/jobs/view/${slug}-${id}`;
  }

  if (source === "Naukri") {
    return `https://www.naukri.com/job-listings-${slug}-${id}`;
  }

  return `https://in.indeed.com/viewjob?jk=${id}`;
}

function makeDescription(company, job, location, mode) {
  return [
    `Join the ${company} ${job.team} team supporting ${job.focus} for teams based in ${location}.`,
    `You will work with ${job.skills.join(", ")} to deliver clear, production-ready output in a ${mode.toLowerCase()} setup.`,
    `The role suits ${job.experience.toLowerCase()} candidates who can write clean code, communicate progress, and respond well to structured feedback.`,
    `Expect mentoring, peer reviews, and ownership of ${job.outcome} as the team scales its engineering rhythm.`,
  ].join("\n");
}

const jobData = companies.flatMap((company, companyIndex) => {
  return [0, 1, 2, 3].map((slot) => {
    const template = roleTemplates[(companyIndex * 3 + slot) % roleTemplates.length];
    const location = locations[(companyIndex + slot * 2) % locations.length];
    const modeOptions = ["Remote", "Hybrid", "Onsite"];
    const mode = modeOptions[(companyIndex + slot) % modeOptions.length];
    const source = sources[(companyIndex + slot) % sources.length];
    const id = `job-${String(companyIndex * 4 + slot + 1).padStart(3, "0")}`;
    const slug = slugify(`${company} ${template.title} ${location}`);

    return {
      id,
      title: template.title,
      company,
      location,
      mode,
      experience: template.experience,
      skills: template.skills,
      source,
      postedDaysAgo: (companyIndex * 4 + slot) % 11,
      salaryRange: template.salaryRange,
      applyUrl: makeApplyUrl(source, slug, id),
      description: makeDescription(company, template, location, mode),
    };
  });
});

window.JOB_DATA = jobData;
