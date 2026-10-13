import { XCircle } from "./icons";

const FALSE_CHOICES = [
  { gain: "Use the best models", cost: "and give up control" },
  { gain: "Keep control", cost: "and compromise on capability" },
];

export default function Manifesto() {
  return (
    <section className="relative z-[2] mx-auto flex max-w-[1080px] flex-col items-center gap-10 px-4 py-24 text-center sm:px-8 lg:py-[140px]">
      <p className="hc-d m-0 text-[30px] font-bold leading-[1.1] tracking-[-0.03em] [text-wrap:balance] sm:text-[40px] lg:text-[52px]">
        AI has forced organizations into a false choice.
      </p>
      <div className="grid w-full grid-cols-[repeat(auto-fit,minmax(min(380px,100%),1fr))] gap-4 text-left">
        {FALSE_CHOICES.map((c) => (
          <div key={c.gain} className="flex flex-col gap-3 rounded-3xl border border-[#E3E4E8] bg-white px-7 py-[26px]">
            <span className="text-xl font-semibold">{c.gain}</span>
            <span className="flex items-center gap-2.5 text-lg text-[#6B7080]">
              <XCircle className="shrink-0 text-[#C83F5B]" />
              <span className="line-through">{c.cost}</span>
            </span>
          </div>
        ))}
      </div>
      <p className="hc-d m-0 text-[30px] font-extrabold leading-[1.1] tracking-[-0.03em] sm:text-[40px] lg:text-[52px]">
        HashCase <span className="hc-grad-text">eliminates the trade-off.</span>
      </p>
    </section>
  );
}
