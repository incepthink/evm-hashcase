"use client";
import { usePathname } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function LayoutChrome({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const hideChrome =
    pathname?.startsWith("/quests") ||
    pathname?.startsWith("/examples/e-commerce");

  return (
    <>
      {!hideChrome && <Navbar />}
      {children}
      {!hideChrome && <Footer />}
    </>
  );
}
