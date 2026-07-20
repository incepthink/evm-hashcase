/**
 * All landing-page copy and CTA targets live here.
 * Editing this file should never require touching JSX.
 */

export const BRAND = "HashCase";
export const TAGLINE = "B2B AI solutions";

/** Swap this one line to change every contact target on the page. */
export const CONTACT_EMAIL = "contact@hashcase.co";

const mailto = (subject: string, body: string) =>
  `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
    subject,
  )}&body=${encodeURIComponent(body)}`;

/** Replace with a Calendly URL when booking exists — no other file changes needed. */
export const DEMO_MAILTO = mailto(
  `Demo request — ${BRAND}`,
  `Hi ${BRAND} team,\n\nI'd like to see the stack in action.\n\nCompany:\nWhat we're trying to build:\nBest time to talk:\n\nThanks,`,
);

export const START_MAILTO = mailto(
  `Getting started — ${BRAND}`,
  `Hi ${BRAND} team,\n\nWe'd like to get started on the stack.\n\nCompany:\nWhat we want to automate:\nTools we already use:\n\nThanks,`,
);

export const NAV_LINKS = [
  { label: "The stack", href: "#stack" },
  { label: "What you can build", href: "#build" },
  { label: "How it works", href: "#how" },
  { label: "Contact", href: "#contact" },
] as const;

export const HERO = {
  eyebrow: "B2B AI Solutions",
  headlineLead: "We built the AI stack.",
  headlineAccent: "You build anything on it.",
  subhead:
    "Skip the from-scratch AI build. Our stack gives you agents, assistants, content engines, and automations out of the box — ready to plug into your business and make work easier.",
  primaryCta: "Book a demo",
  secondaryCta: "Get started",
} as const;

/** Capability keywords for the marquee strip — real substance, no invented logos. */
export const MARQUEE_ITEMS = [
  "Agents",
  "RAG",
  "Assistants",
  "Voice",
  "OCR",
  "Workflows",
  "Scheduling",
  "Content",
  "Research",
  "Integrations",
  "Dashboards",
  "Document Intelligence",
] as const;

export type StackItem = {
  icon: string;
  title: string;
  description: string;
};

export const STACK = {
  heading: "One stack. Every AI building block.",
  subheading:
    "The pieces are already built, tested, and running. Pick the ones you need.",
  items: [
    {
      icon: "Bot",
      title: "Agents",
      description: "Autonomous, multi-step task execution.",
    },
    {
      icon: "MessagesSquare",
      title: "Assistants",
      description: "Chat and voice, trained on your business.",
    },
    {
      icon: "PenLine",
      title: "Content Engine",
      description: "On-brand text and creative generation at scale.",
    },
    {
      icon: "FileSearch",
      title: "Document Intelligence",
      description: "Read, extract, and act on any document.",
    },
    {
      icon: "Database",
      title: "Knowledge (RAG)",
      description: "Grounded answers from your own data.",
    },
    {
      icon: "Workflow",
      title: "Automation",
      description: "Multi-app workflows that run themselves.",
    },
    {
      icon: "Plug",
      title: "Integrations",
      description: "Plug into the tools and data you already use.",
    },
    {
      icon: "LayoutDashboard",
      title: "Dashboards",
      description: "See and control everything the AI does.",
    },
  ] satisfies StackItem[],
} as const;

export type BuildItem = {
  icon: string;
  title: string;
  description: string;
  /** Already built and running — shows a quiet "Live" badge. */
  live?: boolean;
  /** Renders as a large bento tile (bigger icon, roomier padding). */
  featured?: boolean;
  /** Column span on the 6-col desktop bento. Rows must sum to 6: 4+2 / 2+4 / 3+3. */
  span: 2 | 3 | 4;
};

export const BUILD = {
  heading: "What you can build on it.",
  subheading:
    "Some of these are already running in production. The rest are a configuration away.",
  closingLine:
    "…or bring us your own idea — if you can describe it, you can build it on the stack.",
  items: [
    {
      icon: "Bot",
      title: "AI agents & agentic ops",
      description:
        "Autonomous agents that run multi-step tasks and operations on their own.",
      live: true,
      featured: true,
      span: 4,
    },
    {
      icon: "MessagesSquare",
      title: "Customer & internal assistants",
      description:
        "Support bots and knowledge assistants that answer from your own data.",
      span: 2,
    },
    {
      icon: "CalendarClock",
      title: "Scheduling & booking agents",
      description:
        "Handle appointments, rescheduling, and reminders end to end.",
      live: true,
      span: 2,
    },
    {
      icon: "PenLine",
      title: "Content & creative engines",
      description:
        "Turn notes, briefs, or data into publish-ready articles, posts, and posters.",
      live: true,
      featured: true,
      span: 4,
    },
    {
      icon: "Telescope",
      title: "Research & discovery tools",
      description:
        "Gather, extract, and rank information to surface the insights you need.",
      live: true,
      span: 3,
    },
    {
      icon: "Workflow",
      title: "Workflow automations",
      description: "Hand off repetitive, multi-app processes to AI.",
      span: 3,
    },
  ] satisfies BuildItem[],
} as const;

export const HOW_IT_WORKS = {
  heading: "Live in days, not months.",
  subheading:
    "The stack is already built. Getting you on it is the only work left.",
  steps: [
    {
      title: "Pick what you need",
      description: "Start from a building block or a ready-made use case.",
    },
    {
      title: "Connect your data & tools",
      description: "Plug the stack into your existing systems.",
    },
    {
      title: "Configure to your business",
      description: "Tune voice, rules, and guardrails — we help if you want.",
    },
    {
      title: "Go live",
      description: "Ship it, watch it work, and scale.",
    },
  ],
} as const;

export const WHY_US = {
  heading: "Why teams build on our stack",
  pillars: [
    {
      icon: "PackageCheck",
      title: "Already built",
      description:
        "The hard part is done. Use a proven stack instead of starting from scratch.",
    },
    {
      icon: "Layers",
      title: "Everything in one place",
      description:
        "Agents, assistants, content, automation — one stack, not ten vendors.",
    },
    {
      icon: "Plug",
      title: "Plugs into your business",
      description: "Connects to your data and tools; live in days, not months.",
    },
    {
      icon: "ShieldCheck",
      title: "You stay in control",
      description:
        "Full transparency and human oversight over everything the AI does.",
    },
  ],
} as const;

export const FINAL_CTA = {
  heading: "Ready to put the stack to work?",
  subheading:
    "Tell us what you want to build and we'll show you how the stack does it.",
} as const;

export const FOOTER = {
  descriptor: TAGLINE,
  links: [
    { label: "The stack", href: "#stack" },
    { label: "What you can build", href: "#build" },
    { label: "How it works", href: "#how" },
  ],
  legal: [
    { label: "Privacy", href: "/privacy-policy" },
    { label: "Terms", href: "/tos" },
  ],
} as const;
