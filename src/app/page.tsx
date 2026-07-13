import type { Metadata } from "next";
import BuildOnIt from "@/components/landing/BuildOnIt";
import CapabilityMarquee from "@/components/landing/CapabilityMarquee";
import FinalCTA from "@/components/landing/FinalCTA";
import Hero from "@/components/landing/Hero";
import HowItWorks from "@/components/landing/HowItWorks";
import LandingFooter from "@/components/landing/LandingFooter";
import StackGrid from "@/components/landing/StackGrid";
import { Navbar } from "@/components/Navbar";
import WhyUs from "@/components/landing/WhyUs";

export const metadata: Metadata = {
  title: "HashCase — We built the AI stack. You build anything on it.",
  description:
    "HashCase is a B2B AI company with a ready-to-use AI stack: agents, assistants, content engines, document intelligence, and automations that plug into your business. Live in days, not months.",
  openGraph: {
    title: "HashCase — We built the AI stack. You build anything on it.",
    description:
      "Agents, assistants, content engines, and automations out of the box — ready to plug into your business.",
    type: "website",
  },
};

export default function Home() {
  return (
    <div className="min-h-screen overflow-x-clip bg-ink text-white">
      <Navbar />
      <main>
        <Hero />
        <CapabilityMarquee />
        <StackGrid />
        <BuildOnIt />
        <HowItWorks />
        <WhyUs />
        <FinalCTA />
      </main>
      <LandingFooter />
    </div>
  );
}
