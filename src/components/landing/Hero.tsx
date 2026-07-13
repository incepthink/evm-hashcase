"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, ChevronDown, Sparkles } from "lucide-react";
import Aurora from "./Aurora";
import { DEMO_MAILTO, HERO, START_MAILTO } from "./content";

export default function Hero() {
  const reduceMotion = useReducedMotion();

  const rise = (delay: number) =>
    reduceMotion
      ? {}
      : {
          initial: { opacity: 0, y: 24 },
          animate: { opacity: 1, y: 0 },
          transition: {
            duration: 0.7,
            delay,
            ease: [0.22, 1, 0.36, 1] as const,
          },
        };

  return (
    <section
      id="top"
      className="relative flex min-h-[92vh] items-center justify-center overflow-hidden px-5 pb-24 pt-32 sm:px-8"
    >
      <Aurora />

      <div className="relative mx-auto max-w-4xl text-center">
        <motion.div {...rise(0)}>
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-white/70 backdrop-blur">
            <Sparkles size={14} className="text-brand-cyan" />
            {HERO.eyebrow}
          </span>
        </motion.div>

        <motion.h1
          {...rise(0.1)}
          className="mt-8 text-4xl font-semibold leading-[1.1] tracking-tight text-white sm:text-5xl lg:text-6xl xl:text-7xl"
        >
          {HERO.headlineLead}{" "}
          <span
            className="animate-gradient bg-gradient-to-r from-brand-violet via-brand-blue to-brand-cyan bg-clip-text text-transparent motion-reduce:animate-none"
            style={{
              backgroundSize: "var(--bg-size, 200%) 100%",
              ["--bg-size" as string]: "200%",
            }}
          >
            {HERO.headlineAccent}
          </span>
        </motion.h1>

        <motion.p
          {...rise(0.2)}
          className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-white/60 sm:text-lg"
        >
          {HERO.subhead}
        </motion.p>

        <motion.div
          {...rise(0.3)}
          className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row"
        >
          <a
            href={DEMO_MAILTO}
            className="group relative inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-full bg-white px-7 py-3.5 font-medium text-ink transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-violet focus-visible:ring-offset-2 focus-visible:ring-offset-ink sm:w-auto"
          >
            {/* Shimmer sheen */}
            <span
              aria-hidden
              className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-black/10 to-transparent motion-reduce:animate-none"
            />
            <span className="relative">{HERO.primaryCta}</span>
            <ArrowRight
              size={18}
              className="relative transition-transform group-hover:translate-x-0.5"
            />
          </a>

          <a
            href={START_MAILTO}
            className="inline-flex w-full items-center justify-center rounded-full border border-white/20 bg-white/5 px-7 py-3.5 font-medium text-white backdrop-blur transition-colors hover:border-white/35 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-violet focus-visible:ring-offset-2 focus-visible:ring-offset-ink sm:w-auto"
          >
            {HERO.secondaryCta}
          </a>
        </motion.div>
      </div>

      <motion.a
        href="#stack"
        aria-label="Scroll to the stack"
        {...rise(0.6)}
        className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 rounded-full p-2 text-white/40 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-violet sm:block"
      >
        <ChevronDown
          size={22}
          className="animate-float motion-reduce:animate-none"
        />
      </motion.a>
    </section>
  );
}
