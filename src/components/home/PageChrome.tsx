import { cn } from "@/components/lib/utils";
import HomeFooter from "./HomeFooter";
import HomeNav from "./HomeNav";
import HomeShell from "./HomeShell";

/**
 * New-site navbar and footer for standalone marketing pages (/poc, 404).
 * The `data-hc-chrome="none"` marker tells globals.css to hide the legacy app
 * Navbar/Footer that LayoutChrome renders, which matters on routes it can't
 * recognise by path (the 404 page).
 */
export default function PageChrome({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <HomeShell className={cn("flex flex-col", className)}>
      <span data-hc-chrome="none" hidden />
      <div aria-hidden="true" className="hc-grid-bg pointer-events-none absolute inset-x-0 top-0 h-[760px]" />
      <div aria-hidden="true" className="pointer-events-none absolute -top-[200px] right-10 h-[520px] w-[520px] rounded-full bg-[#E4DCFF] opacity-70 blur-[110px]" />
      <div aria-hidden="true" className="pointer-events-none absolute -left-[160px] top-48 h-[440px] w-[440px] rounded-full bg-[#D6E7FF] opacity-80 blur-[110px]" />

      <div className="w-full">
        <HomeNav />
      </div>

      <main className="relative z-[2] flex-1">{children}</main>

      <HomeFooter />
    </HomeShell>
  );
}
