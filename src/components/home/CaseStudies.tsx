"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "@/components/lib/utils";
import CaseVisualPanel from "./CaseVisual";
import { CASE_STUDIES } from "./content";
import { ArrowRight, Check, Chevron } from "./icons";

const CASES = CASE_STUDIES.filter((c) => !c.draft);

export default function CaseStudies() {
  const [active, setActive] = useState(0);
  const cur = CASES[active];

  return (
    <section
      id="cases"
      className="relative z-[2] overflow-hidden rounded-t-[32px] bg-[#0E1116] pb-24 pt-20 text-white lg:rounded-t-[48px] lg:pb-[130px] lg:pt-[120px]"
    >
      <div aria-hidden="true" className="pointer-events-none absolute -left-[120px] top-[260px] h-[520px] w-[520px] animate-[hc-drift_18s_ease-in-out_infinite] rounded-full bg-[#6A3DF0] opacity-45 blur-[120px]" />
      <div aria-hidden="true" className="pointer-events-none absolute -right-[100px] top-[120px] h-[560px] w-[560px] animate-[hc-drift_16s_ease-in-out_infinite_reverse] rounded-full bg-[#1A6DFF] opacity-40 blur-[130px]" />

      <div className="relative mx-auto flex max-w-[1280px] flex-col gap-14 px-4 sm:px-8">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <h2 className="hc-d m-0 max-w-[720px] text-[34px] font-extrabold leading-none tracking-[-0.035em] sm:text-[44px] lg:text-[60px]">
            Shipped. In production. Inside their walls.
          </h2>
          <p className="m-0 max-w-[380px] text-[17px] leading-[1.55] text-[#B7BECB]">
            From state departments to exchanges, banks and smart hardware — private AI that runs where the data lives.
          </p>
        </div>

        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)]">
          <div role="tablist" aria-label="Case studies" aria-orientation="vertical" className="flex flex-col gap-2">
            {CASES.map((c, i) => {
              const on = i === active;
              return (
                <button
                  key={c.short}
                  type="button"
                  role="tab"
                  id={`case-tab-${i}`}
                  aria-selected={on}
                  aria-controls="case-panel"
                  onClick={() => setActive(i)}
                  className={cn(
                    "flex cursor-pointer items-center gap-3.5 rounded-[18px] border px-5 py-[18px] backdrop-blur-[18px] transition-colors duration-300",
                    on
                      ? "border-white/90 bg-white/[.92] text-[#0E1116]"
                      : "border-white/[.12] bg-white/5 text-white hover:bg-white/10",
                  )}
                >
                  <span className="flex flex-1 flex-col gap-[3px] text-left">
                    <span className="text-[17px] font-semibold">{c.short}</span>
                    <span className="text-[13px] opacity-70">{c.sector}</span>
                  </span>
                  <Chevron />
                </button>
              );
            })}
          </div>

          <div
            id="case-panel"
            role="tabpanel"
            aria-labelledby={`case-tab-${active}`}
            className="relative box-border flex flex-col gap-7 overflow-hidden rounded-[32px] border border-white/60 bg-white/90 p-6 text-[#0E1116] backdrop-blur-[20px] backdrop-saturate-[1.7] sm:p-10 lg:min-h-[560px]"
          >
            <div className="relative flex flex-col gap-4">
              <h3 className="hc-d m-0 max-w-[640px] text-[28px] font-extrabold leading-[1.02] tracking-[-0.03em] sm:text-[40px]">
                {cur.title}
              </h3>
              <p className="m-0 max-w-[640px] text-[17px] leading-[1.55] text-[#3D4350]">{cur.problem}</p>
            </div>

            <div className="relative grid grid-cols-[repeat(auto-fit,minmax(min(280px,100%),1fr))] gap-4">
              <div className="flex flex-col gap-3 rounded-[20px] border border-[#0E1116]/5 bg-[#F7F7F4]/70 p-[22px]">
                <span className="text-[15px] font-bold">What we built</span>
                {cur.built.map((b) => (
                  <div key={b} className="flex items-start gap-2.5 text-[15px] leading-[1.45]">
                    <Check className="mt-[3px] shrink-0 text-[#1A6DFF]" />
                    {b}
                  </div>
                ))}
              </div>

              <div
                className="flex flex-col justify-center gap-3 rounded-[20px] p-[22px]"
                style={{ background: cur.accent }}
              >
                <CaseVisualPanel kind={cur.visual} />
              </div>
            </div>

            <div className="relative flex flex-wrap items-center justify-between gap-4 border-t border-[#ECECEF] pt-1">
              <div className="flex flex-wrap gap-1.5 pt-4">
                {cur.stack.map((s) => (
                  <span key={s} className="hc-m rounded-full border border-[#D8D9DE] px-2.5 py-1.5 text-[11px]">
                    {s}
                  </span>
                ))}
              </div>
              {cur.slug && (
                <Link
                  href={`/case-studies/${cur.slug}`}
                  className="hc-btn mt-4 flex items-center gap-2.5 rounded-full bg-[#0E1116] px-5 py-[13px] text-[15px] font-semibold text-white"
                >
                  Read the case study <ArrowRight />
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
