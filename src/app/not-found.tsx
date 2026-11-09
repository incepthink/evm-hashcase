import type { Metadata } from "next";
import Link from "next/link";
import PageChrome from "@/components/home/PageChrome";
import { ArrowRight } from "@/components/home/icons";

export const metadata: Metadata = {
  title: "Page not found — HashCase",
};

export default function NotFound() {
  return (
    <PageChrome>
      <section className="relative mx-auto flex min-h-[62vh] max-w-[1280px] flex-col items-start justify-center gap-6 px-4 py-16 sm:px-8">
        <span className="hc-m rounded-full border border-[#D8D9DE] bg-white/70 px-3 py-1.5 text-[12px] text-[#3D4350]">
          Error 404
        </span>
        <h1 className="hc-d m-0 max-w-[760px] text-[44px] font-extrabold leading-[.96] tracking-[-0.04em] sm:text-[64px] lg:text-[80px]">
          This page <span className="hc-grad-text">doesn&apos;t exist</span>.
        </h1>
        <p className="m-0 max-w-[560px] text-lg leading-[1.55] text-[#3D4350]">
          The link may be old, or the address may have a typo. Everything we&apos;ve built is a click away from the
          homepage.
        </p>
        <div className="flex flex-wrap gap-3 pt-2">
          <Link
            href="/"
            className="hc-btn flex items-center gap-2.5 rounded-full bg-[#0E1116] px-5 py-[13px] text-[15px] font-semibold text-white"
          >
            Go to homepage <ArrowRight />
          </Link>
          <Link
            href="/poc"
            className="flex items-center gap-2.5 rounded-full border border-[#D8D9DE] bg-white px-5 py-[13px] text-[15px] font-semibold transition-colors hover:border-[#0E1116]"
          >
            Browse proof-of-concepts
          </Link>
        </div>
      </section>
    </PageChrome>
  );
}
