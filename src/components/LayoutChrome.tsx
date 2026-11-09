"use client";
import { usePathname } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import Footer from "@/components/Footer";
import WalletConnectionModal from "@/components/WalletConnectionModal";

export default function LayoutChrome({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLanding = pathname === "/";
  const hideChrome =
    isLanding ||
    pathname?.startsWith("/careers") ||
    pathname?.startsWith("/case-studies") ||
    pathname === "/poc" ||
    pathname?.startsWith("/quests") ||
    pathname?.startsWith("/examples/e-commerce");

  return (
    <>
      {/* .hc-legacy-chrome is hidden by globals.css on pages that render the new
          site chrome themselves but can't be matched by path (the 404 page). */}
      {!hideChrome && (
        <div className="hc-legacy-chrome contents">
          <Navbar />
        </div>
      )}
      {children}
      {!hideChrome && (
        <div className="hc-legacy-chrome contents">
          <Footer />
        </div>
      )}
      <WalletConnectionModal />
    </>
  );
}
