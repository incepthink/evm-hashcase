import type { Metadata } from "next";
import Capabilities from "@/components/home/Capabilities";
import CaseStudies from "@/components/home/CaseStudies";
import FinalCta from "@/components/home/FinalCta";
import HomeFooter from "@/components/home/HomeFooter";
import HomeHero from "@/components/home/HomeHero";
import HomeNav from "@/components/home/HomeNav";
import HomeShell from "@/components/home/HomeShell";
import HowItWorks from "@/components/home/HowItWorks";
import LogoMarquee from "@/components/home/LogoMarquee";
import Manifesto from "@/components/home/Manifesto";

export const metadata: Metadata = {
  title: "HashCase — Private, production-ready AI systems",
  description:
    "HashCase evaluates the best models for your use case, engineers the complete AI workflow, and deploys it inside your infrastructure — frontier AI for enterprises and governments without giving up control of their data.",
  openGraph: {
    title: "HashCase — Private, production-ready AI systems",
    description:
      "Frontier AI, deployed inside your infrastructure. Model evaluation, workflow engineering and on-prem deployment for enterprises and governments.",
    type: "website",
  },
};

export default function Home() {
  return (
    <HomeShell className="hc-bg-landing">
      {/* Ambient: fine grid + two soft brand washes, top only */}
      <div aria-hidden="true" className="hc-grid-bg pointer-events-none absolute inset-x-0 top-0 h-[1000px]" />
      <div aria-hidden="true" className="pointer-events-none absolute -top-[220px] right-20 h-[560px] w-[560px] rounded-full bg-[#E4DCFF] opacity-75 blur-[110px]" />
      <div aria-hidden="true" className="pointer-events-none absolute -right-[180px] top-40 h-[480px] w-[480px] rounded-full bg-[#D6E7FF] opacity-80 blur-[110px]" />

      <HomeNav />
      <main>
        <HomeHero />
        <LogoMarquee />
        <Manifesto />
        <HowItWorks />
        <Capabilities />
        <CaseStudies />
        <FinalCta />
      </main>
      <HomeFooter />
    </HomeShell>
  );
}
