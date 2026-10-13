import Image from "next/image";
import { EVALUATE_HREF } from "./content";
import { ArrowRight, Code, Database, FileIcon, Globe, Lock, PlayCircle } from "./icons";

const TEAMS = [
  { label: "Officers", dot: "#8B4DFF" },
  { label: "Analysts", dot: "#1A6DFF" },
  { label: "Your apps", dot: "#12A36B" },
];

const SYSTEM_PARTS = [
  { label: "Best-fit model", value: "Picked for you" },
  { label: "Workflow", value: "Built around it" },
  { label: "Guardrails", value: "Always on" },
];

const DATA_SOURCES = [
  { label: "Documents", Icon: FileIcon, bg: "rgba(238,244,255,.7)", color: "#163E8C" },
  { label: "Databases", Icon: Database, bg: "rgba(241,236,255,.7)", color: "#4A23B0" },
  { label: "Systems", Icon: Code, bg: "rgba(232,246,239,.7)", color: "#0E5C3E" },
];

function FlowConnector({ color, delay }: { color: string; delay: string }) {
  return (
    <div aria-hidden="true" className="relative flex h-10 justify-center">
      <span className="hc-dash-v h-full w-0.5" />
      <span
        className="absolute top-0 h-2 w-2 rounded-full"
        style={{ background: color, animation: `hc-flow-up 2s ease-in-out infinite ${delay}` }}
      />
    </div>
  );
}

/** "Everything runs inside your walls" diagram. */
function HeroVisual() {
  return (
    <div className="relative pt-[18px]">
      <div aria-hidden="true" className="absolute -left-[50px] top-[110px] z-[1] h-[280px] w-[280px] animate-[hc-drift_12s_ease-in-out_infinite] rounded-full bg-[#A98BFF] opacity-60 blur-[46px]" />
      <div aria-hidden="true" className="absolute -right-10 bottom-[30px] z-[1] h-[300px] w-[300px] animate-[hc-drift_14s_ease-in-out_infinite_reverse] rounded-full bg-[#5C9BFF] opacity-55 blur-[50px]" />
      <div aria-hidden="true" className="absolute left-[38%] top-[46%] z-[1] h-[190px] w-[190px] animate-[hc-drift_10s_ease-in-out_2s_infinite] rounded-full bg-[#7EE0B5] opacity-50 blur-[46px]" />

      {/* Blocked public API, outside the wall */}
      <div className="hc-glass absolute right-0 top-0 z-[3] flex items-center gap-2.5 rounded-2xl px-3.5 py-2.5">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#F1F1F3] text-[#8A8F9A]">
          <Globe />
        </span>
        <span className="flex flex-col">
          <span className="text-[13px] font-semibold text-[#6B7080] line-through">Public AI APIs</span>
          <span className="text-xs text-[#6B7080]">Your data never goes here</span>
        </span>
      </div>

      <div className="hc-glass relative z-[2] mt-[34px] rounded-[32px] px-4 pb-4 pt-[54px] sm:px-7 sm:pb-7">
        <div className="absolute -top-[17px] left-6 flex items-center gap-2 rounded-full bg-[#0E1116] px-3.5 py-2 text-sm font-semibold text-white">
          <Lock size={14} strokeWidth={1.8} className="text-[#9EC0FF]" />
          Your infrastructure
        </div>

        {/* Layer: apps */}
        <div className="flex flex-col gap-2.5">
          <span className="text-sm font-semibold text-[#3D4350]">Your teams &amp; apps</span>
          <div className="grid grid-cols-3 gap-2.5">
            {TEAMS.map((t) => (
              <div
                key={t.label}
                className="flex items-center gap-2 rounded-2xl border border-white/85 bg-white/60 p-3 text-[13px] font-semibold sm:p-3.5 sm:text-sm"
              >
                <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: t.dot }} />
                {t.label}
              </div>
            ))}
          </div>
        </div>

        <FlowConnector color="#1A6DFF" delay="0s" />

        {/* Layer: HashCase */}
        <div className="relative flex flex-col gap-4 overflow-hidden rounded-[22px] border border-white/15 bg-[rgba(14,17,22,.86)] p-[22px] text-white shadow-[0_30px_60px_-30px_rgba(26,109,255,.55)] backdrop-blur-[20px] backdrop-saturate-[1.7]">
          <div aria-hidden="true" className="absolute -bottom-20 -right-10 h-40 w-[260px] bg-gradient-to-r from-[#8B4DFF] to-[#1A6DFF] opacity-45 blur-[60px]" />
          <div className="relative flex items-center justify-between gap-3">
            <span className="flex items-center gap-2.5">
              <Image src="/landing/hashcase-mark.png" alt="" width={240} height={197} className="h-[26px] w-auto" />
              <span className="hc-d text-xl font-bold">Your AI system</span>
            </span>
            <span className="hc-m flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-[5px] text-[11px]">
              <span className="h-1.5 w-1.5 animate-[hc-blink_1.4s_infinite] rounded-full bg-[#3DDC97]" />
              live
            </span>
          </div>
          <div className="relative grid grid-cols-1 gap-2 sm:grid-cols-3">
            {SYSTEM_PARTS.map((p) => (
              <div key={p.label} className="flex flex-col gap-1 rounded-[14px] border border-white/10 bg-white/[.07] p-3">
                <span className="text-xs text-[#A9B0BE]">{p.label}</span>
                <span className="text-sm font-semibold">{p.value}</span>
              </div>
            ))}
          </div>
        </div>

        <FlowConnector color="#8B4DFF" delay="1s" />

        {/* Layer: data */}
        <div className="flex flex-col gap-2.5">
          <div className="grid grid-cols-3 gap-2.5">
            {DATA_SOURCES.map(({ label, Icon, bg, color }) => (
              <div
                key={label}
                className="flex items-center gap-2 rounded-2xl border border-white/85 p-3 text-[13px] font-semibold sm:p-3.5 sm:text-sm"
                style={{ background: bg, color }}
              >
                <Icon className="shrink-0" />
                {label}
              </div>
            ))}
          </div>
          <span className="text-sm font-semibold text-[#3D4350]">Your data</span>
        </div>
      </div>
    </div>
  );
}

