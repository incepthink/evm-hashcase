"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { cn } from "@/components/lib/utils";
import { GENERAL_APPLICATION, roleLocation, type Role } from "@/components/home/careers";
import ApplicationForm from "./ApplicationForm";

type Tab = "overview" | "apply";
const APPLY_HASH = "#apply";

function BackIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true">
      <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Bullets({ items, color }: { items: string[]; color: string }) {
  return (
    <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
      {items.map((x) => (
        <li key={x} className="flex gap-3">
          <span aria-hidden="true" className="mt-2.5 h-2 w-2 shrink-0 rounded-[3px]" style={{ background: color }} />
          <span>{x}</span>
        </li>
      ))}
    </ul>
  );
}

/** A job page; with no `role` it renders the general application. */
export default function JobView({ role }: { role?: Role }) {
  const job = role ?? GENERAL_APPLICATION;
  const [tab, setTab] = useState<Tab>(role ? "overview" : "apply");

  // /careers/<slug>#apply deep-links straight to the form.
  useEffect(() => {
    if (window.location.hash === APPLY_HASH) setTab("apply");
  }, []);

  const show = (t: Tab) => {
    setTab(t);
    const url = window.location.pathname + window.location.search + (t === "apply" ? APPLY_HASH : "");
    window.history.replaceState(window.history.state, "", url);
  };

  const chips = role ? [roleLocation(role), role.type, role.compensation].filter(Boolean) : [];

  const tabClass = (on: boolean) =>
    cn(
      "min-h-11 rounded-full px-5 py-[11px] text-[15px] font-semibold transition-colors",
      on ? "bg-[#0E1116] text-white" : "text-[#3D4350] hover:text-[#0E1116]",
    );

  return (
    <section className="relative mx-auto flex max-w-[1080px] flex-col gap-7 px-4 pb-24 pt-6 sm:px-8 sm:pt-8 lg:pb-[120px]">
      <Link href="/careers" className="hc-m flex items-center gap-2 self-start py-2.5 text-[13px] text-[#3D4350] hover:text-[#0E1116]">
        <BackIcon />
        All open positions
      </Link>

      <div className="relative overflow-hidden rounded-[28px] p-7 sm:rounded-[32px] sm:p-11" style={{ background: job.bg }}>
        <div
          aria-hidden="true"
          className="absolute inset-y-0 right-0 w-[45%]"
          style={{
            backgroundImage: `radial-gradient(${job.dots} 1.6px, transparent 1.6px)`,
            backgroundSize: "18px 18px",
            WebkitMaskImage: "linear-gradient(90deg, transparent, #000)",
            maskImage: "linear-gradient(90deg, transparent, #000)",
          }}
        />
        <div className="relative flex flex-col gap-3.5">
          <span className="hc-m text-xs uppercase tracking-[.12em]">{role ? role.dept : "Open application"}</span>
          <h1 className="hc-d m-0 text-[36px] font-extrabold leading-[.98] tracking-[-0.035em] sm:text-[56px]">{job.title}</h1>
          {chips.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {chips.map((c) => (
                <span key={c} className="rounded-full bg-white/75 px-3 py-[7px] text-sm">
                  {c}
                </span>
              ))}
            </div>
          ) : (
            <p className="m-0 max-w-[620px] text-[17px] leading-[1.55] text-[#3D4350]">{job.intro}</p>
          )}
        </div>
      </div>

      {role ? (
        <>
          <div role="tablist" aria-label="Job sections" className="flex gap-1.5 self-start rounded-full border border-[#E3E4E8] bg-white p-1.5">
            <button
              type="button"
              role="tab"
              id="tab-overview"
              aria-selected={tab === "overview"}
              aria-controls="panel-overview"
              onClick={() => show("overview")}
              className={tabClass(tab === "overview")}
            >
              Overview
            </button>
            <button
              type="button"
              role="tab"
              id="tab-apply"
              aria-selected={tab === "apply"}
              aria-controls="panel-apply"
              onClick={() => show("apply")}
              className={tabClass(tab === "apply")}
            >
              Application
            </button>
          </div>

          {tab === "overview" ? (
            <div id="panel-overview" role="tabpanel" aria-labelledby="tab-overview" className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_300px]">
              <div className="flex flex-col gap-7 text-[17px] leading-[1.65] text-[#2A322E]">
                <p className="m-0 text-lg text-[#0E1116] sm:text-[19px]">{role.intro}</p>
                <div className="flex flex-col gap-2.5">
                  <h2 className="hc-d m-0 text-2xl font-extrabold text-[#0E1116]">What you&apos;ll do</h2>
                  <Bullets items={role.doList} color="#1A6DFF" />
                </div>
                <div className="flex flex-col gap-2.5">
                  <h2 className="hc-d m-0 text-2xl font-extrabold text-[#0E1116]">You might be a fit if</h2>
                  <Bullets items={role.fitList} color="#E2A72E" />
                </div>
              </div>
              <aside className="flex flex-col gap-3.5 rounded-3xl border border-[#E3E4E8] bg-white p-6">
                {[
                  ["LOCATION", roleLocation(role)],
                  ["EMPLOYMENT TYPE", role.type],
                  ["DEPARTMENT", role.dept],
                ].map(([k, v]) => (
                  <div key={k} className="flex flex-col gap-1">
                    <span className="hc-m text-[11px] tracking-[.08em] text-[#5B6170]">{k}</span>
                    <span className="font-semibold">{v}</span>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => show("apply")}
                  className="hc-btn mt-1.5 rounded-full bg-[#0E1116] px-[18px] py-[15px] text-[15px] font-semibold text-white"
                >
                  Apply for this job
                </button>
              </aside>
            </div>
          ) : (
            <div id="panel-apply" role="tabpanel" aria-labelledby="tab-apply">
              <ApplicationForm roleTitle={role.title} />
            </div>
          )}
        </>
      ) : (
        <ApplicationForm roleTitle={GENERAL_APPLICATION.title} />
      )}
    </section>
  );
}
