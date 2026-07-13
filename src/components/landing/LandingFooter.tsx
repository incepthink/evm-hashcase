import Link from "next/link";
import { Mail } from "lucide-react";
import { BRAND, CONTACT_EMAIL, FOOTER } from "./content";

export default function LandingFooter() {
  return (
    <footer className="border-t border-white/10 px-5 py-14 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-lg font-semibold tracking-tight text-white">
              {BRAND}
            </p>
            <p className="mt-2 text-sm text-white/45">{FOOTER.descriptor}</p>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="mt-4 inline-flex items-center gap-2 rounded-md text-sm text-white/60 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-violet"
            >
              <Mail size={15} />
              {CONTACT_EMAIL}
            </a>
          </div>

          <nav aria-label="Footer" className="flex gap-12">
            <ul className="space-y-3">
              {FOOTER.links.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="rounded-md text-sm text-white/50 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-violet"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
            <ul className="space-y-3">
              {FOOTER.legal.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="rounded-md text-sm text-white/50 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-violet"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-12 border-t border-white/5 pt-6">
          <p className="text-xs text-white/35">
            © {new Date().getFullYear()} {BRAND}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
