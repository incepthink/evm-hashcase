import { Fragment } from "react";
import Link from "next/link";
import { cn } from "@/components/lib/utils";
import CaseVisualPanel from "./CaseVisual";
import { CASE_STUDIES, EVALUATE_HREF, type CaseStudy } from "./content";
import { TONES, type CaseStudyDetail } from "./caseStudyDetails";
import { ArrowRight } from "./icons";

const wrap = "relative z-[2] mx-auto max-w-[1280px] px-4 sm:px-8";
const h2 = "hc-d m-0 text-[30px] font-extrabold leading-[1.02] tracking-[-0.03em] sm:text-[40px]";

function BackIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true">
      <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function HeroPanel({ cs, d }: { cs: CaseStudy; d: CaseStudyDetail }) {
  return (
    <div
      className="relative flex flex-col items-center gap-4 overflow-hidden rounded-[28px] p-5 sm:p-8 lg:h-[520px] lg:justify-center lg:rounded-[36px]"
      style={{
        backgroundColor: cs.accent,
        backgroundImage: `linear-gradient(${cs.ink}12 1px, transparent 1px), linear-gradient(90deg, ${cs.ink}12 1px, transparent 1px)`,
        backgroundSize: "40px 40px",
      }}
    >
      <div className="flex w-full max-w-[560px] flex-col gap-3 rounded-3xl border border-white/80 bg-white/45 p-5 backdrop-blur-sm sm:p-7 lg:-mt-16">
        <CaseVisualPanel kind={cs.visual} />
      </div>
      <div className="flex w-full flex-col gap-3 sm:flex-row sm:justify-between lg:contents">
        <div className="rounded-[18px] bg-[#0E1116] px-[18px] py-4 shadow-[0_20px_40px_-20px_rgba(0,0,0,.5)] lg:absolute lg:bottom-10 lg:left-10 lg:max-w-[420px]">
          <div className="hc-m mb-1.5 text-[11px] text-[#9EC0FF]">{d.heroIn.label}</div>
          <div lang={d.heroIn.lang} className="text-[15px] text-white">
            {d.heroIn.text}
          </div>
        </div>
        <div className="flex flex-col gap-1 rounded-[18px] bg-white px-4 py-3.5 shadow-[0_20px_40px_-20px_rgba(0,0,0,.35)] lg:absolute lg:bottom-10 lg:right-10">
          <span className="hc-m text-[11px] text-[#5B6170]">{d.heroOut.label}</span>
          <span lang={d.heroOut.lang} className="hc-m text-[13px]">
            {d.heroOut.text}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function CaseStudyArticle({ cs, d }: { cs: CaseStudy; d: CaseStudyDetail }) {
  const more = CASE_STUDIES.filter((c) => c.slug && c.slug !== d.slug && !c.draft);
  const { architecture: arch } = d;

  return (
    <article>
      {/* HERO */}
      <section className={cn(wrap, "flex flex-col gap-6 pb-14 pt-6 sm:gap-7 sm:pt-10 lg:pb-16")}>
        <Link href="/#cases" className="hc-m flex items-center gap-2 self-start text-[13px] text-[#3D4350] hover:text-[#0E1116]">
          <BackIcon />
          All case studies
        </Link>
        <div className="flex flex-wrap gap-2">
          {d.tags.map((t, i) => (
            <span
              key={t}
              className={cn("rounded-full px-3 py-[7px] text-[13px] font-semibold", i > 0 && "border border-[#E3E4E8] bg-white")}
              style={i === 0 ? { background: cs.accent, color: cs.ink } : undefined}
            >
              {t}
            </span>
          ))}
        </div>
        <h1 className="hc-d m-0 max-w-[1050px] text-balance text-[40px] font-extrabold leading-[.95] tracking-[-0.04em] sm:text-[56px] lg:text-[76px]">
          {d.headline}
          <span className="hc-grad-text">{d.headlineAccent}</span>
        </h1>
        <p className="m-0 max-w-[760px] text-lg leading-[1.55] text-[#3D4350] sm:text-[21px]">{d.intro}</p>
        <dl className="m-0 mt-3 grid grid-cols-[repeat(auto-fit,minmax(min(220px,100%),1fr))] gap-px overflow-hidden rounded-[22px] border border-[#E3E4E8] bg-[#E3E4E8]">
          {d.meta.map((m) => (
            <div key={m.label} className="flex flex-col gap-1.5 bg-white px-[22px] py-5">
              <dt className="hc-m text-[11px] tracking-[.1em] text-[#5B6170]">{m.label}</dt>
              <dd className="m-0 text-[17px] font-semibold">{m.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className={cn(wrap, "pb-20 lg:pb-[100px]")} aria-label={`${cs.short} at a glance`}>
        <HeroPanel cs={cs} d={d} />
      </section>

      {/* PROBLEM */}
      <section className={cn(wrap, "pb-20 lg:pb-[100px]")}>
        <div className="grid gap-6 lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)] lg:gap-16">
          <h2 className={h2}>{d.problemTitle}</h2>
          <div className="flex flex-col gap-[18px] text-[17px] leading-[1.6] text-[#262D38] sm:text-[19px]">
            {d.problem.map((p) => (
              <p key={p.slice(0, 32)} className="m-0">
                {p}
              </p>
            ))}
          </div>
        </div>
      </section>

      {/* LAYERS */}
      <section className={cn(wrap, "flex flex-col gap-9 pb-20 lg:pb-[100px]")}>
        <h2 className={cn(h2, "max-w-[720px]")}>{d.layersTitle}</h2>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(280px,100%),1fr))] gap-4">
          {d.layers.map((l) => {
            const t = TONES[l.tone];
            return (
              <div key={l.code} className="hc-lift flex flex-col gap-3 rounded-[26px] p-7" style={{ background: t.bg }}>
                <span className="hc-m text-xs" style={{ color: t.label }}>
                  {l.code}
                </span>
                <h3 className="hc-d m-0 text-[23px] font-extrabold" style={{ color: t.heading }}>
                  {l.title}
                </h3>
                <p className="m-0 text-[15px] leading-[1.55]" style={{ color: t.body }}>
                  {l.body}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ARCHITECTURE */}
      <section className="relative z-[2] bg-[#0E1116] py-20 text-white lg:py-[100px]">
        <div className="mx-auto flex max-w-[1280px] flex-col gap-11 px-4 sm:px-8">
          <h2 className="hc-d m-0 max-w-[760px] text-[30px] font-extrabold leading-[1.02] tracking-[-0.03em] sm:text-[44px]">
            {arch.title}
          </h2>

          <ol className="m-0 flex list-none flex-col items-stretch gap-2.5 p-0 lg:flex-row">
            {arch.flow.map((f, i) => {
              const t = TONES[f.tone];
              return (
                <Fragment key={f.label + f.name}>
                  {i > 0 && (
                    <li aria-hidden="true" className="flex items-center justify-center text-[#5B6170]">
                      <ArrowRight className="rotate-90 lg:rotate-0" />
                    </li>
                  )}
                  <li
                    className={cn("flex flex-1 flex-col gap-1.5 rounded-[18px] p-[18px] lg:basis-[150px]", f.tone === "dark" && "border border-[#262D38]")}
                    style={{ background: t.bg, color: t.heading }}
                  >
                    <span className="hc-m text-[11px]" style={{ color: t.label }}>
                      {f.label}
                    </span>
                    <span className="text-base font-semibold">{f.name}</span>
                    <span className="text-[13px]" style={{ color: t.body }}>
                      {f.sub}
                    </span>
                  </li>
                </Fragment>
              );
            })}
          </ol>

          <div className="flex flex-wrap items-center gap-3.5 rounded-[18px] border-[1.5px] border-dashed border-[#F4C84A] px-5 py-4">
            <span className="hc-m text-xs tracking-[.08em] text-[#F4C84A]">{arch.envelope.label}</span>
            {arch.envelope.items.map((it) => (
              <span key={it} className="rounded-full bg-[#161B23] px-3 py-1.5 text-sm">
                {it}
              </span>
            ))}
          </div>

          <div className="overflow-x-auto rounded-[22px] border border-[#262D38]">
            <table className="w-full min-w-[760px] border-collapse text-[15px]">
              <thead>
                <tr className="bg-[#161B23] text-left">
                  {arch.columns.map((c) => (
                    <th key={c} scope="col" className="hc-m px-5 py-4 text-[11px] font-medium tracking-[.1em] text-[#8D95A5]">
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {arch.rows.map((r) => (
                  <tr key={r.cells[0] + r.cells[1]} className="border-t border-[#262D38]">
                    {r.cells.map((cell, i) => (
                      <td
                        key={i}
                        className={cn(
                          "px-5 py-4",
                          i === 0 && "hc-m",
                          i === 0 && (r.warn ? "text-[#F4C84A]" : "text-[#9EC0FF]"),
                          i === 1 && "font-semibold",
                          i > 1 && "text-[#B7BECB]",
                        )}
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* OUTCOME */}
      <section className={cn(wrap, "py-20 lg:py-[100px]")}>
        <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)] lg:gap-16">
          <h2 className={h2}>{d.outcomeTitle}</h2>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(min(240px,100%),1fr))] gap-4">
            {d.outcomes.map((o) => (
              <div key={o.label} className="flex flex-col gap-2 rounded-[22px] border border-[#E3E4E8] bg-white p-6">
                <span className="hc-d text-[30px] font-extrabold" style={{ color: o.color ?? "#1A6DFF" }}>
                  {o.value}
                </span>
                <span className="text-[15px] text-[#3D4350]">{o.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MORE + CTA */}
      <section className={cn(wrap, "flex flex-col gap-5 pb-24 lg:pb-[120px]")}>
        <h2 className="hc-d m-0 text-[28px] font-extrabold tracking-[-0.02em] sm:text-[32px]">More case studies</h2>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(320px,100%),1fr))] gap-4">
          {more.map((c) => (
            <Link
              key={c.slug}
              href={`/case-studies/${c.slug}`}
              className="hc-lift flex min-h-[220px] flex-col gap-3 rounded-[28px] p-7 sm:p-8"
              style={{ background: c.accent, color: c.ink }}
            >
              <span className="hc-m text-[11px] uppercase tracking-[.08em]">
                {c.sector} · {c.short}
              </span>
              <span className="hc-d text-2xl font-extrabold leading-[1.05] sm:text-[28px]">{c.title}</span>
              <span className="mt-auto flex items-center gap-2 font-semibold">
                Read <ArrowRight />
              </span>
            </Link>
          ))}
        </div>
        <div className="mt-6 flex flex-wrap items-center justify-between gap-6 rounded-[32px] bg-[#0E1116] p-7 text-white sm:p-12">
          <span className="hc-d max-w-[640px] text-[30px] font-extrabold leading-[1.02] tracking-[-0.03em] sm:text-[40px]">
            Have hardware, data or a process that needs AI it can trust?
          </span>
          <a
            href={EVALUATE_HREF}
            className="hc-btn flex items-center gap-2.5 rounded-full bg-[#9EC0FF] px-6 py-[18px] text-[17px] font-bold text-[#0E1116]"
          >
            Evaluate your use case <ArrowRight strokeWidth={2} />
          </a>
        </div>
      </section>
    </article>
  );
}
