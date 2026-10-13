import Image from "next/image";
import { cn } from "@/components/lib/utils";
import { CLIENT_LOGOS } from "./content";

function LogoRow({ hidden }: { hidden?: boolean }) {
  return (
    <div aria-hidden={hidden || undefined} className="flex items-center gap-11 pr-11 sm:gap-[88px] sm:pr-[88px]">
      {CLIENT_LOGOS.map((logo) => {
        const img = (
          <Image
            src={logo.src}
            alt={hidden ? "" : logo.name}
            width={logo.width}
            height={logo.height}
            className={cn("block w-auto shrink-0", logo.className)}
          />
        );
        if (!logo.label) return <span key={logo.name} className="shrink-0">{img}</span>;
        return (
          <span key={logo.name} className="flex shrink-0 items-center gap-2 sm:gap-3">
            {img}
            <span className="hc-d text-xs font-bold leading-[1.05] text-[#2B303B] sm:text-lg">
              {logo.label[0]}
              <br />
              {logo.label[1]}
            </span>
          </span>
        );
      })}
    </div>
  );
}

export default function LogoMarquee() {
  return (
    <section
      aria-label="Organizations we've built for"
      className="relative z-[2] border-y border-[#E8E8E4] bg-white py-[22px] sm:border-white/80 sm:bg-white/45 sm:py-[34px] sm:backdrop-blur-[16px]"
    >
      <div className="hc-fade-x overflow-hidden">
        <div className="flex w-max animate-[hc-marquee_26s_linear_infinite] sm:animate-[hc-marquee_34s_linear_infinite]">
          <LogoRow />
          <LogoRow hidden />
        </div>
      </div>
    </section>
  );
}
