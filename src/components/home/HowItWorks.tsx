"use client";

import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { useReducedMotion } from "framer-motion";
import { cn } from "@/components/lib/utils";
import { Chevron, Lock, Refresh } from "./icons";

const STEP_MS = 3200;

const STEPS = [
  { title: "Your use case", body: "Outcomes, data sources, guardrails and fine-tuning that work for you." },
  { title: "Benchmarking evals", body: "Frontier models compared against each other on your data to find the ideal fit." },
  { title: "SLM / LLM systems", body: "Multiple models combine to give you the highest accuracy." },
  { title: "On-prem hosting", body: "Self-hosted solutions that stay within your control." },
];

/** Card surface per step (desktop fan). */
const FAN_LOOKS: CSSProperties[] = [
  {
    backgroundColor: "#FFFFFF",
    backgroundImage: "repeating-linear-gradient(transparent 0 31px, #EFF0F3 31px 32px)",
    border: "1px solid #E3E4E8",
    color: "#0E1116",
  },
  { background: "#EDE7FF", border: "1px solid #DCD2FF", color: "#24135E" },
  { background: "#0E1116", border: "1px solid #262D38", color: "#FFFFFF" },
  { background: "#E3EEFF", border: "1px solid #CFE0FF", color: "#0B2A66" },
];

/** Where a card sits in the fan, by depth (0 = front). */
const FAN_POSITIONS: CSSProperties[] = [
  { transform: "translate(0px, 270px) rotate(-6deg)", zIndex: 4, boxShadow: "0 40px 70px -30px rgba(14,17,22,.45)" },
  { transform: "translate(70px, 175px) rotate(3deg)", zIndex: 3, boxShadow: "0 30px 60px -34px rgba(14,17,22,.4)" },
  { transform: "translate(120px, 90px) rotate(-2deg)", zIndex: 2, boxShadow: "0 24px 50px -34px rgba(14,17,22,.35)", filter: "saturate(.9)" },
  { transform: "translate(160px, 10px) rotate(4deg)", zIndex: 1, boxShadow: "0 20px 40px -34px rgba(14,17,22,.3)", filter: "saturate(.8)" },
];

/** Card surface per step (phone list). */
const LIST_LOOKS: CSSProperties[] = [
  {
    backgroundColor: "rgba(255,255,255,.55)",
    backgroundImage: "repeating-linear-gradient(transparent 0 27px, rgba(14,17,22,.05) 27px 28px)",
    border: "1px solid rgba(255,255,255,.85)",
  },
  { background: "rgba(241,236,255,.55)", border: "1px solid rgba(255,255,255,.8)", color: "#24135E" },
  { background: "rgba(14,17,22,.84)", border: "1px solid rgba(255,255,255,.12)", color: "#FFFFFF" },
  { background: "rgba(232,240,255,.55)", border: "1px solid rgba(255,255,255,.8)", color: "#0B2A66" },
];

const STEP_INK = [
  { n: "#6B7080", body: "#3D4350" },
  { n: "#5B3BC4", body: "#3F2A85" },
  { n: "#9EC0FF", body: "#B7BECB" },
  { n: "#1A4FC0", body: "#1D3F80" },
];

const BRIEF = [
  { label: "Outcomes", done: true },
  { label: "Data sources", done: true },
  { label: "Guardrails", done: true },
  { label: "Fine-tuning", done: false },
];

const LEADERBOARD = [
  { rank: "#1", name: "Qwen 72B", score: 92 },
  { rank: "#2", name: "Llama 3 70B", score: 85 },
  { rank: "#3", name: "DeepSeek", score: 79 },
  { rank: "#4", name: "Mistral L", score: 74 },
];

const RACK = [
  { label: "model", dot: "#3DDC97", delay: "0s" },
  { label: "data", dot: "#3DDC97", delay: ".3s" },
  { label: "app", dot: "#9EC0FF", delay: ".6s" },
];

function CardText({ i, lines, maxW }: { i: number; lines: [string, string]; maxW: string }) {
  return (
    <div className={cn("relative z-[2] flex flex-col gap-3", maxW)}>
      <span className="hc-m text-xs" style={{ color: STEP_INK[i].n }}>
        0{i + 1} / 04
      </span>
      <h3 className="hc-d m-0 text-4xl font-extrabold leading-[.95] tracking-[-0.02em]">
        {lines[0]}
        <br />
        {lines[1]}
      </h3>
      <p className="m-0 text-[15px] leading-[1.45]" style={{ color: STEP_INK[i].body }}>
        {STEPS[i].body}
      </p>
    </div>
  );
}

