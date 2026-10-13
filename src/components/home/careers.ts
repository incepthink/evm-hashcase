/**
 * Careers copy: open roles and the general application.
 * Add, remove or edit a role here — the list, filters, counts and job pages follow.
 */

export type Department = "Engineering" | "Delivery" | "Growth";

export type Role = {
  slug: string;
  title: string;
  dept: Department;
  location: "Mumbai" | "Remote (India)";
  /** Shown next to the location, e.g. "On-site" or "Hybrid". */
  mode: string;
  type: "Full-time" | "Internship";
  /** Shown as a chip in the job header when set. */
  compensation?: string;
  blurb: string;
  intro: string;
  doList: string[];
  fitList: string[];
  /** Soft tint behind the job header and its dot pattern. */
  bg: string;
  dots: string;
};

export const DEPARTMENTS: { name: Department; color: string }[] = [
  { name: "Engineering", color: "#1A6DFF" },
  { name: "Delivery", color: "#E2A72E" },
  { name: "Growth", color: "#D03A6F" },
];

export const ROLES: Role[] = [
  {
    slug: "ai-engineer-llm-systems",
    title: "AI Engineer — LLM Systems",
    dept: "Engineering",
    location: "Mumbai",
    mode: "On-site",
    type: "Full-time",
    blurb: "Self-hosted models, RAG and structured outputs in production.",
    intro:
      "You will design and ship the AI core of systems our clients run inside their own infrastructure — from model evaluation to the pipelines that make outputs reliable.",
    doList: [
      "Benchmark open and proprietary models on client data for quality, latency and cost",
      "Serve models on vLLM and build RAG over pgvector",
      "Enforce structured, validated outputs (Zod / JSON schema) for downstream systems",
      "Build evaluation harnesses that catch regressions before clients do",
    ],
    fitList: [
      "You have shipped an LLM-powered system real users depend on",
      "You are comfortable with Python and TypeScript",
      "You care about evals more than demos",
    ],
    bg: "#EEF4FF",
    dots: "#9EC0FF",
  },
  {
    slug: "full-stack-engineer",
    title: "Full-Stack Engineer",
    dept: "Engineering",
    location: "Mumbai",
    mode: "On-site",
    type: "Full-time",
    blurb: "Next.js front ends and APIs that make AI usable for officers and analysts.",
    intro:
      "You will build the product surfaces around our AI systems — review screens, dashboards and workflows used daily by government staff and enterprise teams.",
    doList: [
      "Build Next.js apps and APIs (Node / FastAPI) end to end",
      "Design review and human-in-the-loop screens for AI output",
      "Work with Postgres, queues and background workers",
      "Ship Marathi- and Indian-language-ready interfaces",
    ],
    fitList: [
      "Strong React / Next.js and TypeScript",
      "You have owned features from schema to UI",
      "You like making complex workflows feel simple",
    ],
    bg: "#F1ECFF",
    dots: "#B9A5F7",
  },
  {
    slug: "forward-deployed-ai-engineer",
    title: "Forward Deployed AI Engineer",
    dept: "Delivery",
    location: "Mumbai",
    mode: "Hybrid",
    type: "Full-time",
    blurb: "Sit with the client, scope the use case, deploy inside their walls.",
    intro:
      "You are the bridge between a department’s real problem and a working system — scoping use cases, deploying on-prem and making sure it actually gets used.",
    doList: [
      "Run use-case discovery with client teams",
      "Deploy and operate systems on-prem, in VPCs or air-gapped",
      "Turn field feedback into product and model improvements",
      "Own client success after go-live",
    ],
    fitList: [
      "Engineering background with strong communication",
      "Comfortable with Docker, Linux and GPU servers",
      "Enjoy working with government and enterprise stakeholders",
    ],
    bg: "#E8F6EF",
    dots: "#8FD3B2",
  },
  {
    slug: "business-development-government-enterprise",
    title: "Business Development — Government & Enterprise",
    dept: "Growth",
    location: "Mumbai",
    mode: "Hybrid",
    type: "Full-time",
    blurb: "Open doors with departments, banks and enterprises.",
    intro:
      "You will build HashCase’s pipeline across government departments and large enterprises, shaping proposals that turn into deployed systems.",
    doList: [
      "Identify and qualify government and enterprise opportunities",
      "Lead proposals and pitch decks with the delivery team",
      "Manage relationships through procurement and pilots",
      "Feed market insight back into the roadmap",
    ],
    fitList: [
      "Experience selling technology to government or enterprise",
      "You can explain AI plainly and credibly",
      "Strong writing for proposals",
    ],
    bg: "#FFF1E8",
    dots: "#F3B08C",
  },
];

/** "Don't see your role?" — same application form, no role overview. */
export const GENERAL_APPLICATION = {
  slug: "general",
  title: "General application",
  intro:
    "Don’t see your role? Send us what you’ve shipped. We read every note.",
  bg: "#F2F2EF",
  dots: "#C9CBD3",
} as const;

export const CAREERS_PERKS = [
  { label: "Ownership from day one", bg: "#DDF3E6", ink: "#0B3F2A" },
  { label: "Self-hosted LLMs in production", bg: "#FCEFC2", ink: "#3D2900" },
  { label: "Government-scale problems", bg: "#FBDDE6", ink: "#5A0F2C" },
] as const;

/** Resumes above this are rejected client- and server-side (Vercel caps request bodies at 4.5 MB). */
export const RESUME_MAX_BYTES = 4 * 1024 * 1024;
export const RESUME_ACCEPT = ".pdf,.doc,.docx";

export const roleLocation = (r: Role) => `${r.location} · ${r.mode}`;

export const getRole = (slug: string) => ROLES.find((r) => r.slug === slug);
