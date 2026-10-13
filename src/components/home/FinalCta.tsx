import { CAREERS_HREF, EVALUATE_HREF, OPEN_ROLES } from "./content";
import { ArrowRight } from "./icons";

export default function FinalCta() {
  return (
    <section className="relative z-[2] overflow-hidden bg-[#0E1116] pb-24 lg:pb-[120px]">
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-[140px] left-[20%] h-80 w-[520px] rounded-full bg-[#6A3DF0] opacity-40 blur-[110px]" />

      <div className="relative mx-auto flex max-w-[1280px] flex-col gap-5 px-4 sm:px-8">
        <div className="relative flex flex-col items-start overflow-hidden rounded-[28px] bg-[#F7F7F4] p-4 sm:p-10 lg:rounded-[40px] lg:p-[72px]">
          <div aria-hidden="true" className="absolute -top-20 left-[30%] h-[420px] w-[420px] animate-[hc-drift_14s_ease-in-out_infinite] rounded-full bg-[#A98BFF] opacity-70 blur-[70px]" />
          <div aria-hidden="true" className="absolute -bottom-[120px] right-[6%] h-[420px] w-[460px] animate-[hc-drift_16s_ease-in-out_infinite_reverse] rounded-full bg-[#5C9BFF] opacity-65 blur-[70px]" />
          <div aria-hidden="true" className="absolute -bottom-[60px] -left-[60px] h-[300px] w-[300px] rounded-full bg-[#FFC9A8] opacity-70 blur-[60px]" />
          <div
            aria-hidden="true"
            className="absolute -right-10 top-1/2 h-[520px] w-[520px] -translate-y-1/2 bg-contain bg-center bg-no-repeat opacity-[.14]"
            style={{ backgroundImage: "url('/landing/hashcase-k.png')" }}
          />
          <div
            aria-hidden="true"
            className="absolute inset-0"
            style={{
              backgroundImage:
                "linear-gradient(rgba(14,17,22,.04) 1px, transparent 1px), linear-gradient(90deg, rgba(14,17,22,.04) 1px, transparent 1px)",
              backgroundSize: "48px 48px",
            }}
          />

          <div className="hc-glass relative flex max-w-[860px] flex-col gap-7 rounded-3xl p-6 sm:rounded-[32px] sm:p-14">
            <h2 className="hc-d m-0 max-w-[760px] text-[32px] font-extrabold leading-none tracking-[-0.04em] sm:text-[48px] lg:text-[64px] lg:leading-[.98]">
              Bring us your use case. We&apos;ll show you the system.
            </h2>
            <p className="m-0 max-w-[540px] text-lg leading-[1.55] text-[#3D4350]">
              We&apos;ll benchmark the right models on your data and map the deployment inside your infrastructure.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <a
                href={EVALUATE_HREF}
                className="hc-btn flex items-center justify-center gap-3 rounded-full bg-[#0E1116] px-[26px] py-[18px] text-[17px] font-semibold text-white"
              >
                Evaluate your use case <ArrowRight strokeWidth={2} />
              </a>
              <a
                href="#how"
                className="flex items-center justify-center rounded-full border border-white/90 bg-white/60 px-[22px] py-[18px] text-[17px] font-semibold transition-colors hover:text-[#1A5FE0]"
              >
                See how HashCase works
              </a>
            </div>
          </div>
        </div>

        <a
          href={CAREERS_HREF}
          className="hc-lift flex flex-wrap items-center justify-between gap-5 rounded-[28px] border border-white/[.12] bg-white/5 px-5 py-6 text-white backdrop-blur-[18px] sm:px-9 sm:py-[30px]"
        >
          <div className="flex items-center gap-[18px]">
            <span className="hc-d bg-gradient-to-r from-[#A47BFF] to-[#4D8DFF] bg-clip-text text-[32px] font-extrabold leading-none text-transparent sm:text-[44px]">
              {String(OPEN_ROLES).padStart(2, "0")}
            </span>
            <div className="flex flex-col gap-1">
              <span className="hc-d text-lg font-bold sm:text-2xl">Open roles. Build AI that ships to production.</span>
              <span className="text-[15px] text-[#B7BECB]">
                Engineering, delivery and growth — small team, real deployments.
              </span>
            </div>
          </div>
          <span className="flex items-center gap-2.5 rounded-full bg-white px-5 py-[13px] text-[15px] font-semibold text-[#0E1116]">
            See open roles <ArrowRight />
          </span>
        </a>
      </div>
    </section>
  );
}
