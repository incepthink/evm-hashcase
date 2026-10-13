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
    pathname?.startsWith("/quests") ||
    pathname?.startsWith("/examples/e-commerce");

  return (
    <>
      {!hideChrome && <Navbar />}
      {children}
      {!hideChrome && <Footer />}
      <WalletConnectionModal />
    </>
  );
}
