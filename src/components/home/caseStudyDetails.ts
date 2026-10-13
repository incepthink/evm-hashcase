/**
 * Full case-study write-ups, rendered at /case-studies/[slug].
 * The slug must match `slug` on the entry in CASE_STUDIES (content.ts),
 * which supplies the short name, client, sector, colours and hero visual.
 */

export type Tone = "green" | "yellow" | "pink" | "violet" | "blue" | "dark";

/** bg / label / heading / body ink for each tinted card. */
export const TONES: Record<Tone, { bg: string; label: string; heading: string; body: string }> = {
  green: { bg: "#DDF3E6", label: "#0B5E3E", heading: "#0B3F2A", body: "#164A33" },
  yellow: { bg: "#FCEFC2", label: "#6B4600", heading: "#3D2900", body: "#5A3D00" },
  pink: { bg: "#FBDDE6", label: "#8E1B47", heading: "#5A0F2C", body: "#6E1738" },
  violet: { bg: "#E7E3FC", label: "#4B37C4", heading: "#2A1D8A", body: "#3A2CA0" },
  blue: { bg: "#DCEBFB", label: "#0F3460", heading: "#0F3460", body: "#163E6E" },
  dark: { bg: "#161B23", label: "#8D95A5", heading: "#FFFFFF", body: "#B7BECB" },
};

export type CaseStudyDetail = {
  slug: string;
  /** Headline is `headline` + `headlineAccent` (gradient). */
  headline: string;
  headlineAccent: string;
  intro: string;
  tags: string[];
  meta: { label: string; value: string }[];
  /** Two floating chips on the hero panel: what goes in, what comes out. */
  heroIn: { label: string; text: string; lang?: string };
  heroOut: { label: string; text: string; lang?: string };
  problemTitle: string;
  problem: string[];
  layersTitle: string;
  layers: { code: string; title: string; body: string; tone: Tone }[];
  architecture: {
    title: string;
    flow: { label: string; name: string; sub: string; tone: Tone }[];
    envelope: { label: string; items: string[] };
    columns: string[];
    /** First cell is the mono key, second is bold, the rest muted. */
    rows: { cells: string[]; warn?: boolean }[];
  };
  outcomeTitle: string;
  outcomes: { value: string; label: string; color?: string }[];
};