export default function HomeHero() {
  return (
    <section id="top" className="relative z-[2] mx-auto max-w-[1280px] px-4 pb-20 pt-6 sm:px-8 lg:pb-24 lg:pt-16">
      <div className="grid items-center gap-14 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:gap-16">
        <div className="hc-rise flex flex-col gap-[30px]">
          <h1 className="hc-d m-0 text-[46px] font-extrabold leading-[.94] tracking-[-0.04em] sm:text-[64px] xl:text-[86px] xl:leading-[.93]">
            PRIVATE, <span className="hc-grad-text">PRODUCTION-READY</span> AI SYSTEMS
          </h1>
          <p className="m-0 max-w-[560px] text-lg leading-[1.55] text-[#3D4350] [text-wrap:pretty] sm:text-xl">
            HashCase evaluates the best models for your use case, engineers the complete AI workflow,
            and deploys it inside your infrastructure — giving enterprises and governments the power
            of frontier AI{" "}
            <strong className="font-semibold text-[#0E1116]">without giving up control of their data.</strong>
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <a
              href={EVALUATE_HREF}
              className="hc-btn flex items-center justify-center gap-3 rounded-full bg-[#0E1116] px-[26px] py-[18px] text-[17px] font-semibold text-white"
            >
              Evaluate your use case <ArrowRight strokeWidth={2} />
            </a>
            <a
              href="#how"
              className="flex items-center justify-center gap-2.5 rounded-full border border-[#D8D9DE] bg-white/70 px-[22px] py-[18px] text-[17px] font-semibold transition-colors hover:text-[#1A5FE0]"
            >
              <PlayCircle />
              See how HashCase works
            </a>
          </div>
        </div>

        <HeroVisual />
      </div>
    </section>
  );
}
