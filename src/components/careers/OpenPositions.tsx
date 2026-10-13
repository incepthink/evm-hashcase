"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "@/components/lib/utils";
import { DEPARTMENTS, ROLES, roleLocation } from "@/components/home/careers";
import { ArrowRight } from "@/components/home/icons";

const ALL = "All";
const LOCATIONS = Array.from(new Set(ROLES.map((r) => r.location)));
const TYPES = Array.from(new Set(ROLES.map((r) => r.type)));

const select = "hc-field min-w-[150px] rounded-xl border border-[#D8D9DE] bg-white px-3.5 py-[11px] text-[15px]";
const selectLabel = "hc-m text-[11px] tracking-[.08em] text-[#5B6170]";

export function PinIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true">
      <path d="M8 14s5-4.2 5-8A5 5 0 003 6c0 3.8 5 8 5 8z" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <circle cx="8" cy="6" r="1.6" fill="currentColor" />
    </svg>
  );
}

export default function OpenPositions() {
  const [dept, setDept] = useState(ALL);
  const [location, setLocation] = useState(ALL);
  const [type, setType] = useState(ALL);

  const groups = DEPARTMENTS.filter((d) => dept === ALL || d.name === dept)
    .map((d) => ({
      ...d,
      roles: ROLES.filter(
        (r) =>
          r.dept === d.name &&
          (location === ALL || r.location === location) &&
          (type === ALL || r.type === type),
      ),
    }))
    .filter((g) => g.roles.length > 0);
  const count = groups.reduce((n, g) => n + g.roles.length, 0);

  return (
    <section
      aria-labelledby="open-positions"
      className="relative mx-auto flex max-w-[1080px] flex-col gap-[22px] px-4 pb-24 pt-6 sm:px-8 lg:pb-[120px]"
    >
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[#E3E4E8] pb-[18px]">
        <h2 id="open-positions" className="hc-d m-0 flex items-center gap-3 text-[26px] font-extrabold tracking-[-0.02em] sm:text-[30px]">
          Open positions
          <span className="hc-m rounded-full bg-[#0E1116] px-2.5 py-1 text-[15px] font-normal text-white" aria-live="polite">
            {count}
          </span>
        </h2>
        <div className="flex flex-wrap gap-2.5">
          <label className="flex flex-col gap-1.5">
            <span className={selectLabel}>DEPARTMENT</span>
            <select value={dept} onChange={(e) => setDept(e.target.value)} className={cn(select, "min-w-[180px]")}>
              <option value={ALL}>All departments</option>
              {DEPARTMENTS.map((d) => (
                <option key={d.name}>{d.name}</option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1.5">
            <span className={selectLabel}>LOCATION</span>
            <select value={location} onChange={(e) => setLocation(e.target.value)} className={select}>
              <option value={ALL}>All locations</option>
              {LOCATIONS.map((l) => (
                <option key={l}>{l}</option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1.5">
            <span className={selectLabel}>TYPE</span>
            <select value={type} onChange={(e) => setType(e.target.value)} className={cn(select, "min-w-[140px]")}>
              <option value={ALL}>All types</option>
              {TYPES.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {groups.length === 0 && (
        <p className="m-0 rounded-[20px] border border-[#E3E4E8] bg-white/60 px-6 py-8 text-center text-[15px] text-[#3D4350]">
          No open roles match these filters right now.
        </p>
      )}

      {groups.map((g) => (
        <div key={g.name} className="flex flex-col gap-2.5 pt-3">
          <div className="flex items-center gap-2.5">
            <span aria-hidden="true" className="h-2.5 w-2.5 rounded-[3px]" style={{ background: g.color }} />
            <h3 className="hc-m m-0 text-[13px] font-semibold uppercase tracking-[.12em]">{g.name}</h3>
            <span className="hc-m text-xs text-[#5B6170]">{g.roles.length}</span>
          </div>
          {g.roles.map((r) => (
            <Link
              key={r.slug}
              href={`/careers/${r.slug}`}
              className="hc-row grid items-center gap-3 rounded-[20px] border border-[#E3E4E8] bg-white/60 px-5 py-5 text-[#0E1116] sm:grid-cols-[minmax(0,1fr)_auto_auto_36px] sm:gap-5 sm:px-6 sm:py-[22px]"
            >
              <span className="flex flex-col gap-1">
                <span className="hc-d text-xl font-bold tracking-[-0.01em] sm:text-[22px]">{r.title}</span>
                <span className="text-sm text-[#5B6170]">{r.blurb}</span>
              </span>
              <span className="flex items-center gap-1.5 text-sm text-[#3D4350]">
                <PinIcon />
                {roleLocation(r)}
              </span>
              <span className="hc-m self-start rounded-full bg-[#F2F2EF] px-2.5 py-1.5 text-xs sm:self-auto">{r.type}</span>
              <span aria-hidden="true" className="hidden h-9 w-9 items-center justify-center rounded-full bg-[#0E1116] text-white sm:flex">
                <ArrowRight size={14} />
              </span>
            </Link>
          ))}
        </div>
      ))}

      <div className="mt-5 flex flex-wrap items-center justify-between gap-4 rounded-3xl border-[1.5px] border-dashed border-[#D8D9DE] p-6 sm:p-7">
        <div className="flex flex-col gap-1">
          <span className="hc-d text-[22px] font-bold">Don&apos;t see your role?</span>
          <span className="text-[15px] text-[#3D4350]">Send us what you&apos;ve shipped. We read every note.</span>
        </div>
        <Link
          href="/careers/general"
          className="rounded-full border border-[#0E1116] bg-white px-5 py-3.5 text-[15px] font-semibold text-[#0E1116] transition-colors hover:bg-[#0E1116] hover:text-white"
        >
          General application
        </Link>
      </div>
    </section>
  );
}
