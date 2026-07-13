import { ArrowRight } from "lucide-react";
import { DEMO_MAILTO, FINAL_CTA, HERO, START_MAILTO } from "./content";
import Reveal from "./Reveal";

export default function FinalCTA() {
  return (
    <section id="contact" className="scroll-mt-24 px-5 py-24 sm:px-8 lg:py-32">
      <Reveal className="mx-auto max-w-5xl">
        {/* Gradient border via a padded gradient wrapper around a solid panel. */}
        <div className="rounded-3xl bg-gradient-to-br from-brand-violet/60 via-brand-blue/30 to-brand-cyan/60 p-px">
          <div className="relative overflow-hidden rounded-3xl bg-ink-surface px-6 py-16 text-center sm:px-12 lg:py-20">
            <div
              aria-hidden
              className="pointer-events-none absolute -top-24 left-1/2 h-64 w-[36rem] -translate-x-1/2 rounded-full bg-brand-violet/25 blur-[120px]"
            />

            <div className="relative">
              <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl">
                {FINAL_CTA.heading}
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-white/55 sm:text-lg">
                {FINAL_CTA.subheading}
              </p>

              <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <a
                  href={DEMO_MAILTO}
                  className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-7 py-3.5 font-medium text-ink transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-violet focus-visible:ring-offset-2 focus-visible:ring-offset-ink sm:w-auto"
                >
                  {HERO.primaryCta}
                  <ArrowRight
                    size={18}
                    className="transition-transform group-hover:translate-x-0.5"
                  />
                </a>
                <a
                  href={START_MAILTO}
                  className="inline-flex w-full items-center justify-center rounded-full border border-white/20 bg-white/5 px-7 py-3.5 font-medium text-white backdrop-blur transition-colors hover:border-white/35 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-violet focus-visible:ring-offset-2 focus-visible:ring-offset-ink sm:w-auto"
                >
                  {HERO.secondaryCta}
                </a>
              </div>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
