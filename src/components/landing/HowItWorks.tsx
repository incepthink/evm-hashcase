"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import { HOW_IT_WORKS } from "./content";
import Reveal from "./Reveal";
import SectionHeading from "./SectionHeading";

/** Scaling the rail from 0 makes its own box zero-sized, so it can never
 *  trigger its own IntersectionObserver. The parent carries the trigger and
 *  the fills inherit it through variants. */
const railX: Variants = {
  hidden: { scaleX: 0 },
  visible: { scaleX: 1, transition: { duration: 1.2, ease: "easeOut" } },
};

const railY: Variants = {
  hidden: { scaleY: 0 },
  visible: { scaleY: 1, transition: { duration: 1.2, ease: "easeOut" } },
};

export default function HowItWorks() {
  const reduceMotion = useReducedMotion();

  return (
    <section
      id="how"
      className="relative scroll-mt-24 px-5 py-24 sm:px-8 lg:py-32"
    >
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          title={HOW_IT_WORKS.heading}
          subtitle={HOW_IT_WORKS.subheading}
        />

        <motion.div
          className="relative mt-20"
          initial={reduceMotion ? false : "hidden"}
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {/* Connecting rail — draws itself as the section enters view. Vertical
              on mobile, horizontal on desktop; each axis needs its own scale, so
              they're separate elements rather than one responsive one. */}
          <div
            aria-hidden
            className="absolute left-[1.45rem] top-6 h-[calc(100%-3rem)] w-px overflow-hidden bg-white/10 lg:hidden"
          >
            <motion.div
              variants={railY}
              style={{ originY: 0 }}
              className="h-full w-full bg-gradient-to-b from-brand-violet via-brand-blue to-brand-cyan"
            />
          </div>
          <div
            aria-hidden
            className="absolute left-0 top-6 hidden h-px w-full overflow-hidden bg-white/10 lg:block"
          >
            <motion.div
              variants={railX}
              style={{ originX: 0 }}
              className="h-full w-full bg-gradient-to-r from-brand-violet via-brand-blue to-brand-cyan"
            />
          </div>

          <ol className="grid grid-cols-1 gap-10 lg:grid-cols-4 lg:gap-6">
            {HOW_IT_WORKS.steps.map((step, i) => (
              <Reveal
                as="li"
                key={step.title}
                delay={i * 0.12}
                className="relative pl-16 lg:pl-0"
              >
                <span className="absolute left-0 top-0 inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/15 bg-ink-raised text-sm font-semibold text-white lg:relative lg:h-12 lg:w-12">
                  <span className="absolute inset-0 rounded-full bg-gradient-to-br from-brand-violet/30 to-brand-cyan/20" />
                  <span className="relative">{i + 1}</span>
                </span>

                <h3 className="mt-0 font-medium text-white lg:mt-6">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-white/50">
                  {step.description}
                </p>
              </Reveal>
            ))}
          </ol>
        </motion.div>
      </div>
    </section>
  );
}