/** The four fan cards' contents, front face only. */
const FAN_CARDS: ReactNode[] = [
  // 01 — the brief, on lined paper
  <>
    <CardText i={0} lines={["YOUR", "USE CASE"]} maxW="max-w-[230px]" />
    <div aria-hidden="true" className="absolute -bottom-3.5 right-7 flex w-[190px] rotate-[5deg] flex-col gap-2.5 rounded-2xl border border-[#E3E4E8] bg-white p-4 shadow-[0_20px_40px_-24px_rgba(14,17,22,.4)]">
      <span className="hc-m text-[10px] text-[#6B7080]">brief.md</span>
      {BRIEF.map((b) => (
        <span key={b.label} className={cn("flex items-center gap-2 text-[13px] font-semibold", !b.done && "text-[#6B7080]")}>
          <span
            className={cn(
              "box-border h-[15px] w-[15px] rounded",
              b.done ? "bg-[#0E1116]" : "border-[1.5px] border-[#AEB3C2]",
            )}
          />
          {b.label}
        </span>
      ))}
    </div>
    <svg aria-hidden="true" width="22" height="22" viewBox="0 0 22 22" className="absolute right-6 top-6">
      <path d="M11 3v16M3 11h16" stroke="#0E1116" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  </>,
  // 02 — leaderboard
  <>
    <CardText i={1} lines={["BENCHMARK", "EVALS"]} maxW="max-w-[220px]" />
    <div aria-hidden="true" className="absolute bottom-[22px] right-[22px] flex w-[196px] flex-col gap-[7px]">
      {LEADERBOARD.map((m, i) => (
        <div
          key={m.name}
          className={cn(
            "flex items-center gap-2 rounded-xl px-3 py-2.5",
            i === 0 ? "bg-white shadow-[0_12px_26px_-16px_rgba(91,59,196,.7)]" : i === 3 ? "bg-white/45" : "bg-white/65",
          )}
        >
          <span className={cn("hc-m text-[10px]", i === 0 ? "text-[#5B3BC4]" : "text-[#6B7080]")}>{m.rank}</span>
          <span className={cn("flex-1 text-[13px] text-[#0E1116]", i === 0 ? "font-bold" : "font-semibold")}>{m.name}</span>
          <span className={cn("hc-m text-xs text-[#0E1116]", i === 0 && "font-semibold")}>{m.score}</span>
        </div>
      ))}
    </div>
    <div
      aria-hidden="true"
      className="absolute -bottom-[60px] -left-10 h-40 w-[260px]"
      style={{ background: "repeating-linear-gradient(135deg, rgba(106,61,240,.12) 0 2px, transparent 2px 12px)" }}
    />
  </>,
  // 03 — model graph on dark
  <>
    <div aria-hidden="true" className="absolute -bottom-20 -right-[60px] h-[220px] w-[340px] bg-gradient-to-r from-[#8B4DFF] to-[#1A6DFF] opacity-55 blur-[70px]" />
    <CardText i={2} lines={["SLM / LLM", "SYSTEMS"]} maxW="max-w-[220px]" />
    <svg aria-hidden="true" viewBox="0 0 210 170" className="absolute bottom-[26px] right-[18px] h-[170px] w-[210px]">
      <defs>
        <linearGradient id="hc-fan-grad" x1="0" x2="1">
          <stop offset="0" stopColor="#A47BFF" />
          <stop offset="1" stopColor="#4D8DFF" />
        </linearGradient>
      </defs>
      <path
        d="M56 30 C 100 30, 100 85, 128 85 M56 85 L128 85 M56 140 C 100 140, 100 85, 128 85"
        stroke="url(#hc-fan-grad)"
        strokeWidth="2"
        fill="none"
        strokeDasharray="4 4"
        style={{ animation: "hc-dash 1.2s linear infinite" }}
      />
      <path d="M172 85 H 204" stroke="#3DDC97" strokeWidth="2" />
      {[
        { y: 18, label: "SLM" },
        { y: 73, label: "LLM" },
        { y: 128, label: "RAG" },
      ].map((n) => (
        <g key={n.label}>
          <rect x="2" y={n.y} width="54" height="24" rx="8" fill="#1C222C" stroke="#363F4D" />
          <text x="29" y={n.y + 16} textAnchor="middle" fontSize="10" fill="#E6E9EF" fontFamily="JetBrains Mono, monospace">
            {n.label}
          </text>
        </g>
      ))}
      <rect x="128" y="65" width="44" height="40" rx="12" fill="url(#hc-fan-grad)" />
      <text x="150" y="89" textAnchor="middle" fontSize="10" fill="#FFFFFF" fontFamily="JetBrains Mono, monospace">
        route
      </text>
      <circle cx="204" cy="85" r="5" fill="#3DDC97" />
    </svg>
  </>,
  // 04 — server rack on a blueprint grid
  <>
    <CardText i={3} lines={["ON-PREM", "HOSTING"]} maxW="max-w-[220px]" />
    <div aria-hidden="true" className="absolute bottom-[26px] right-[26px] flex w-[180px] flex-col gap-1.5 rounded-[18px] bg-[#0E1116] p-3 shadow-[0_20px_40px_-20px_rgba(11,42,102,.6)]">
      {RACK.map((r) => (
        <div key={r.label} className="flex items-center gap-2 rounded-[9px] bg-[#1C222C] p-2.5">
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: r.dot, animation: `hc-blink 1.4s infinite ${r.delay}` }} />
          <span className="h-1 flex-1 rounded bg-[#363F4D]" />
          <span className="hc-m text-[10px] text-[#A9B0BE]">{r.label}</span>
        </div>
      ))}
    </div>
    <span aria-hidden="true" className="absolute bottom-[120px] right-[186px] flex h-11 w-11 items-center justify-center rounded-[14px] bg-white text-[#1A4FC0] shadow-[0_12px_24px_-12px_rgba(11,42,102,.5)]">
      <Lock size={20} />
    </span>
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0"
      style={{
        backgroundImage:
          "linear-gradient(rgba(26,79,192,.07) 1px, transparent 1px), linear-gradient(90deg, rgba(26,79,192,.07) 1px, transparent 1px)",
        backgroundSize: "28px 28px",
      }}
    />
  </>,
];