export const CASE_STUDY_DETAILS: CaseStudyDetail[] = [
  {
    slug: "dgipr",
    headline: "A Marathi-first content engine for ",
    headlineAccent: "the state’s information department.",
    intro:
      "How we built a production platform for the Directorate General of Information & Public Relations, Government of Maharashtra — turning meeting recordings, official notes and scanned documents into publication-ready Marathi articles, posters, translations and explainer videos.",
    tags: ["Government · Media", "Generative AI · Marathi NLP"],
    meta: [
      { label: "CLIENT", value: "DGIPR, Government of Maharashtra" },
      { label: "IN PRODUCTION", value: "10 modules, daily use" },
      { label: "LANGUAGES", value: "Marathi · English · Hindi" },
      { label: "STACK", value: "Next.js · Fastify · Postgres" },
    ],
    heroIn: { label: "officer ›", text: "बैठकीचे रेकॉर्डिंग + शासन निर्णय.pdf", lang: "mr" },
    heroOut: { label: "READY TO PUBLISH", text: "लेख · पोस्टर · EN · HI" },
    problemTitle: "Marathi is the working language — not a translation target.",
    problem: [
      "DGIPR is the communication arm of the Government of Maharashtra. Its District Information Officers carry a continuous publishing load: departmental meetings must become news articles, schemes must become citizen-facing posters, and every piece must ship in Marathi, English and Hindi across print, web and social — accurately and in the department’s established voice.",
      "Generic AI content tools couldn’t do it. They think in English, transliterate names afresh every time, let model knowledge leak into official facts, and mangle Devanagari conjuncts in generated images. Government communication carries accountability: names, dates, amounts and designations may never be invented.",
    ],
    layersTitle: "From a meeting recording to a published post.",
    layers: [
      {
        code: "A · INTAKE",
        title: "Every source, reviewed",
        body: "Recordings are transcribed to Marathi, scanned PDFs go through OCR, and each source is shown page by page so officers correct names and amounts before anything is written.",
        tone: "green",
      },
      {
        code: "B · WRITING",
        title: "House-style Marathi articles",
        body: "Key points, names and designations are confirmed first. Retrieval over the Mahasamvad archive teaches structure and register — never facts.",
        tone: "yellow",
      },
      {
        code: "C · DESIGN",
        title: "Posters that fit every point",
        body: "Templates are chosen by capacity so no point is dropped. Devanagari is typeset by a real shaping engine and the state emblem is composited at exact coordinates.",
        tone: "pink",
      },
      {
        code: "D · DISTRIBUTION",
        title: "Translated, checked, published",
        body: "English and Hindi with a mandatory name check, precision proof-reading, letterhead PDFs and two-step publishing to the department’s official X and Facebook accounts.",
        tone: "violet",
      },
    ],
    architecture: {
      title: "Officer in the loop at every stage — and code, not the model, has the final word on facts.",
      flow: [
        { label: "SOURCES", name: "Officer input", sub: "Audio · PDF · YouTube · notes", tone: "dark" },
        { label: "STAGE 1", name: "Intake & OCR", sub: "Marathi transcription", tone: "green" },
        { label: "STAGE 2", name: "Officer review", sub: "Points · names · designations", tone: "yellow" },
        { label: "STAGE 3", name: "Generation", sub: "Style RAG over the archive", tone: "pink" },
        { label: "OUTPUTS", name: "Publish", sub: "Article · poster · video · EN/HI", tone: "violet" },
      ],
      envelope: {
        label: "FACTUAL AUTHORITY",
        items: [
          "Never invents names, dates or amounts",
          "Numeric values can’t change",
          "Names locked by a verified dictionary",
          "Two-step publish confirmation",
        ],
      },
      columns: ["#", "STAGE", "WHAT THE OFFICER REVIEWS"],
      rows: [
        { cells: ["1", "Source intake", "Which pages of a scanned document are relevant"] },
        { cells: ["2", "After extraction", "Every transcript and page of text, correctable in place"] },
        { cells: ["3", "Before writing", "Key points, names, designations, editorial direction"] },
        { cells: ["4", "Before translating", "The exact spelling every name will receive"] },
        { cells: ["5", "After production", "Article, poster, caption and video — each with its own revision loop"] },
        { cells: ["GATE", "Before publishing", "A two-step confirmation on any outward-facing action"], warn: true },
      ],
    },
    outcomeTitle: "Live, in daily departmental use.",
    outcomes: [
      { value: "421", label: "content outputs produced in a recent 30-day window" },
      { value: "226", label: "posters and creatives in the same 30 days" },
      { value: "67", label: "publication-ready articles in the same 30 days" },
      { value: "10", label: "live modules in the officer workspace", color: "#4B37C4" },
    ],
  },
  {
    slug: "upliance",
    headline: "A generative recipe engine that ",
    headlineAccent: "speaks motor RPM.",
    intro:
      "How we built upliance AI — a hardware-constrained personalization engine that turns natural-language cooking requests into safe, machine-executable workflows for the upliance smart appliance.",
    tags: ["Smart hardware", "Generative AI · Compilers"],
    meta: [
      { label: "CLIENT", value: "upliance" },
      { label: "INDUSTRY", value: "Smart kitchen hardware" },
      { label: "MODEL", value: "Self-hosted Qwen on vLLM" },
      { label: "STACK", value: "pgvector · Zod · WebSockets" },
    ],
    heroIn: { label: "user ›", text: "“Make this low-carb, swap paneer for tofu, serve 4.”" },
    heroOut: { label: "COMPILED", text: "stir.rpm = 40 · heat = 160°C · tare()" },
    problemTitle: "Free text can’t drive a heating coil.",
    problem: [
      "The upliance appliance runs on precision actuators — automated stirring blades, induction heating and integrated weighing sensors. But it relied on static, hardcoded recipe programs that couldn’t handle real kitchens: keto, vegan or Jain diets, missing pantry items, portion changes or personal spice tolerance.",
      "Generic chat LLMs weren’t the answer. Unconstrained text generation can’t be safely translated into the strict thermal limits, blade speeds and timed physical steps the hardware needs.",
    ],
    layersTitle: "Four layers between a craving and a motor.",
    layers: [
      {
        code: "A · DISCOVERY",
        title: "Semantic recipe discovery",
        body: "pgvector RAG over the verified upliance recipe base, matching dietary profile, pantry and time constraints to the best base program.",
        tone: "green",
      },
      {
        code: "B · ADAPTATION",
        title: "Context-aware adaptation",
        body: "A self-hosted Qwen on vLLM recalculates ingredient proportions, liquid-to-solid ratios and cooking duration on the fly.",
        tone: "yellow",
      },
      {
        code: "C · COMPILER",
        title: "Deterministic instruction compiler",
        body: "Strict Zod schemas turn steps into motor speeds, multi-stage heat curves, timers and scale/tare prompts.",
        tone: "pink",
      },
      {
        code: "D · SYNC",
        title: "Real-time appliance sync",
        body: "Lightweight WebSockets to the touchscreen OS for live guidance, appliance control and taste-adjustment feedback.",
        tone: "violet",
      },
    ],
    architecture: {
      title: "From natural language to machine code — with a safety envelope around everything.",
      flow: [
        { label: "LAYER 1", name: "User intent", sub: "Touchscreen / voice", tone: "dark" },
        { label: "LAYER 2A", name: "Semantic RAG", sub: "Postgres + pgvector HNSW", tone: "green" },
        { label: "LAYER 2B", name: "Adaptation engine", sub: "Qwen via vLLM", tone: "yellow" },
        { label: "LAYER 2C", name: "Hardware compiler", sub: "Zod enforcement", tone: "pink" },
        { label: "HARDWARE", name: "upliance appliance", sub: "Actuators & sensors", tone: "violet" },
      ],
      envelope: {
        label: "SAFETY ENVELOPE",
        items: ["Burn prevention", "Boil-over thermal ceilings", "Dry-run cutoffs", "Lid-lock triggers"],
      },
      columns: ["LAYER", "SUBSYSTEM", "CORE TECHNOLOGY", "RESPONSIBILITY"],
      rows: [
        { cells: ["1", "User intent ingestion", "Touchscreen / voice NLP", "Substitutions, dietary preferences, portion scaling"] },
        { cells: ["2A", "Semantic discovery & RAG", "PostgreSQL + pgvector HNSW", "Matches taste & pantry to certified base recipes"] },
        { cells: ["2B", "Culinary adaptation engine", "Self-hosted Qwen via vLLM", "Recalibrates volume, moisture, duration & thermal curves"] },
        { cells: ["2C", "Deterministic hardware compiler", "Zod schema enforcement", "Validated machine code for RPM, heat curves, scale calibration"] },
        { cells: ["SAFE", "Hardware guardrail engine", "Embedded firmware interlocks", "Burn, boil-over, dry-run and lid-lock protection"], warn: true },
      ],
    },
    outcomeTitle: "Personal recipes. Deterministic hardware.",
    outcomes: [
      { value: "Every step", label: "schema-validated by Zod before it reaches the appliance" },
      { value: "4", label: "hardware interlocks enforced on compiled output — burn, boil-over, dry-run, lid-lock" },
      { value: "0", label: "recipe data sent to third-party LLM APIs — Qwen runs self-hosted", color: "#4B37C4" },
    ],
  },
  {
    slug: "mexc",
    headline: "Real-time sentiment intelligence that ",
    headlineAccent: "speaks fluent crypto.",
    intro:
      "How we built an autonomous social intelligence platform for MEXC — separating real market signals from bots, slang and coordinated FUD across X, Telegram, Discord and Reddit.",
    tags: ["Crypto exchange", "NLP · Streaming analytics"],
    meta: [
      { label: "CLIENT", value: "MEXC" },
      { label: "INDUSTRY", value: "Crypto exchange" },
      { label: "MODEL", value: "Self-hosted Qwen on vLLM" },
      { label: "STACK", value: "pgvector · Zod · Next.js" },
    ],
    heroIn: { label: "telegram ›", text: "“liquidation cascade incoming, dev rugged??”" },
    heroOut: { label: "CLASSIFIED", text: "sentiment = PANIC/FUD · alert = slack" },
    problemTitle: "Generic social listening can’t read “rekt”.",
    problem: [
      "MEXC needed 24/7 visibility into brand perception, user sentiment and campaign performance across hyper-active, fragmented crypto communities on X, Telegram, Discord and Reddit.",
      "The chatter moves fast and is dominated by slang, bot-driven spam, rapid market swings and coordinated FUD campaigns. Traditional social listening tools couldn’t tell actionable signals from noise — or measure whether a campaign actually landed.",
    ],
    layersTitle: "Four layers from raw chatter to a decision.",
    layers: [
      {
        code: "A · INGESTION",
        title: "Streaming ingestion & noise scrubbing",
        body: "Pipelines across X, Telegram, Discord and Reddit, with deterministic filters for bot spam, duplicate airdrop promos and cashtag hijacking.",
        tone: "green",
      },
      {
        code: "B · CLUSTERING",
        title: "Semantic narrative clustering",
        body: "1024-dim embeddings in pgvector HNSW group chatter into narrative threads in real time — feedback, feature requests and emerging controversies.",
        tone: "yellow",
      },
      {
        code: "C · AI CORE",
        title: "Crypto-native sentiment engine",
        body: "A self-hosted Qwen with Zod-enforced JSON reads HODL, rekt, moon and rugpull to classify Bullish, Bearish, Neutral and Panic/FUD — and attributes spikes to campaigns.",
        tone: "pink",
      },
      {
        code: "D · ACTION",
        title: "FUD alerts & command center",
        body: "Influence scoring separates high-impact voices from retail noise; anomaly alerts hit Slack and Telegram, and a live Next.js command center tracks it all.",
        tone: "violet",
      },
    ],
    architecture: {
      title: "Two analytics tracks, one private AI core — and alerts within seconds.",
      flow: [
        { label: "LAYER 1", name: "Ingestion router", sub: "X · Telegram · Discord · Reddit", tone: "dark" },
        { label: "LAYER 2A", name: "Campaign analytics", sub: "#Airdrop · #Listing · KOLs", tone: "green" },
        { label: "LAYER 2B", name: "Community sentiment", sub: "pgvector HNSW clustering", tone: "yellow" },
        { label: "LAYER 3", name: "Qwen AI core", sub: "Private vLLM + Zod", tone: "pink" },
        { label: "LAYER 4", name: "Alerts & command center", sub: "Slack · Telegram · Next.js", tone: "violet" },
      ],
      envelope: {
        label: "SIGNAL HYGIENE",
        items: ["Bot spam pruning", "Airdrop spam dedup", "Cashtag hijack filtering", "Influence-weighted scoring"],
      },
      columns: ["LAYER", "MODULE", "TECHNOLOGY", "SCOPE"],
      rows: [
        { cells: ["1", "Multi-channel ingestion & filter router", "API streams & webhooks", "X, Telegram, Discord, Reddit; bot spam pruning & cashtag dedup"] },
        { cells: ["2A", "Campaign & post analytics", "Marketing analytics pipeline", "Campaign hashtags, KOL amplification & virality metrics"] },
        { cells: ["2B", "Brand & community sentiment", "Real-time NLP + pgvector HNSW", "Mood index, FUD anomaly detection, narrative clustering"] },
        { cells: ["3", "Self-hosted Qwen AI core", "Private vLLM + Zod schemas", "Crypto-slang understanding, campaign attribution, structured JSON"] },
        { cells: ["4A", "Real-time operational actions", "Automated dispatch", "Instant Telegram & Slack alerts on FUD spikes or sentiment shifts"], warn: true },
        { cells: ["4B", "Executive command center", "Next.js real-time analytics", "Live sentiment, campaign ROI, competitive share of voice, heatmaps"] },
      ],
    },
    outcomeTitle: "Signal, not noise — in real time.",
    outcomes: [
      { value: "4", label: "channels in one stream — X, Telegram, Discord and Reddit" },
      { value: "Seconds", label: "from a coordinated FUD spike to an alert for PR, risk and comms" },
      { value: "0", label: "trading intelligence sent to third-party LLM APIs — Qwen runs on private vLLM", color: "#4B37C4" },
    ],
  },
  {
    slug: "axis-direct",
    headline: "Finding the high-value businesses in ",
    headlineAccent: "50 lakh KYB records.",
    intro:
      "How we built an automated discovery and scoring engine for Axis Direct — enriching raw corporate filings with digital-footprint intelligence and scoring every viable business on-premises.",
    tags: ["Banking · Finance", "Vector search · AI scoring"],
    meta: [
      { label: "CLIENT", value: "Axis Direct" },
      { label: "INDUSTRY", value: "Banking & finance" },
      { label: "MODEL", value: "On-prem Qwen on vLLM" },
      { label: "STACK", value: "pgvector · Zod · Next.js" },
    ],
    heroIn: { label: "kyb ›", text: "Pvt Ltd · active · GST filed · est. 2009" },
    heroOut: { label: "SCORED", text: "tier = 1 · reasons[3] · review = pending" },
    problemTitle: "Five million records. No idea who matters.",
    problem: [
      "Axis Direct held a registry of 50 lakh (5 million) KYB records but had no automated way to identify and prioritise high-value commercial accounts.",
      "Static regulatory filings gave fragmented administrative data that didn’t reflect real commercial scale, brand equity or digital traction — leaving relationship managers to find prime prospects across millions of uncurated entities by hand.",
    ],
    layersTitle: "A funnel from 50 lakh to a ranked shortlist.",
    layers: [
      {
        code: "A · PRE-FILTER",
        title: "Deterministic pre-filtering",
        body: "Rules on corporate structure, paid-up capital, vintage, status and GST turnover prune dormant and micro-entities to ~5 lakh candidates.",
        tone: "green",
      },
      {
        code: "B · SIMILARITY",
        title: "Vector semantic pruning",
        body: "1024-dim embeddings with pgvector HNSW compare every profile to golden high-value exemplars, isolating the top ~1 lakh.",
        tone: "yellow",
      },
      {
        code: "C · ENRICHMENT",
        title: "Digital footprint resolution",
        body: "Automated OSINT finds and verifies web domains, LinkedIn and social presence — headcount, reach, engagement and active status.",
        tone: "pink",
      },
      {
        code: "D · SCORING",
        title: "Explainable on-prem scoring",
        body: "A self-hosted Qwen with Zod schemas produces composite scores, Tier 1–4, key strengths and audit justifications — reviewed in a Next.js dashboard before CRM export.",
        tone: "violet",
      },
    ],
    architecture: {
      title: "Every stage narrows the funnel — and humans sign off before anything reaches the CRM.",
      flow: [
        { label: "INPUT", name: "Raw KYB records", sub: "5,000,000", tone: "dark" },
        { label: "STAGE 1", name: "Rule pre-filter", sub: "~500,000", tone: "green" },
        { label: "STAGE 2", name: "Vector similarity", sub: "~50,000–100,000", tone: "yellow" },
        { label: "STAGE 3–4", name: "OSINT + AI scoring", sub: "Tier 1–4", tone: "pink" },
        { label: "STAGE 5", name: "Human review", sub: "CRM export", tone: "violet" },
      ],
      envelope: {
        label: "BANKING PRIVACY",
        items: ["On-prem LLM — zero external leakage", "Typed, auditable JSON", "Gate 1: verify AI reasoning", "Gate 2: portfolio export"],
      },
      columns: ["STAGE", "PHASE", "FUNNEL VOLUME", "IMPLEMENTATION"],
      rows: [
        { cells: ["IN", "Raw KYB records", "5,000,000 records", "Uncurated commercial registry & statutory filings"] },
        { cells: ["1", "Deterministic pre-filtering", "~500,000 candidates", "Paid-up capital, vintage, active status, GST turnover"] },
        { cells: ["2", "Similarity to golden exemplars", "~50,000–100,000", "text-embedding-3-large @ 1024-dim, pgvector HNSW"] },
        { cells: ["3", "Targeted OSINT & social discovery", "Enriched profiles", "Search orchestration, LinkedIn / Instagram / web resolution"] },
        { cells: ["4", "AI scoring & structured output", "Tier 1–4", "Self-hosted Qwen on vLLM + Zod; few-shot calibrated on manual scores"] },
        { cells: ["HITL", "Human-in-the-loop review", "CRM export", "Gate 1: verify AI reasoning · Gate 2: portfolio export"], warn: true },
      ],
    },
    outcomeTitle: "A ranked, explainable pipeline — on-premises.",
    outcomes: [
      { value: "50 lakh", label: "KYB records run through the funnel" },
      { value: "Tier 1–4", label: "explainable scores with strengths and audit justifications" },
      { value: "2", label: "human review gates before any portfolio export" },
      { value: "0", label: "banking data sent outside — Qwen runs on local vLLM", color: "#4B37C4" },
    ],
  },
];

export const getCaseStudyDetail = (slug: string) =>
  CASE_STUDY_DETAILS.find((c) => c.slug === slug);
