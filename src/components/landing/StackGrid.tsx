import { STACK } from "./content";
import { getIcon } from "./icons";
import Reveal from "./Reveal";
import SectionHeading from "./SectionHeading";
import SpotlightCard from "./SpotlightCard";

export default function StackGrid() {
  return (
    <section id="stack" className="relative scroll-mt-24 px-5 py-24 sm:px-8 lg:py-32">
      <div className="mx-auto max-w-7xl">
        <SectionHeading title={STACK.heading} subtitle={STACK.subheading} />

        <ul className="mt-16 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STACK.items.map((item, i) => {
            const Icon = getIcon(item.icon);
            return (
              <Reveal as="li" key={item.title} delay={(i % 4) * 0.06}>
                <SpotlightCard className="h-full">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-gradient-to-br from-brand-violet/25 to-brand-cyan/15">
                    <Icon size={20} className="text-white" />
                  </span>
                  <h3 className="mt-5 font-medium text-white">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/50">
                    {item.description}
                  </p>
                </SpotlightCard>
              </Reveal>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
