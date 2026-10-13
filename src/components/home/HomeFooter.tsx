import Image from "next/image";
import Link from "next/link";
import { CONTACT_EMAIL, CONTACT_HREF, FOOTER, X_URL } from "./content";

const heading = "text-sm font-semibold text-[#8D95A5]";
const link = "text-[15px] text-white transition-colors hover:text-[#9EC0FF]";

export default function HomeFooter() {
  return (
    <footer className="relative z-[2] bg-[#0E1116] pb-12 text-white">
      <div className="mx-auto flex max-w-[1280px] flex-col gap-14 border-t border-[#262D38] px-4 pt-14 sm:px-8">
        <div className="flex flex-wrap justify-between gap-12">
          <div className="flex max-w-[320px] flex-col gap-[18px]">
            <Image
              src="/landing/hashcase-logo-white.png"
              alt="HashCase"
              width={640}
              height={120}
              className="h-[30px] w-auto self-start"
            />
            <p className="m-0 text-[15px] leading-[1.55] text-[#B7BECB]">{FOOTER.descriptor}</p>
          </div>

          <div className="flex flex-wrap gap-12 sm:gap-16">
            <nav aria-label="Company" className="flex flex-col gap-3">
              <span className={heading}>Company</span>
              {FOOTER.company.map((l) => (
                <a key={l.label} href={l.href} className={link}>
                  {l.label}
                </a>
              ))}
            </nav>
            <div className="flex flex-col gap-3">
              <span className={heading}>Deploy</span>
              {FOOTER.deploy.map((d) => (
                <span key={d} className="text-[15px]">
                  {d}
                </span>
              ))}
            </div>
            <div className="flex flex-col gap-3">
              <span className={heading}>Contact</span>
              <a href={CONTACT_HREF} className={link}>
                {CONTACT_EMAIL}
              </a>
              <a href={X_URL} target="_blank" rel="noopener noreferrer" className={link}>
                X
              </a>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap justify-between gap-4 text-[13px] text-[#8D95A5]">
          <span>{FOOTER.copyright}</span>
          <div className="flex gap-5">
            {FOOTER.legal.map((l) => (
              <Link key={l.label} href={l.href} className="transition-colors hover:text-white">
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
