"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/components/lib/utils";
import { EVALUATE_HREF, NAV_LINKS } from "./content";
import { ArrowRight, CloseIcon, MenuIcon } from "./icons";

export default function HomeNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname() ?? "/";
  const isActive = (link: (typeof NAV_LINKS)[number]) =>
    "match" in link && pathname.startsWith(link.match);

  return (
    <header className="relative z-[5] mx-auto max-w-[1280px] px-4 py-4 sm:px-8 sm:py-[22px]">
      <div className="flex items-center justify-between gap-6">
        <Link
          href="/"
          aria-label="HashCase home"
          className="flex items-center rounded-2xl bg-[#0E1116] px-3.5 py-2.5 shadow-[0_14px_30px_-16px_rgba(14,17,22,.6)] sm:px-[18px] sm:py-3"
        >
          <Image
            src="/landing/hashcase-logo-white.png"
            alt="HashCase"
            width={640}
            height={120}
            priority
            className="block h-5 w-auto sm:h-6"
          />
        </Link>

        <nav
          aria-label="Main"
          className="hc-glass hidden items-center gap-1 rounded-full p-1.5 lg:flex"
        >
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              aria-current={isActive(link) ? "page" : undefined}
              className={cn(
                "flex items-center gap-2 rounded-full px-4 py-2.5 text-[15px] transition-colors",
                isActive(link)
                  ? "bg-[#0E1116] font-semibold text-white"
                  : "font-medium hover:bg-white/80",
              )}
            >
              {link.label}
              {"badge" in link && (
                <span
                  className={cn(
                    "hc-m rounded-full px-[7px] py-0.5 text-[11px]",
                    isActive(link) ? "bg-white/[.18] text-white" : "bg-[#E6EEFF] text-[#1A4FC0]",
                  )}
                >
                  {link.badge}
                </span>
              )}
            </a>
          ))}
        </nav>

        <a
          href={EVALUATE_HREF}
          className="hc-btn hidden items-center gap-2.5 rounded-full bg-[#0E1116] px-5 py-[13px] text-[15px] font-semibold text-white sm:flex"
        >
          Evaluate your use case <ArrowRight />
        </a>

        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="home-mobile-menu"
          onClick={() => setOpen((o) => !o)}
          className="flex h-11 w-11 items-center justify-center rounded-[14px] border border-[#E3E4E8] bg-white lg:hidden"
        >
          {open ? <CloseIcon /> : <MenuIcon />}
        </button>
      </div>

      {open && (
        <nav
          id="home-mobile-menu"
          aria-label="Main"
          className="hc-glass mt-3 flex flex-col gap-1 rounded-3xl p-2 lg:hidden"
        >
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={() => setOpen(false)}
              aria-current={isActive(link) ? "page" : undefined}
              className={cn(
                "flex items-center justify-between rounded-2xl px-4 py-3.5 text-base hover:bg-white/80",
                isActive(link) ? "font-semibold" : "font-medium",
              )}
            >
              {link.label}
              {"badge" in link && (
                <span className="hc-m rounded-full bg-[#E6EEFF] px-[7px] py-0.5 text-[11px] text-[#1A4FC0]">
                  {link.badge}
                </span>
              )}
            </a>
          ))}
          <a
            href={EVALUATE_HREF}
            className="mt-1 flex items-center justify-center gap-2.5 rounded-full bg-[#0E1116] px-5 py-4 text-base font-semibold text-white sm:hidden"
          >
            Evaluate your use case <ArrowRight />
          </a>
        </nav>
      )}
    </header>
  );
}
