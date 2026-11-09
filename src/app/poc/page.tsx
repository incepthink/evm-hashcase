import type { Metadata } from "next";
import PageChrome from "@/components/home/PageChrome";
import PocGallery from "@/components/poc/PocGallery";
import { POCS } from "@/components/poc/pocs";

export const metadata: Metadata = {
  title: "Proof-of-concepts — HashCase",
  description:
    "Live HashCase proof-of-concepts — IP royalties, digital twins, governance, tokenized real estate and data, medical records, credentials and more. Each one is a working demo you can open and try.",
};

export default function PocPage() {
  return (
    <PageChrome>
      <section className="relative mx-auto flex max-w-[1280px] flex-col gap-[22px] px-4 pb-10 pt-8 sm:px-8 sm:pt-12">
        <span className="hc-m w-fit rounded-full border border-[#D8D9DE] bg-white/70 px-3 py-1.5 text-[12px] text-[#3D4350]">
          {POCS.length} live demos
        </span>
        <h1 className="hc-d m-0 max-w-[900px] text-[40px] font-extrabold leading-[.96] tracking-[-0.04em] sm:text-[56px] lg:text-[72px]">
          Proof-of-concepts you can <span className="hc-grad-text">click through</span>.
        </h1>
        <p className="m-0 max-w-[680px] text-lg leading-[1.55] text-[#3D4350] sm:text-[19px]">
          Working demos we have built on HashCase, from IP royalties and digital twins to medical records and token
          sales. Open any of them and use it the way a customer would.
        </p>
      </section>

      <section className="relative mx-auto max-w-[1280px] px-4 pb-24 sm:px-8">
        <PocGallery />
      </section>
    </PageChrome>
  );
}
