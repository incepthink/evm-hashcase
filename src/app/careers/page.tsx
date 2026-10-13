import type { Metadata } from "next";
import CareersChrome from "@/components/careers/CareersChrome";
import OpenPositions from "@/components/careers/OpenPositions";
import { CAREERS_PERKS } from "@/components/home/careers";

export const metadata: Metadata = {
  title: "Careers — HashCase",
  description:
    "Build AI that ships to production. HashCase puts private AI systems inside governments, banks, exchanges and hardware companies.",
};

export default function CareersPage() {
  return (
    <CareersChrome>
      <section className="relative mx-auto flex max-w-[1080px] flex-col gap-[22px] px-4 pb-8 pt-8 sm:px-8 sm:pt-12">
        <h1 className="hc-d m-0 max-w-[820px] text-[40px] font-extrabold leading-[.96] tracking-[-0.04em] sm:text-[56px] lg:text-[68px]">
          Build AI that ships to <span className="hc-grad-text">production</span> — not to a slide deck.
        </h1>
        <p className="m-0 max-w-[680px] text-lg leading-[1.55] text-[#3D4350] sm:text-[19px]">
          We put private AI systems inside governments, banks, exchanges and hardware companies. Small team, real
          deployments, and work that runs where it matters.
        </p>
        <ul className="m-0 mt-1 flex list-none flex-wrap gap-2.5 p-0">
          {CAREERS_PERKS.map((p) => (
            <li key={p.label} className="rounded-full px-3.5 py-2 text-sm font-semibold" style={{ background: p.bg, color: p.ink }}>
              {p.label}
            </li>
          ))}
        </ul>
      </section>
      <OpenPositions />
    </CareersChrome>
  );
}
