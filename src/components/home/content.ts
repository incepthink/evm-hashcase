/**
 * All home-page copy, links and case-study data live here.
 * Editing this file should never require touching JSX.
 */

import { ROLES } from "./careers";

export const CONTACT_EMAIL = "contact@hashcase.tech";

/** Every "Evaluate your use case" / "Contact Us" button opens the contact modal. */
export const EVALUATE_HREF = "#contact";

export const CONTACT_HREF = `mailto:${CONTACT_EMAIL}`;

export const CAREERS_HREF = "/careers";

export const OPEN_ROLES = ROLES.length;

export const X_URL = "https://x.com/hash_case";

export const NAV_LINKS = [
  { label: "Use Cases", href: "/#how" },
  { label: "Case Studies", href: "/#cases", match: "/case-studies" },
  { label: "Careers", href: CAREERS_HREF, badge: OPEN_ROLES, match: "/careers" },
  { label: "Contact Us", href: EVALUATE_HREF },
] as const;

/**
 * Logo strip under the hero. `width`/`height` are the PNG's pixel size;
 * `className` sets the rendered height (mobile, then desktop).
 * `label` is shown as text beside the logo (for marks without a wordmark).
 */
export const CLIENT_LOGOS: {
  name: string;
  src: string;
  width: number;
  height: number;
  className: string;
  label?: [string, string];
}[] = [
  { name: "Government of Maharashtra emblem", src: "/landing/logos/maharashtra.png", width: 159, height: 160, className: "h-[38px] sm:h-14", label: ["Government of", "Maharashtra"] },
  { name: "The Network School", src: "/landing/logos/network-school.png", width: 254, height: 120, className: "h-[33px] sm:h-12" },
  { name: "upliance.ai", src: "/landing/logos/upliance.png", width: 535, height: 120, className: "h-5 sm:h-[30px]" },
  { name: "Mysten Labs", src: "/landing/logos/mysten.png", width: 916, height: 120, className: "h-[19px] sm:h-7" },
  { name: "The Sandbox", src: "/landing/logos/sandbox.png", width: 402, height: 120, className: "h-[27px] sm:h-10" },
  { name: "MEXC", src: "/landing/logos/mexc.png", width: 828, height: 120, className: "h-4 sm:h-6" },
  { name: "Axis Direct", src: "/landing/logos/axis.png", width: 518, height: 120, className: "h-[23px] sm:h-[34px]" },
];

export type CaseVisual = "dgipr" | "rev" | "gad" | "upl" | "mexc" | "axis";

export type CaseStudy = {
  short: string;
  client: string;
  sector: string;
  /** Soft tint behind the visual panel and the case-study page tags. */
  accent: string;
  /** Dark ink for tag text and grid lines on the case-study page. */
  ink: string;
  title: string;
  problem: string;
  built: string[];
  stack: string[];
  visual: CaseVisual;
  /** Slug of the full write-up in caseStudyDetails.ts. The button is hidden until this is set. */
  slug?: string;
  /** Hidden from the page until its copy is final. */
  draft?: boolean;
};