export default function HowItWorks() {
  const [step, setStep] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (reduceMotion || paused) return;
    const timer = setInterval(() => setStep((s) => (s + 1) % STEPS.length), STEP_MS);
    return () => clearInterval(timer);
  }, [reduceMotion, paused]);

  const go = (i: number) => {
    setStep((i + STEPS.length) % STEPS.length);
    setPaused(true);
  };

  return (
    <section id="how" className="relative z-[2] mx-auto flex max-w-[1280px] scroll-mt-6 flex-col gap-3.5 px-4 pb-[72px] sm:px-8 md:gap-6 lg:pb-[140px]">
      {/* Phone: a plain list of the four steps */}
      <div aria-hidden="true" className="pointer-events-none absolute -left-[60px] top-[140px] h-[260px] w-[260px] rounded-full bg-[#B9A2FF] opacity-55 blur-[60px] md:hidden" />
      <div aria-hidden="true" className="pointer-events-none absolute -right-[60px] top-[420px] h-[260px] w-[260px] rounded-full bg-[#8DB8FF] opacity-60 blur-[60px] md:hidden" />
      <h2 className="hc-d relative m-0 mb-1.5 text-[32px] font-extrabold leading-[1.02] tracking-[-0.035em] md:hidden">
        The model is a component. The system is the product.
      </h2>
      <ol className="relative m-0 flex list-none flex-col gap-3.5 p-0 md:hidden">
        {STEPS.map((s, i) => (
          <li
            key={s.title}
            className="flex flex-col gap-2 rounded-[22px] p-5 backdrop-blur-[20px] backdrop-saturate-[1.7]"
            style={{ ...LIST_LOOKS[i], boxShadow: i === 2 ? undefined : "inset 0 1px 0 rgba(255,255,255,.9), 0 20px 50px -28px rgba(40,50,110,.35)" }}
          >
            <span className="hc-m text-xs" style={{ color: STEP_INK[i].n }}>
              0{i + 1}
            </span>
            <h3 className="hc-d m-0 text-[22px] font-extrabold">{s.title}</h3>
            <p className="m-0 text-sm leading-normal" style={{ color: STEP_INK[i].body }}>
              {s.body}
            </p>
            {i === 1 && (
              <div aria-hidden="true" className="mt-1 flex items-center gap-2 rounded-[10px] bg-white px-2.5 py-2">
                <span className="hc-m text-[11px] text-[#5B3BC4]">#1</span>
                <span className="flex-1 text-[13px] font-bold text-[#0E1116]">Qwen 72B</span>
                <span className="h-1.5 w-[60px] overflow-hidden rounded-md bg-[#EDE8FF]">
                  <span className="block h-full w-[92%] bg-[#6A3DF0]" />
                </span>
              </div>
            )}
          </li>
        ))}
      </ol>

      {/* Tablet and up: the fanned card stack */}
      <div className="relative hidden grid-cols-1 items-center gap-10 overflow-hidden rounded-[40px] border border-white/85 bg-white/55 px-6 py-10 shadow-[inset_0_1px_0_rgba(255,255,255,.9),0_40px_80px_-50px_rgba(40,50,110,.4)] backdrop-blur-[24px] backdrop-saturate-[1.6] md:grid lg:grid-cols-[minmax(0,.82fr)_minmax(0,1.18fr)] lg:px-16 lg:py-[72px]">
        <div className="relative z-[5] flex flex-col gap-[22px]">
          <h2 className="hc-d m-0 text-[38px] font-extrabold leading-none tracking-[-0.035em] lg:text-[54px]">
            The model is a component. The system is the product.
          </h2>
          <p className="m-0 max-w-[440px] text-lg leading-[1.55] text-[#3D4350]">
            HashCase turns an AI requirement into a complete production system — selecting the right intelligence,
            engineering the workflow around it, and deploying it inside your environment.
          </p>
          <div className="mt-1.5 flex flex-col gap-1.5">
            {STEPS.map((s, i) => {
              const on = i === step;
              return (
                <button
                  key={s.title}
                  type="button"
                  aria-pressed={on}
                  onClick={() => go(i)}
                  className={cn(
                    "flex cursor-pointer items-center gap-3.5 rounded-2xl border px-4 py-3.5 text-left transition-colors",
                    on
                      ? "border-white/95 bg-white/85 text-[#0E1116] shadow-[0_12px_30px_-20px_rgba(40,50,110,.4)]"
                      : "border-transparent bg-transparent text-[#6B7080] hover:text-[#0E1116]",
                  )}
                >
                  <span className="hc-m w-[26px] text-xs text-[#6B7080]">0{i + 1}</span>
                  <span className="flex flex-1 flex-col gap-2">
                    <span className="text-[17px] font-semibold">{s.title}</span>
                    <span className="h-[3px] overflow-hidden rounded-[3px] bg-[#0E1116]/[.08]">
                      <span
                        className="block h-full rounded-[3px] bg-gradient-to-r from-[#8B4DFF] to-[#1A6DFF]"
                        style={{
                          width: on ? "100%" : "0%",
                          transition: on && !paused ? `width ${STEP_MS}ms linear` : "width .2s",
                        }}
                      />
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              aria-label="Previous step"
              onClick={() => go(step - 1)}
              className="flex h-12 w-12 items-center justify-center rounded-full border border-[#0E1116]/[.14] bg-white/70"
            >
              <Chevron className="rotate-180" />
            </button>
            <button
              type="button"
              aria-label="Next step"
              onClick={() => go(step + 1)}
              className="flex h-12 w-12 items-center justify-center rounded-full bg-[#0E1116] text-white"
            >
              <Chevron />
            </button>
          </div>
        </div>

        <div className="relative h-[560px] lg:h-[620px]">
          {FAN_CARDS.map((card, i) => {
            const depth = (i - step + STEPS.length) % STEPS.length;
            return (
              <div
                key={i}
                aria-hidden={depth !== 0 || undefined}
                className="hc-fan absolute left-0 top-0 box-border h-[320px] w-[470px] overflow-hidden rounded-[30px] p-[30px]"
                style={{ ...FAN_LOOKS[i], ...FAN_POSITIONS[depth] }}
              >
                {card}
              </div>
            );
          })}
        </div>
      </div>

      {/* Continuous evaluation loop */}
      <div className="relative flex justify-center">
        <div className="hc-glass flex w-full items-center gap-2.5 rounded-[18px] px-4 py-3.5 md:w-auto md:gap-3.5 md:rounded-full md:px-5">
          <Refresh size={18} className="shrink-0 text-[#1A6DFF] md:hidden" />
          <Refresh className="hidden shrink-0 text-[#1A6DFF] md:block" />
          <span className="text-sm md:text-[15px]">
            <strong>Continuous evaluation</strong>
            <span className="md:hidden"> — better models, redeployed.</span>
            <span className="hidden text-[#3D4350] md:inline">
              {" "}
              — we re-assess models and redeploy as better ones become available.
            </span>
          </span>
        </div>
      </div>
    </section>
  );
}
