import Link from "next/link";
import HomeNav from "@/components/home/HomeNav";
import HomeShell from "@/components/home/HomeShell";
import { FOOTER } from "@/components/home/content";

/** Shared navbar plus a slim footer, used on /careers and every job page. */
export default function CareersChrome({ children }: { children: React.ReactNode }) {
  return (
    <HomeShell className="flex flex-col">
      <div aria-hidden="true" className="pointer-events-none absolute -top-[180px] left-[30%] h-[560px] w-[560px] rounded-full bg-[#E4DCFF] opacity-70 blur-[110px]" />

      <div className="w-full">
        <HomeNav />
      </div>

      <main className="relative z-[2] flex-1">{children}</main>

      <footer className="relative z-[2] mx-auto flex w-full max-w-[1080px] flex-wrap justify-between gap-3 border-t border-[#E3E4E8] px-4 pb-10 pt-6 text-[13px] text-[#5B6170] sm:px-8">
        <span>{FOOTER.copyright}</span>
        <Link href="/" className="text-[#5B6170] hover:text-[#0E1116]">
          hashcase website
        </Link>
      </footer>
    </HomeShell>
  );
}
