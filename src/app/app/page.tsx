"use client";
import { Hero } from "@/components/Hero";
import Features from "@/components/Features";
import ExploreSection from "@/components/ExploreSection";
import "@mysten/dapp-kit/dist/index.css";

export default function Home() {
  return (
    <div className="bg-[#00041F]">
      <Hero />
      <Features />
      <hr className="md:m-[100px] m-[20px] bg-gradient-to-r from-transparent via-white to-transparent opacity-20" />
      <ExploreSection />
    </div>
  );
}
