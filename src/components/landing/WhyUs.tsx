import { WHY_US } from "./content";
import { getIcon } from "./icons";
import Reveal from "./Reveal";
import SectionHeading from "./SectionHeading";

export default function WhyUs() {
  return (
    <section className="relative px-5 py-24 sm:px-8 lg:py-32">
      <div className="mx-auto max-w-7xl">
        <SectionHeading title={WHY_US.heading} />

        <ul className="mt-16 grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
          {WHY_US.pillars.map((pillar, i) => {
            const Icon = getIcon(pillar.icon);
            return (
              <Reveal
                as="li"
                key={pillar.title}
                delay={i * 0.08}
                className="group bg-ink-surface p-8 transition-colors hover:bg-ink-raised"
              >
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-gradient-to-br from-brand-violet/25 to-brand-cyan/15">
                  <Icon size={20} className="text-white" />
                </span>
                <h3 className="mt-5 font-medium text-white">{pillar.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/50">
                  {pillar.description}
                </p>
              </Reveal>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
