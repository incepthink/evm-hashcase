import { MARQUEE_ITEMS } from "./content";

/**
 * Trust strip, solved honestly: no invented logos — an infinite-scroll strip of
 * the capabilities the stack actually ships with.
 */
export default function CapabilityMarquee() {
  return (
    <section aria-label="Stack capabilities" className="relative border-y border-white/5 bg-white/[0.02] py-6">
      <div
        className="flex overflow-hidden"
        style={{
          maskImage:
            "linear-gradient(to right, transparent, #000 12%, #000 88%, transparent)",
          WebkitMaskImage:
            "linear-gradient(to right, transparent, #000 12%, #000 88%, transparent)",
        }}
      >
        {/* Two identical tracks so the loop is seamless. */}
        {[0, 1].map((track) => (
          <ul
            key={track}
            aria-hidden={track === 1}
            className="flex shrink-0 animate-infinite-scroll items-center motion-reduce:animate-none"
          >
            {MARQUEE_ITEMS.map((item) => (
              <li
                key={item}
                className="flex items-center whitespace-nowrap px-6 text-sm font-medium uppercase tracking-widest text-white/35"
              >
                {item}
                <span
                  aria-hidden
                  className="ml-12 h-1 w-1 rounded-full bg-brand-violet/50"
                />
              </li>
            ))}
          </ul>
        ))}
      </div>
    </section>
  );
}
