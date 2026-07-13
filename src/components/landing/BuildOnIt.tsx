import { cn } from "@/components/lib/utils";
import { BUILD } from "./content";
import { getIcon } from "./icons";
import Reveal from "./Reveal";
import SectionHeading from "./SectionHeading";
import SpotlightCard from "./SpotlightCard";

/** Spelled out so Tailwind's scanner sees the full class names. */
const SPAN_CLASS = {
  2: "lg:col-span-2",
  3: "lg:col-span-3",
  4: "lg:col-span-4",
} as const;

export default function BuildOnIt() {
  return (
    <section
      id="build"
      className="relative scroll-mt-24 px-5 py-24 sm:px-8 lg:py-32"
    >
      {/* Section wash */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-1/4 -z-10 mx-auto h-96 max-w-4xl rounded-full bg-brand-violet/10 blur-[140px]"
      />

      <div className="mx-auto max-w-7xl">
        <SectionHeading title={BUILD.heading} subtitle={BUILD.subheading} />

        {/* Asymmetric bento: 2 featured tiles span 3 cols, the rest span 2. */}
        <ul className="mt-16 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-6">
          {BUILD.items.map((item, i) => {
            const Icon = getIcon(item.icon);
            return (
              <Reveal
                as="li"
                key={item.title}
                delay={(i % 3) * 0.06}
                className={SPAN_CLASS[item.span]}
              >
                <SpotlightCard
                  className={cn(
                    "flex h-full flex-col",
                    item.featured && "lg:p-8",
                  )}
                >
                  <div className="flex items-start justify-between gap-4">
                    <span
                      className={cn(
                        "inline-flex items-center justify-center rounded-xl border border-white/10 bg-gradient-to-br from-brand-violet/25 to-brand-cyan/15",
                        item.featured ? "h-12 w-12" : "h-11 w-11",
                      )}
                    >
                      <Icon size={item.featured ? 22 : 20} className="text-white" />
                    </span>

                    {item.live && (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-cyan/25 bg-brand-cyan/10 px-2.5 py-1 text-[11px] font-medium uppercase tracking-wider text-brand-cyan">
                        <span className="h-1.5 w-1.5 rounded-full bg-brand-cyan" />
                        Live
                      </span>
                    )}
                  </div>

                  <h3
                    className={cn(
                      "mt-5 font-medium text-white",
                      item.featured && "lg:text-lg",
                    )}
                  >
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/50">
                    {item.description}
                  </p>
                </SpotlightCard>
              </Reveal>
            );
          })}
        </ul>

        <Reveal delay={0.1}>
          <p className="mx-auto mt-12 max-w-2xl text-center text-base text-white/45 sm:text-lg">
            {BUILD.closingLine}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