export const CASE_STUDIES: CaseStudy[] = [
  {
    short: "Maharashtra DGIPR",
    client: "Government of Maharashtra",
    sector: "Government · Media",
    accent: "#FFF1E8",
    ink: "#9A3412",
    title:
      "A Marathi-first content engine for the state’s information department",
    problem:
      "Official notes and documents had to become publication-ready Marathi articles and matching posters — in the department’s own house style, without slowing down.",
    built: [
      "RAG over historical Mahasamvad articles as style references",
      "Article generation and revision with staff feedback in the loop",
      "AI poster rendering with proper Marathi typesetting",
    ],
    stack: ["Next.js", "Fastify", "Supabase", "RAG", "Poster renderer"],
    visual: "dgipr",
    slug: "dgipr",
  },
  {
    short: "Revenue Department",
    client: "Revenue Department, Maharashtra",
    sector: "Government · Land records",
    accent: "#E8F6EF",
    ink: "#0E5C3E",
    title: "Case intelligence for housing-society land conversions",
    problem:
      "Class-II to Class-I conversions meant officers checking stacks of land records by hand — 7/12 extracts, property cards, grants, tax receipts, Index II.",
    built: [
      "OCR and redaction on every uploaded document",
      "Per-document AI checks plus cross-document checks: land ID, area, holder, tenure, tax arrears",
      "Precedent matching, fee trace and Marathi draft orders",
    ],
    stack: ["FastAPI", "Postgres + pgvector", "Redis workers", "Next.js"],
    visual: "rev",
  },
  {
    short: "GAD",
    client: "General Administration Department",
    sector: "Government",
    accent: "#F1ECFF",
    ink: "#4A23B0",
    title: "[GAD project — one-line headline]",
    problem:
      "[What the department was struggling with, in one or two sentences.]",
    built: [
      "[What we built — 1]",
      "[What we built — 2]",
      "[What we built — 3]",
    ],
    stack: ["[Stack]", "[Stack]"],
    visual: "gad",
    draft: true,
  },
  {
    short: "Upliance",
    client: "upliance",
    sector: "Smart hardware",
    accent: "#FFF6D6",
    ink: "#7A5200",
    title: "A generative recipe engine that speaks motor RPM",
    problem:
      "Static recipe programs couldn’t handle keto, Jain, missing pantry items or portion changes — and free-form LLM text can’t safely drive heat, blades and timers.",
    built: [
      "Semantic recipe discovery over the verified recipe base (pgvector RAG)",
      "Self-hosted Qwen recalculates ratios, moisture and cook time on the fly",
      "Deterministic compiler to blade RPM, heat curves and scale prompts — inside hardware safety envelopes",
    ],
    stack: ["Qwen on vLLM", "pgvector HNSW", "Zod", "WebSockets"],
    visual: "upl",
    slug: "upliance",
  },
  {
    short: "MEXC",
    client: "MEXC",
    sector: "Crypto exchange",
    accent: "#EEF4FF",
    ink: "#163E8C",
    title: "Real-time sentiment intelligence for a crypto exchange",
    problem:
      "Slang, bot spam and coordinated FUD across X, Telegram, Discord and Reddit made off-the-shelf social listening useless for real signals.",
    built: [
      "Streaming ingestion with bot and cashtag-spam scrubbing",
      "Crypto-native sentiment and campaign attribution on a self-hosted Qwen",
      "FUD anomaly alerts and an executive command center",
    ],
    stack: ["Qwen on vLLM", "pgvector HNSW", "Zod", "Next.js"],
    visual: "mexc",
    slug: "mexc",
  },
  {
    short: "Axis Direct",
    client: "Axis Direct",
    sector: "Banking · Finance",
    accent: "#FCE9F1",
    ink: "#9D1752",
    title: "Finding high-value businesses in 50 lakh KYB records",
    problem:
      "A registry of 5 million KYB records — but no way to tell which businesses were actually worth a relationship manager’s time.",
    built: [
      "Deterministic pre-filtering on capital, vintage and status",
      "Vector similarity to golden high-value exemplars, then OSINT enrichment",
      "Explainable on-prem Qwen scoring into Tier 1–4 with human review before CRM export",
    ],
    stack: ["Qwen on vLLM", "pgvector HNSW", "Zod", "HITL review"],
    visual: "axis",
    slug: "axis-direct",
  },
];

export const FOOTER = {
  descriptor:
    "Private, production-ready AI systems for enterprises and governments.",
  company: [
    { label: "Case Studies", href: "/#cases" },
    { label: "Use Cases", href: "/#how" },
    { label: "Careers", href: CAREERS_HREF },
    { label: "Contact Us", href: EVALUATE_HREF },
  ],
  deploy: ["On-premises", "Private cloud", "VPC", "Air-gapped"],
  legal: [
    { label: "Privacy", href: "/privacy-policy" },
    { label: "Terms", href: "/tos" },
  ],
  copyright: "© 2026 Hash Byte Pte Ltd · Singapore",
} as const;
